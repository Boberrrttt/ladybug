import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { getHost } from "@/features/auth/services/auth.service";

export default async function SignupPage() {
  if (await getHost()) {
    redirect("/events");
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-6 py-16">
      <h1 className="heading-xl text-ink">Sign up</h1>
      <SignupForm />
      <p className="text-base text-mute">
        Already hosting?{" "}
        <Link href="/login" className="font-semibold text-ink-soft">
          Log in
        </Link>
      </p>
    </main>
  );
}
