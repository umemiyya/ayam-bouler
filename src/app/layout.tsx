// import type { Metadata } from "next";
// import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Toaster } from "sonner";
// import "./globals.css";

// const spaceGrotesk = Space_Grotesk({
//   variable: "--font-display",
//   subsets: ["latin"],
//   weight: ["500", "600", "700"],
// });

// const inter = Inter({
//   variable: "--font-body",
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
// });

// const jetbrainsMono = JetBrains_Mono({
//   variable: "--font-mono",
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
// });

// export const metadata: Metadata = {
//   title: "Count AI — Broiler Detection Admin",
//   description:
//     "Upload broiler chicken imagery, run AI-powered detection, and track counts over time.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ClerkProvider
//       appearance={{
//         variables: {
//           colorPrimary: "#e3a53c",
//           colorBackground: "#12171b",
//           colorInput: "#171d22",
//           colorForeground: "#eef2f4",
//           colorMuted: "#8b98a3",
//           colorNeutral: "#eef2f4",
//           borderRadius: "0.65rem",
//           fontFamily: "var(--font-body)",
//         },
//         elements: {
//           card: "shadow-none border border-[#232b31] bg-[#12171b]",
//           headerTitle: "font-display",
//           formButtonPrimary:
//             "bg-[#e3a53c] text-[#17130a] hover:bg-[#e3a53c]/90 normal-case shadow-none",
//           footerActionLink: "text-[#e3a53c] hover:text-[#e3a53c]/80",
//         },
//       }}
//     >
//       <html
//         lang="en"
//         className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full dark`}
//         suppressHydrationWarning
//       >
//         <body className="min-h-full font-body antialiased bg-background text-foreground">
//           {children}
//           <Toaster
//             position="top-right"
//             theme="dark"
//             toastOptions={{
//               classNames: {
//                 toast:
//                   "bg-surface border border-border-subtle text-foreground font-body",
//               },
//             }}
//           />
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }


import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Analisis Kulit AI',
  description: 'Analisis jenis kulit wajah menggunakan AI dan dapatkan rekomendasi skincare yang tepat.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
