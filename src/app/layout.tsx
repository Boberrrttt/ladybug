import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { getHost, logOutAction } from "@/features/auth/services/auth.service";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ladybug",
  description: "QR photo albums for events",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const host = await getHost();

  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
          <Link href="/" className="text-[22px] font-semibold text-primary">
            Ladybug
          </Link>
          <nav className="flex items-center gap-3">
            {host ? (
              <>
                <Link href="/events" className="btn-tertiary">
                  Events
                </Link>
                <form action={logOutAction}>
                  <button type="submit" className="btn-tertiary">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-tertiary">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
