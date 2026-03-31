import { redirect } from "next/navigation";

export default async function SignUpAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  const ref = params?.ref ? `&ref=${encodeURIComponent(params.ref)}` : "";
  redirect(`/sign-in?tab=sign-up${ref}`);
}
