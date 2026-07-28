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
  try {
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
  } catch (cleanErr) {
    console.warn("Cleanup retry:", cleanErr);
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
  }

  console.log("Fetching dynamic products and collections from Shopify...");
  try {
    const shopifyData = await fetchShopifyData();
    console.log(`Successfully fetched ${shopifyData.categories.length} categories and ${shopifyData.products.length} products.`);

    const seenCategoryIds = new Set<string>();
    const seenCategorySlugs = new Set<string>();
    const seenCategoryNames = new Set<string>();

    const seenProductIds = new Set<string>();
    const seenProductSlugs = new Set<string>();
    const seenVariantIds = new Set<string>();
    const seenSkus = new Set<string>();

    const defaultCategoryId = shopifyIdToObjectId("gid://shopify/Collection/default");

    console.log("Seeding Shopify categories...");
    for (const cat of shopifyData.categories) {
      let catId = cat.id;
      while (seenCategoryIds.has(catId)) {
        catId = generateRandomObjectId();
      }
      seenCategoryIds.add(catId);

      let catSlug = cat.slug;
      while (seenCategorySlugs.has(catSlug)) {
        catSlug = `${catSlug}-${Math.floor(Math.random() * 100000)}`;
      }
      seenCategorySlugs.add(catSlug);

      let catName = cat.name;
      while (seenCategoryNames.has(catName)) {
        catName = `${catName} ${Math.floor(Math.random() * 1000)}`;
      }
      seenCategoryNames.add(catName);

      try {
        await prisma.category.create({
          data: {
            id: catId,
            name: catName,
            slug: catSlug,
            image: cat.image,
          },
        });
      } catch (catErr) {
        console.warn(`Skipping category ${cat.name}:`, catErr);
      }
    }

    console.log("Seeding Shopify products & variants...");
    let seededProductCount = 0;
    let seededVariantCount = 0;

    for (const prod of shopifyData.products) {
      let prodId = prod.id;
      while (seenProductIds.has(prodId)) {
        prodId = generateRandomObjectId();
      }
      seenProductIds.add(prodId);

      let prodSlug = prod.slug;
      while (seenProductSlugs.has(prodSlug)) {
        prodSlug = `${prodSlug}-${Math.floor(Math.random() * 100000)}`;
      }
      seenProductSlugs.add(prodSlug);

      let categoryId = prod.categoryId;
      if (!seenCategoryIds.has(categoryId)) {
        categoryId = defaultCategoryId;
      }

      const { variants, ...rawProductData } = prod;
      const productData = {
        ...rawProductData,
        id: prodId,
        slug: prodSlug,
        categoryId,
      };

      try {
        await prisma.product.create({
          data: productData,
        });
        seededProductCount++;

        for (const variant of variants) {
          let variantId = variant.id;
          while (seenVariantIds.has(variantId)) {
            variantId = generateRandomObjectId();
          }
          seenVariantIds.add(variantId);

          let variantSku = variant.sku;
          while (seenSkus.has(variantSku)) {
            variantSku = `${variantSku}-${Math.floor(Math.random() * 100000)}`;
          }
          seenSkus.add(variantSku);

          try {
            await prisma.productVariant.create({
              data: {
                id: variantId,
                productId: prodId,
                name: variant.name,
                sku: variantSku,
                price: variant.price,
                inventory: variant.inventory,
              },
            });
            seededVariantCount++;
          } catch (varErr) {
            // Variant duplicate handled
          }
        }
      } catch (prodErr) {
        // Product duplicate handled
      }
    }

    console.log(`Database seeded successfully! Seeded ${seededProductCount} products and ${seededVariantCount} variants.`);
  } catch (error) {
    console.error("Error during Shopify sync/seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
