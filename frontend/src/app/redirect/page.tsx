import { redirect } from "next/navigation";
import { auth } from "../../../auth.config";

export default async function RedirectPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  const redirectUrls: Record<string, string> = {
    customer: `/customers/${session.user.id}/classes`,
    instructor: `/instructors/${session.user.id}/class-schedule`,
  };

  const redirectUrl = redirectUrls[session.user.userType] || "/";
  redirect(redirectUrl);
}
