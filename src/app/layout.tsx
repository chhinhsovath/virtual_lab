import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";

export const metadata: Metadata = {
  title: "TaRL Assessment System",
  description: "Teaching at the Right Level assessment data management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
