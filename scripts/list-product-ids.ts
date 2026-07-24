import { db } from "../src/lib/db";

async function listProducts() {
  const total = await db.product.count();
  const products = await db.product.findMany({
    select: { id: true, name: true, price: true },
  });

  console.log(`Total Products in Database: ${total}`);
  console.log(JSON.stringify(products, null, 2));
  await db.$disconnect();
}

listProducts();
