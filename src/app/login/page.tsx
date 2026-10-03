import { redirect } from "next/navigation";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getHost } from "@/features/auth/services/auth.service";

export default async function LoginPage() {
  if (await getHost()) {
    redirect("/events");
  }

  return (
    <AuthScreen
      title="Log in"
      lede="Open the albums you host."
      switchPrompt="New host?"
      switchHref="/signup"
      switchLabel="Sign up"
    >
      <LoginForm />
    </AuthScreen>
  );
}
