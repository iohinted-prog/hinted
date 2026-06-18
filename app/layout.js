import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AvatarMenu from "./components/AvatarMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hinted.io",
  description:
    "Build circles, hints, and reminders to stay close to the people who matter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-neutral-900`}
      >
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/feed" className="hover:text-neutral-600">
                Feed
              </Link>
              <Link href="/shop" className="hover:text-neutral-600">
                Shop
              </Link>
              <Link href="/hints" className="hover:text-neutral-600">
                Hints
              </Link>
            </nav>

            <AvatarMenu />
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
