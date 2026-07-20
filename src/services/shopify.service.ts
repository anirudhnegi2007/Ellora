import { createHash } from "crypto";

// Environment variables
const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "mock.shop";
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-04";

/**
 * Converts a Shopify GID (e.g., gid://shopify/Product/12345) to a deterministic 24-character hex string (ObjectId).
 * This ensures relations stay intact across multiple sync runs.
 */
export function shopifyIdToObjectId(shopifyId: string): string {
  if (!shopifyId) {
    // Return a random-like but valid ObjectId if empty
    return createHash("sha256").update(Math.random().toString()).digest("hex").substring(0, 24);
  }
  return createHash("sha256").update(shopifyId).digest("hex").substring(0, 24);
}

// Shopify Storefront GraphQL Query
const SHOPIFY_SYNC_QUERY = `
  query GetProductsAndCollections {
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
          image {
            url
          }
        }
      }
    }
    products(first: 100) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          featuredImage {
            url
          }
          priceRange {
            minVariantPrice {
              amount
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                sku
                price {
                  amount
                }
                quantityAvailable
              }
            }
          }
        }
      }
    }
  }
`;

export interface ShopifyCollectionNode {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
  } | null;
}

export interface ShopifyVariantNode {
  id: string;
  title: string;
  sku?: string | null;
  price: {
    amount: string;
  };
  quantityAvailable?: number | null;
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  featuredImage?: {
    url: string;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
    };
  };
  collections: {
    edges: {
      node: {
        id: string;
        title: string;
        handle: string;
      };
    }[];
  };
  variants: {
    edges: {
      node: ShopifyVariantNode;
    }[];
  };
}

export interface ShopifySyncData {
  categories: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }[];
  products: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    image: string;
    details: string[];
    inventory: number;
    categoryId: string;
    variants: {
      id: string;
      name: string;
      sku: string;
      price: number;
      inventory: number;
    }[];
  }[];
}

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 * Falls back to mock.shop if SHOPIFY_STORE_DOMAIN is mock.shop or not configured.
 */
async function queryShopify(query: string, variables: Record<string, unknown> = {}) {
  const domain = SHOPIFY_STORE_DOMAIN.trim();
  const isMockShop = domain === "mock.shop" || domain.includes("mock.shop") || !domain;
  
  const endpoint = isMockShop
    ? "https://mock.shop/api"
    : `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isMockShop && SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    headers["X-Shopify-Storefront-Access-Token"] = SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  }

  console.log(`Fetching from Shopify Storefront API: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify API responded with status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

/**
 * Fetch and map products and collections from Shopify to MongoDB/Prisma compatible formats
 */
export async function fetchShopifyData(): Promise<ShopifySyncData> {
  try {
    const data = await queryShopify(SHOPIFY_SYNC_QUERY);
    
    const rawCollections: { node: ShopifyCollectionNode }[] = data.collections?.edges || [];
    const rawProducts: { node: ShopifyProductNode }[] = data.products?.edges || [];

    console.log(`Fetched ${rawCollections.length} collections and ${rawProducts.length} products from Shopify.`);

    // 1. Map Collections to Categories
    const categoriesMap = new Map<string, { id: string; name: string; slug: string; image: string | null }>();
    
    // Add default category in case a product has no collection
    const defaultCategoryId = shopifyIdToObjectId("gid://shopify/Collection/default");
    const defaultCategory = {
      id: defaultCategoryId,
      name: "General",
      slug: "general",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    };
    categoriesMap.set(defaultCategory.id, defaultCategory);

    for (const edge of rawCollections) {
      const col = edge.node;
      // Skip automatic smart collections that might be empty or meta
      if (col.handle === "all" || col.handle === "frontpage") continue;
      
      const id = shopifyIdToObjectId(col.id);
      categoriesMap.set(id, {
        id,
        name: col.title,
        slug: col.handle,
        image: col.image?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      });
    }

    // 2. Map Products & Variants
    const products = rawProducts.map((edge) => {
      const prod = edge.node;
      const id = shopifyIdToObjectId(prod.id);
      
      // Determine category (use first collection if exists, otherwise fallback to default General collection)
      let categoryId = defaultCategoryId;
      if (prod.collections?.edges && prod.collections.edges.length > 0) {
        const primaryCol = prod.collections.edges[0].node;
        categoryId = shopifyIdToObjectId(primaryCol.id);
        
        // If the collection wasn't added yet (sometimes shopify returns collections on products that aren't in the root query list), add it
        if (!categoriesMap.has(categoryId)) {
          categoriesMap.set(categoryId, {
            id: categoryId,
            name: primaryCol.title,
            slug: primaryCol.handle,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
          });
        }
      }

      // Map details / highlights
      const details = prod.tags && prod.tags.length > 0
        ? prod.tags.slice(0, 5) // Use tags as product highlights
        : [
            "Premium quality material",
            "Designed for reliability and style",
            "Ethically sourced and produced",
            "Easy maintenance and long-term durability",
          ];

      // Parse price
      const price = parseFloat(prod.priceRange?.minVariantPrice?.amount || "0");

      // Map variants
      const variants = (prod.variants?.edges || []).map((vEdge) => {
        const v = vEdge.node;
        const vId = shopifyIdToObjectId(v.id);
        const vPrice = parseFloat(v.price?.amount || prod.priceRange?.minVariantPrice?.amount || "0");
        const vInventory = v.quantityAvailable ?? 50; // Fallback inventory per variant
        
        return {
          id: vId,
          name: v.title,
          sku: v.sku || `${prod.handle}-${vId.substring(0, 6)}`,
          price: vPrice,
          inventory: vInventory,
        };
      });

      // Sum variants inventory
      const totalInventory = variants.length > 0
        ? variants.reduce((acc, curr) => acc + curr.inventory, 0)
        : 100;

      return {
        id,
        name: prod.title,
        slug: prod.handle,
        description: prod.description || `High-quality ${prod.title} sourced directly from Shopify.`,
        price,
        image: prod.featuredImage?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        details,
        inventory: totalInventory,
        categoryId,
        variants,
      };
    });

    return {
      categories: Array.from(categoriesMap.values()),
      products,
    };
  } catch (error) {
    console.error("Failed to fetch Shopify data:", error);
    throw error;
  }
}
