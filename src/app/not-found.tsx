import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-6 py-16">
      <h1 className="heading-xl text-ink">Page not found</h1>
      <Link href="/" className="btn-primary w-fit">
        Home
      </Link>
    </main>
  );
}
