import { redirect } from "next/navigation";

type WelcomePageProps = {
  searchParams: Promise<{ token?: string; exp?: string; sig?: string }>;
};

// Confirming an email now lands straight on the dashboard; this keeps any old link working.
export default async function WelcomePage({ searchParams }: WelcomePageProps) {
  const { token, exp, sig } = await searchParams;
  if (token && exp && sig) redirect(`/manage?${new URLSearchParams({ token, exp, sig, welcome: "1" })}`);
  redirect("/");
}
