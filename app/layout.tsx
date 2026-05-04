import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "StudyVerify",
  description:
    "Verification-driven AI learning companion. Solve, verify, and get hints on coding problems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen text-gray-900`}
      >
        <header className="h-14 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">StudyVerify</h1>
            <a
              href="https://github.com/lixuwei2005-star/studyverify-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              GitHub
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
