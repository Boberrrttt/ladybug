import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-6 py-16">
      <h1 className="heading-xl text-ink">Page not found</h1>
      <Button asChild className="w-fit">
        <Link href="/">Home</Link>
      </Button>
    </main>
  );
}
