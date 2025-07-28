import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session) {
    redirect("/auth/sign-in");
  }
  
  // In production, redirect to stay-tuned page
  if (process.env.NODE_ENV === "production") {
    redirect("/stay-tuned");
  }
  
  // In development, redirect to dashboard
  return redirect("/dashboard");
}
