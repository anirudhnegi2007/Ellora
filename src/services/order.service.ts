import { db } from "@/lib/db";
import { calculateOrderTotals } from "@/lib/pricing";
import { ApiError, notFound, validationError } from "@/lib/errors";
import type { CheckoutInput } from "@/validations/order.schema";
import type { Order } from "@/types";

const IS_VALID_OBJECT_ID = /^[0-9a-fA-F]{24}$/;

function generateObjectId(): string {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function mapOrder(order: {
  id: string;
  status: string;
  paymentStatus: string;
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
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: Date;
  items: {
    id: string;
    productId?: string | null;
    quantity: number;
    price: number;
    product?: { name: string; image: string } | null;
  }[];
}): Order {
  return {
    id: order.id,
    status: order.status as Order["status"],
    paymentStatus: order.paymentStatus as Order["paymentStatus"],
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
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId ?? "",
      productName: item.product?.name ?? "Purchased Item",
      productImage: item.product?.image ?? "/placeholder.png",
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

export interface CreateOrderPaymentDetails {
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export async function createOrder(
  input: CheckoutInput,
  userId?: string,
  paymentDetails?: CreateOrderPaymentDetails
): Promise<Order> {
  const validProductIds = input.items
    .map((i) => i.productId)
    .filter((id) => IS_VALID_OBJECT_ID.test(id));

  let products: Array<{ id: string; name: string; price: number; inventory: number }> = [];
  if (validProductIds.length > 0) {
    products = await db.product.findMany({
      where: { id: { in: validProductIds } },
    });
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
      if (IS_VALID_OBJECT_ID.test(item.productId)) {
        const dbProd = products.find((p) => p.id === item.productId);
        if (dbProd) {
          await tx.product.update({
            where: { id: item.productId },
            data: { inventory: { decrement: item.quantity } },
          });
        }
      }
    }

    if (input.couponCode) {
      await tx.coupon.update({
        where: { code: input.couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    return tx.order.create({
      data: {
        id: generateObjectId(),
        user: userId ? { connect: { id: userId } } : undefined,
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
        couponCode: input.couponCode?.toUpperCase() ?? null,
        status: paymentDetails?.paymentStatus === "PAID" ? "CONFIRMED" : "PENDING",
        paymentStatus: paymentDetails?.paymentStatus ?? "PENDING",
        razorpayOrderId: paymentDetails?.razorpayOrderId ?? null,
        razorpayPaymentId: paymentDetails?.razorpayPaymentId ?? null,
        razorpaySignature: paymentDetails?.razorpaySignature ?? null,
        items: {
          create: input.items.map((item) => ({
            id: generateObjectId(),
            product: IS_VALID_OBJECT_ID.test(item.productId) && products.some((p) => p.id === item.productId)
              ? { connect: { id: item.productId } }
              : undefined,
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
