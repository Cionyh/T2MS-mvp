import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MessagesClient from "./messages-client";
import { headers } from "next/headers";

// This is an async Server Component. It runs only on the server.
export default async function MessagesPage() {
  // 1. Get the session securely on the server
  const session = await auth.api.getSession({
      headers: await headers(),
    });
  

  // 2. Protect the route by redirecting if the user is not logged in
  if (!session?.user?.id) {
    redirect("/sign-in"); // Adjust this path to your actual sign-in page
  }

  // 3. Render the client component and pass the user's ID as a prop.
  //    This is the crucial step that makes the client-side hook work.
  return <MessagesClient userId={session.user.id} />;
}