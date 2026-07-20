import { db } from "../src/lib/db";

async function run() {
  try {
    console.log("Testing db.product.findMany with non-ObjectId string '1'...");
    const res = await db.product.findMany({
      where: { id: { in: ["1"] } },
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("EXACT ERROR THROWN BY PRISMA:");
    console.error(err);
  }
}

run();
