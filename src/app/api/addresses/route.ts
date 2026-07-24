import { handleApiError, unauthorized } from "@/lib/errors";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { z } from "zod";

const addressSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  zip: z.string().min(3),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(addresses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) throw unauthorized();

    const body = await request.json();
    const input = addressSchema.parse(body);

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        ...input,
      },
    });

    return Response.json(address, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
