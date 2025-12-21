import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AdminAuthProvider } from "@/components/auth/AdminAuthProvider";

// Font configuration for admin interface
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

// Admin-specific metadata
export const metadata: Metadata = {
  title: {
    default: "MSC Admin Panel - Hệ thống quản trị",
    template: "%s | MSC Admin",
  },
  description: "Hệ thống quản trị nội bộ MSC Center",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AdminAuthProvider>
          <div className="min-h-screen bg-gray-50">
            <main>{children}</main>
          </div>
          <Toaster />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
