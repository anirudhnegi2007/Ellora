import { createOrder } from "../src/services/order.service";

async function testCreateOrder() {
  console.log("Testing order creation service with mock item ID '1'...");

  const testInput = {
    email: "test@example.com",
    name: "John Tester",
    address: "123 Test Street",
    city: "Mumbai",
    zip: "400001",
    items: [
      {
        productId: "1", // Mock ID
        quantity: 1,
        price: 149,
      },
    ],
  };

  const order = await createOrder(testInput, undefined, {
    paymentStatus: "PAID",
    razorpayOrderId: "order_test_123",
    razorpayPaymentId: "pay_test_123",
    razorpaySignature: "sig_test_123",
  });

  console.log("✅ ORDER CREATED SUCCESSFULLY IN DATABASE!");
  console.log("Order ID:", order.id);
  console.log("Status:", order.status);
  console.log("Payment Status:", order.paymentStatus);
  console.log("Total:", order.total);
}

testCreateOrder().catch((err) => {
  console.error("❌ ORDER CREATION FAILED:");
  console.error(err);
  process.exit(1);
});
