import { getUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  return Response.json(
    { user: user && { name: user.name, email: user.email, avatar: user.avatar } },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
