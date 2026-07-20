import { PrismaClient } from "@prisma/client";
import { fetchShopifyData, shopifyIdToObjectId } from "../src/services/shopify.service";

const prisma = new PrismaClient();

function generateRandomObjectId(): string {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function main() {
  console.log("Cleaning database...");
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});

  console.log("Fetching dynamic products and collections from Shopify...");
  try {
    const shopifyData = await fetchShopifyData();
    console.log(`Successfully fetched ${shopifyData.categories.length} categories and ${shopifyData.products.length} products.`);

    const seenCategoryIds = new Set<string>();
    const seenProductIds = new Set<string>();
    const seenVariantIds = new Set<string>();
    const seenSkus = new Set<string>();

    const defaultCategoryId = shopifyIdToObjectId("gid://shopify/Collection/default");

    console.log("Seeding Shopify categories...");
    for (const cat of shopifyData.categories) {
      if (seenCategoryIds.has(cat.id)) continue;
      seenCategoryIds.add(cat.id);

      await prisma.category.create({
        data: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
        },
      });
    }

    console.log("Seeding Shopify products & variants...");
    for (const prod of shopifyData.products) {
      if (seenProductIds.has(prod.id)) continue;
      seenProductIds.add(prod.id);

      // Verify categoryId exists
      if (!seenCategoryIds.has(prod.categoryId)) {
        prod.categoryId = defaultCategoryId;
      }

      const { variants, ...productData } = prod;
      
      await prisma.product.create({
        data: productData,
      });

      // Seed variants for this product
      for (const variant of variants) {
        let variantId = variant.id;
        if (seenVariantIds.has(variantId)) {
          variantId = generateRandomObjectId();
        }
        seenVariantIds.add(variantId);

        let variantSku = variant.sku;
        if (seenSkus.has(variantSku)) {
          variantSku = `${variantSku}-${Math.floor(Math.random() * 10000)}`;
        }
        seenSkus.add(variantSku);

        await prisma.productVariant.create({
          data: {
            id: variantId,
            productId: prod.id,
            name: variant.name,
            sku: variantSku,
            price: variant.price,
            inventory: variant.inventory,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error during Shopify sync/seed:", error);
    throw error;
  }

  console.log("Seeding coupons...");
  const couponsData = [
    {
      id: "64a0f443b7e77a28e8267231",
      code: "SUMMER10",
      discountType: "PERCENTAGE" as const,
      discountValue: 10,
      minOrderValue: 50,
      isActive: true
    },
    {
      id: "64a0f443b7e77a28e8267232",
      code: "WELCOME5",
      discountType: "FIXED" as const,
      discountValue: 5,
      minOrderValue: 20,
      isActive: true
    }
  ];

  for (const coupon of couponsData) {
    await prisma.coupon.create({
      data: coupon,
    });
  }

  console.log("Database seeded successfully with Shopify data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
