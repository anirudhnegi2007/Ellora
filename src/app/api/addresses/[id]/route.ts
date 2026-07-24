import { handleApiError, unauthorized, notFound } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const { id } = await params;

    const address = await db.address.findUnique({
      where: { id },
    });

    if (!address) throw notFound("Address not found");
    if (address.userId !== session.user.id) throw unauthorized();

    await db.address.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
