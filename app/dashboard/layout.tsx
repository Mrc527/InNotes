import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "../globals.css";
import {ThemeProvider} from 'next-themes';
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/config";
import {Theme} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import {SidebarProvider} from "@/components/sidebarContext";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InNotes - Your LinkedIn CRM",
  description: "Transform LinkedIn into your personal CRM with private notes, lead statuses, and tags.",
};

export default async function DashboardLayout({
                                                children,
                                              }: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
    <head>
      {/* Matomo */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
              var _paq = window._paq = window._paq = window._paq || [];
              /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="https://track.visin.ch/";
                _paq.push(['setTrackerUrl', u+'m.php']);
                _paq.push(['setSiteId', '13']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src=u+'m.js'; s.parentNode.insertBefore(g,s);
              })();
            `,
        }}
      />
      <noscript>
        <p>
          <img
            referrerPolicy="no-referrer-when-downgrade"
            src="https://track.visin.ch/m.php?idsite=13&amp;rec=1"
            style={{border: "0"}}
            alt=""
          />
        </p>
      </noscript>
      <title>InNotes</title>
      {/* End Matomo Code */}
    </head>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
    <ThemeProvider attribute="class">
      <Theme>
        <SidebarProvider>
          <Sidebar session={session}/>
          <MainContent>
            {children}
          </MainContent>
        </SidebarProvider>
      </Theme>
    </ThemeProvider>
    </body>
    </html>
  );
}
