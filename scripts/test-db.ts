import { db } from "../src/lib/db";

async function testConnection() {
  console.log("Connecting to MongoDB database via Prisma...");

  const categoriesCount = await db.category.count();
  const productsCount = await db.product.count();
  const ordersCount = await db.order.count();

  console.log("\n✅ PRISMA MONGODB CONNECTION SUCCESSFUL!");
  console.log("---------------------------------------");
  console.log(`Categories in DB: ${categoriesCount}`);
  console.log(`Products in DB:   ${productsCount}`);
  console.log(`Orders in DB:     ${ordersCount}`);
  console.log("---------------------------------------\n");

  await db.$disconnect();
}

testConnection().catch((err) => {
  console.error("\n❌ PRISMA CONNECTION FAILED:");
  console.error(err);
  process.exit(1);
});
