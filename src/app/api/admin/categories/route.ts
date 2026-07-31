import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { db } from "@/lib/db";
import { createHash } from "crypto";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const categories = await db.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, image } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    // Check unique constraints
    const existing = await db.category.findFirst({
      where: {
        OR: [{ name }, { slug: formattedSlug }],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Category name or slug already exists" }, { status: 400 });
    }

    // Generate a valid 24-char ObjectId hex string
    const id = createHash("sha256").update(`${name}_${Date.now()}`).digest("hex").substring(0, 24);

    const category = await db.category.create({
      data: {
        id,
        name,
        slug: formattedSlug,
        image: image || null,
      },
    });

    return NextResponse.json({ category, message: "Category created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
