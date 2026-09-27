import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getHost } from "@/features/auth/services/auth.service";

export default async function LoginPage() {
  if (await getHost()) {
    redirect("/events");
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-6 py-16">
      <h1 className="heading-xl text-ink">Log in</h1>
      <LoginForm />
      <p className="text-base text-mute">
        New host?{" "}
        <Link href="/signup" className="font-semibold text-ink-soft">
          Sign up
        </Link>
      </p>
    </main>
  );
}
