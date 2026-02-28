import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from "@/components/ConvexClientProvider"; 
import { SyncUserProvider } from "@/components/SyncUserProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
//added metadata good for SEO
export const metadata: Metadata={
  title: "Real-time Chat | Tars Assessment",
  description: "A real-time chat application built with Next.js, Convex, and Clerk.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <SyncUserProvider>
              {children}
            </SyncUserProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}