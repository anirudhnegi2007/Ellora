import { handleApiError, unauthorized } from "@/lib/errors";
import { getSession } from "@/lib/session";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const wishlist = await getWishlist(session.user.id);
    return Response.json(wishlist);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const { productId } = await request.json();
    if (!productId) {
      return Response.json({ error: "productId is required" }, { status: 400 });
    }

    const item = await addToWishlist(session.user.id, productId);
    return Response.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return Response.json({ error: "productId is required" }, { status: 400 });
    }

    await removeFromWishlist(session.user.id, productId);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
