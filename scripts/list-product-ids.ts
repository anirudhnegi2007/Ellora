import { db } from "../src/lib/db";

async function listProducts() {
  const products = await db.product.findMany({
    take: 5,
    select: { id: true, name: true, price: true },
  });

  console.log("Sample Products in Database:");
  console.log(JSON.stringify(products, null, 2));
  await db.$disconnect();
}

listProducts();
