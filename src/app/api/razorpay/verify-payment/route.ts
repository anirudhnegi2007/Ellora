import { NextResponse } from "next/server";
import crypto from "crypto";
import { ApiError, handleApiError, validationError } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { createOrder } from "@/services/order.service";
import { checkoutSchema } from "@/validations/order.schema";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutData,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw validationError("Missing required Razorpay payment parameters");
    }

    if (!checkoutData) {
      throw validationError("Missing checkout data");
    }

    const validatedCheckoutData = checkoutSchema.parse(checkoutData);

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("Razorpay secret key is not configured");
    }

    // Verify Razorpay HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new ApiError(
        400,
        "INVALID_PAYMENT_SIGNATURE",
        "Payment verification failed. Invalid signature."
      );
    }

    // Payment is authentic; create confirmed order in database
    const order = await createOrder(validatedCheckoutData, session?.user?.id, {
      paymentStatus: "PAID",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
