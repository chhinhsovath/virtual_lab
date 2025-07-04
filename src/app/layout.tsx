import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";

export const metadata: Metadata = {
  title: "ប្រព័ន្ធវាយតម្លៃ TaRL | TaRL Assessment System",
  description: "ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យវាយតម្លៃសម្រាប់ការបង្រៀនតាមកម្រិតសមស្រប | Teaching at the Right Level assessment data management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="km" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-hanuman" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
