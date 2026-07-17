import { db } from "@/lib/db";
import { calculateOrderTotals } from "@/lib/pricing";
import { ApiError, notFound, validationError } from "@/lib/errors";
import type { CheckoutInput } from "@/validations/order.schema";
import type { Order } from "@/types";

function mapOrder(order: {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  discount: number;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  couponCode: string | null;
  createdAt: Date;
  items: {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { name: string; image: string };
  }[];
}): Order {
  return {
    id: order.id,
    status: order.status as Order["status"],
    subtotal: order.subtotal,
    tax: order.tax,
    shipping: order.shipping,
    total: order.total,
    discount: order.discount,
    email: order.email,
    shippingName: order.shippingName,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingZip: order.shippingZip,
    couponCode: order.couponCode,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.image,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

export async function createOrder(
  input: CheckoutInput,
  userId?: string
): Promise<Order> {
  const productIds = input.items.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    throw notFound("One or more products not found");
  }

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    if (product.inventory < item.quantity) {
      throw new ApiError(
        400,
        "INSUFFICIENT_INVENTORY",
        `Insufficient inventory for ${product.name}`
      );
    }
  }

  let discount = 0;
  if (input.couponCode) {
    const coupon = await validateCoupon(input.couponCode, input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    ));
    discount = coupon.discountAmount;
  }

  const subtotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totals = calculateOrderTotals(subtotal, discount);

  const order = await db.$transaction(async (tx) => {
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    if (input.couponCode) {
      await tx.coupon.update({
        where: { code: input.couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    return tx.order.create({
      data: {
        userId,
        email: input.email,
        shippingName: input.name,
        shippingAddress: input.address,
        shippingCity: input.city,
        shippingZip: input.zip,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        discount: totals.discount,
        couponCode: input.couponCode?.toUpperCase(),
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true, image: true } } },
        },
      },
    });
  });

  return mapOrder(order);
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true, image: true } } },
      },
    },
  });

  return orders.map(mapOrder);
}

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    throw validationError("Invalid coupon code");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw validationError("Coupon has expired");
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw validationError("Coupon usage limit reached");
  }

  if (subtotal < coupon.minOrderValue) {
    throw validationError(
      `Minimum order value of $${coupon.minOrderValue.toFixed(2)} required`
    );
  }

  const discountAmount =
    coupon.discountType === "PERCENTAGE"
      ? subtotal * (coupon.discountValue / 100)
      : coupon.discountValue;

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.min(discountAmount, subtotal),
  };
}
