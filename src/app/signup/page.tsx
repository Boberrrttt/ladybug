import { redirect } from "next/navigation";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { getHost } from "@/features/auth/services/auth.service";

export default async function SignupPage() {
  if (await getHost()) {
    redirect("/events");
  }

  return (
    <AuthScreen
      title="Sign up"
      lede="Make a guest album for your next event."
      switchPrompt="Already hosting?"
      switchHref="/login"
      switchLabel="Log in"
    >
      <SignupForm />
    </AuthScreen>
  );
}
