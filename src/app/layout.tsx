import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "../components/ui/sonner";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata: Metadata = {
  title: "Cambodia Virtual Lab STEM | មន្ទីរពិសោធន៍និម្មិតកម្ពុជា",
  description: "ប្រព័ន្ធសិក្សាវិទ្យាសាស្ត្រ បច្ចេកវិទ្យា វិស្វកម្ម និងគណិតវិទ្យាតាមអ៊ីនធឺណិត | Virtual Science, Technology, Engineering and Mathematics learning system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hanuman:wght@100;300;400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
