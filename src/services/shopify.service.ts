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

// Shopify Storefront GraphQL Queries
const SHOPIFY_COLLECTIONS_QUERY = `
  query GetCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
  }
`;

const SHOPIFY_PRODUCTS_QUERY = `
  query GetProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
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

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getShopifyToken(): Promise<{ token: string; headerName: string } | null> {
  const clientId = (process.env.SHOPIFY_CLIENT_ID || process.env.Client_ID || "").trim();
  const clientSecret = (process.env.SHOPIFY_CLIENT_SECRET || process.env.Client_Secret || "").trim();
  const domain = (process.env.SHOPIFY_STORE_DOMAIN || "mock.shop").trim();

  // 1. Client Credentials OAuth flow using Client_ID & Client_Secret
  if (clientId && clientSecret && domain && domain !== "mock.shop") {
    if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
      return { token: cachedAccessToken.token, headerName: "Shopify-Storefront-Private-Token" };
    }

    try {
      console.log(`Requesting OAuth Access Token from Shopify (${domain})...`);
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", clientId);
      params.append("client_secret", clientSecret);

      const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          const expiresInMs = (data.expires_in || 86400) * 1000 - 60000;
          cachedAccessToken = {
            token: data.access_token,
            expiresAt: Date.now() + expiresInMs,
          };
          console.log(`Successfully obtained Shopify Storefront Private Access Token (${data.access_token.substring(0, 10)}...)`);
          return { token: data.access_token, headerName: "Shopify-Storefront-Private-Token" };
        }
      } else {
        const errorText = await res.text();
        console.warn(`OAuth token request failed with status ${res.status}: ${errorText}`);
      }
    } catch (err: any) {
      console.warn(`Failed to obtain OAuth access token: ${err?.message || err}`);
    }
  }

  // 2. Direct env token fallback if set
  const envToken = (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "").trim();
  if (envToken) {
    if (envToken.startsWith("shpat_")) {
      return { token: envToken, headerName: "X-Shopify-Access-Token" };
    }
    if (envToken.startsWith("shpua_")) {
      return { token: envToken, headerName: "Shopify-Storefront-Private-Token" };
    }
    return { token: envToken, headerName: "X-Shopify-Storefront-Access-Token" };
  }

  return null;
}

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 * Falls back to mock.shop if SHOPIFY_STORE_DOMAIN fails (e.g. 401 Unauthorized) or is not configured.
 */
async function queryShopify(query: string, variables: Record<string, unknown> = {}) {
  const domain = SHOPIFY_STORE_DOMAIN.trim();
  const isMockShop = domain === "mock.shop" || domain.includes("mock.shop") || !domain;

  let endpoint = isMockShop
    ? "https://mock.shop/api"
    : `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isMockShop) {
    const auth = await getShopifyToken();
    if (auth) {
      if (auth.headerName === "X-Shopify-Access-Token") {
        endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
      }
      headers[auth.headerName] = auth.token;
    }
  }

  console.log(`Fetching from Shopify API: ${endpoint}`);

  try {
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
  } catch (error: any) {
    if (!isMockShop) {
      console.warn(`[Shopify Sync Warning] Failed to query custom domain (${endpoint}): ${error?.message || error}. Falling back to mock.shop API...`);
      const mockEndpoint = "https://mock.shop/api";
      const mockResponse = await fetch(mockEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });

      if (!mockResponse.ok) {
        const errText = await mockResponse.text();
        throw new Error(`mock.shop API responded with status ${mockResponse.status}: ${errText}`);
      }

      const mockResult = await mockResponse.json();
      if (mockResult.errors) {
        throw new Error(`mock.shop GraphQL errors: ${JSON.stringify(mockResult.errors)}`);
      }
      return mockResult.data;
    }
    throw error;
  }
}

/**
 * Fetch and map products and collections from Shopify to MongoDB/Prisma compatible formats using cursor pagination
 */
export async function fetchShopifyData(): Promise<ShopifySyncData> {
  try {
    const rawCollections: { node: ShopifyCollectionNode }[] = [];
    let hasNextCollection = true;
    let collectionCursor: string | null = null;

    console.log("Fetching collections from Shopify...");
    while (hasNextCollection) {
      const data = await queryShopify(SHOPIFY_COLLECTIONS_QUERY, { cursor: collectionCursor });
      const edges = data.collections?.edges || [];
      rawCollections.push(...edges);
      hasNextCollection = data.collections?.pageInfo?.hasNextPage || false;
      collectionCursor = data.collections?.pageInfo?.endCursor || null;
    }

    const rawProducts: { node: ShopifyProductNode }[] = [];
    let hasNextProduct = true;
    let productCursor: string | null = null;

    console.log("Fetching products from Shopify...");
    while (hasNextProduct) {
      const data = await queryShopify(SHOPIFY_PRODUCTS_QUERY, { cursor: productCursor });
      const edges = data.products?.edges || [];
      rawProducts.push(...edges);
      hasNextProduct = data.products?.pageInfo?.hasNextPage || false;
      productCursor = data.products?.pageInfo?.endCursor || null;
    }

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
      const variants = (prod.variants?.edges || []).map((vEdge, vIdx) => {
        const v = vEdge.node;
        const rawId = v.id ? `${prod.id}_${v.id}` : `${prod.id}_var_${vIdx}`;
        const vId = shopifyIdToObjectId(rawId);
        const vPrice = parseFloat(v.price?.amount || prod.priceRange?.minVariantPrice?.amount || "0");
        const vInventory = v.quantityAvailable ?? 50; // Fallback inventory per variant
        
        return {
          id: vId,
          name: v.title,
          sku: v.sku || `${prod.handle}-${vId.substring(0, 8)}`,
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
