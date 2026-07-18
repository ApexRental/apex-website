import type { Metadata } from "next";
import { Inter, Archivo, Space_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import Analytics from "@/components/public/Analytics";
import "./globals.css";

const THEME_INIT =
  "try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Archivo — industrial grotesque used for headings across the site.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

// Space Grotesk — used ONLY for the Apex wordmark/logo lockup.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-wordmark",
  display: "swap",
});

const TITLE = "Apex Rentals — Car Rental in New York | Drive Your Journey";
const DESCRIPTION =
  "Apex Rent A Car — reliable car rentals in New York City. Sedans, SUVs and premium vehicles like the Genesis GV70 and BMW X5. Serving NY, NJ, CT and PA. Book online or call +1-888-505-0836.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "car rental NYC",
    "rent a car New York",
    "SUV rental NYC",
    "premium car rental New York",
    "Apex Rentals",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Apex Rentals",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${archivo.variable} ${spaceGrotesk.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
