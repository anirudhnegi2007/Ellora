import { NextResponse } from "next/server";
import { handleApiError, validationError } from "@/lib/errors";
import { getRazorpayInstance } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { calculateOrderTotals } from "@/lib/pricing";
import { validateCoupon } from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";

const IS_VALID_OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = checkoutSchema.parse(body);

    if (!input.items || input.items.length === 0) {
      throw validationError("Cart is empty");
    }

    // 1. Fetch products with valid ObjectIds from DB
    const validProductIds = input.items
      .map((i) => i.productId)
      .filter((id) => IS_VALID_OBJECT_ID.test(id));

    let dbProducts: Array<{ id: string; price: number; inventory: number; name: string }> = [];
    if (validProductIds.length > 0) {
      dbProducts = await db.product.findMany({
        where: { id: { in: validProductIds } },
      });
    }

    // Calculate subtotal safely
    let subtotal = 0;
    for (const item of input.items) {
      const dbProd = dbProducts.find((p) => p.id === item.productId);
      if (dbProd) {
        if (dbProd.inventory < item.quantity) {
          throw validationError(`Insufficient stock for ${dbProd.name}`);
        }
        subtotal += dbProd.price * item.quantity;
      } else {
        subtotal += item.price * item.quantity;
      }
    }

    // Calculate coupon discount
    let discount = 0;
    if (input.couponCode) {
      const coupon = await validateCoupon(input.couponCode, subtotal);
      discount = coupon.discountAmount;
    }

    const totals = calculateOrderTotals(subtotal, discount);
    const currency = process.env.NEXT_PUBLIC_CURRENCY || "INR";
    const amountInSubunits = Math.round(totals.total * 100);

    // 2. Initialize Razorpay and create order
    const razorpay = getRazorpayInstance();
    const receipt = `rcpt_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInSubunits,
      currency: currency,
      receipt: receipt,
      notes: {
        customerEmail: input.email,
        customerName: input.name,
      },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      totalAmount: totals.total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
