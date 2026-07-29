import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking and updating product inventory levels...");

  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, inventory: true },
  });

  console.log(`Found ${allProducts.length} products in database.`);

  let updatedCount = 0;
  for (const p of allProducts) {
    if (typeof p.inventory !== "number" || p.inventory <= 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: { inventory: 50 },
      });
      console.log(`✅ Set inventory=50 for "${p.name}" (ID: ${p.id})`);
      updatedCount++;
    } else {
      console.log(`ℹ️ Product "${p.name}" already has inventory = ${p.inventory}`);
    }
  }

  console.log(`\nInventory update finished! ${updatedCount} products updated.`);
}

main()
  .catch((e) => {
    console.error("Error updating inventory:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
