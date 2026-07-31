import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const where = user.role === "ADMIN" ? {} : { merchantId: user.id };

    const products = await db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Error fetching merchant products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "MERCHANT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, price, image, inventory, categoryId, details } = body;

    if (!name || !price || !categoryId || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const generatedSlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newProduct = await db.product.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || "",
        price: parseFloat(price),
        image,
        details: Array.isArray(details) ? details : details ? [details] : [],
        inventory: parseInt(inventory) || 50,
        categoryId,
        merchantId: user.id,
      },
    });

    return NextResponse.json({ product: newProduct, message: "Product created successfully" });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
