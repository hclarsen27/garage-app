import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "Garage Transform — Magic Valley Garage Organization",
    template: "%s | Garage Transform",
  },
  description:
    "Professional garage organization in the Magic Valley and surrounding areas. Upload a photo, get an instant AI-powered quote, and see a preview of your transformed space.",
  openGraph: {
    title: "Garage Transform",
    description: "Upload a photo. Get an instant quote. See your garage transformed.",
    type: "website",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
