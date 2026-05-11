import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "SiliFind Admin Dashboard",
  description: "Dashboard admin dan operator untuk SiliFind",
  applicationName: "SiliFind",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SiliFind",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
