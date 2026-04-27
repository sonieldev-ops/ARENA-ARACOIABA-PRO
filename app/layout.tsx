import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSessionUser } from "@/lib/auth/session";
import { SessionRefreshBoundary } from "@/components/auth/SessionRefreshBoundary";
import { UserRole, UserStatus } from "@/src/types/auth";
import { AuthProvider } from "@/src/modules/auth/context/AuthContext";
import { Toaster } from "sonner";
import { FCMHandler } from "@/components/notifications/FCMHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meu-projeto-ten-rose.vercel.app"),
  title: {
    default: "Arena Araçoiaba Pro - Gestão de Campeonatos",
    template: "%s | Arena Araçoiaba Pro"
  },
  description: "A plataforma definitiva para gestão de campeonatos, ligas e arenas esportivas em Pernambuco. Profissionalismo e tecnologia para o futebol amador de Araçoiaba - PE.",
  keywords: ["Arena Araçoiaba Pro", "Gestão Esportiva", "Campeonatos Araçoiaba", "Futebol Pernambuco", "Liga de Futebol", "Araçoiaba - PE"],
  authors: [{ name: "Arena Araçoiaba Pro" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://meu-projeto-ten-rose.vercel.app", // Placeholder ou conforme configurado
    siteName: "Arena Araçoiaba Pro",
    title: "Arena Araçoiaba Pro - Gestão de Campeonatos Esportivos",
    description: "Gestão completa de ligas e torneios em Araçoiaba e região. Resultados ao vivo, tabelas e estatísticas.",
    images: [
      {
        url: "/og-image.png", // Sugestão de ter essa imagem no public
        width: 1200,
        height: 630,
        alt: "Arena Araçoiaba Pro",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <FCMHandler />
          <SessionRefreshBoundary
            serverAccessVersion={user?.accessVersion || 0}
            serverRole={user?.role || UserRole.PUBLIC_USER}
            serverStatus={user?.status || UserStatus.PENDING_APPROVAL}
          >
            {children}
          </SessionRefreshBoundary>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
