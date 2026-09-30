import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import { AppHeader } from "@/features/auth/components/AppHeader";
import { getHost } from "@/features/auth/services/auth.service";
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
  const [host, headerStore] = await Promise.all([getHost(), headers()]);
  const nonce = headerStore.get("x-nonce") ?? undefined;

  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`} nonce={nonce}>
      <body className="flex min-h-full flex-col font-sans">
        <AppHeader host={host} />
        <div id="main" className="flex flex-1 flex-col pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}
