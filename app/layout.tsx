import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Deals Junction",
  description: "Shop smart. Save big.",
};

// Deals Junction type system (from deals-junction-website-toolkit):
// Poppins for headings/display (the logo's wordmark face), Inter for body
// and UI copy. Both are exposed as CSS variables — see the `heading` /
// `sans` entries in tailwind.config.ts — instead of one font forced onto
// <body>, so headings and paragraphs actually use different faces.
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700", "800"],
  display: "swap",
  subsets: ["latin"],
});
const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
