import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Resume Optimizer — Get More Interviews",
    template: "%s | AI Resume Optimizer",
  },
  description:
    "Optimize your resume with AI. Paste your resume, get professional suggestions to land more interviews. Free preview, instant results.",
  keywords: [
    "resume optimizer",
    "AI resume builder",
    "free resume review",
    "resume improvement",
    "job search",
  ],
  openGraph: {
    title: "AI Resume Optimizer — Get More Interviews",
    description:
      "Paste your resume and get AI-powered suggestions to improve it in seconds.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {process.env.NEXT_PUBLIC_GA_ID && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
      )}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`
        }} />
      )}
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
