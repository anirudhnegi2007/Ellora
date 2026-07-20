import { getRazorpayInstance } from "../src/lib/razorpay";
import { db } from "../src/lib/db";

async function testRazorpay() {
  console.log("Testing Razorpay credentials and API initialization...");
  
  console.log("Key ID:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
  console.log("Key Secret exists:", !!process.env.RAZORPAY_KEY_SECRET);

  const razorpay = getRazorpayInstance();
  
  console.log("Creating test Razorpay order...");
  const razorpayOrder = await razorpay.orders.create({
    amount: 10000, // 100 INR in paise
    currency: "INR",
    receipt: `rcpt_test_${Date.now()}`,
    notes: {
      test: "true",
    },
  });

  console.log("✅ RAZORPAY ORDER CREATED SUCCESSFULLY!");
  console.log("Order ID:", razorpayOrder.id);
  console.log("Amount:", razorpayOrder.amount);
  console.log("Currency:", razorpayOrder.currency);
}

testRazorpay().catch((err) => {
  console.error("❌ RAZORPAY TEST ERROR:");
  console.error(err);
  process.exit(1);
});
