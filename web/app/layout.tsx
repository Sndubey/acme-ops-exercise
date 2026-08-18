import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";

import { Chassis } from "@/components/app/chassis";
import { getSession } from "@/lib/session";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acme Ops",
  description: "Internal operations console",
};

/** Applies the stored theme before first paint so the page never flashes. */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("acme-ops-theme");
    var dark = stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const operator = await getSession();

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div className="relative z-10 flex min-h-screen flex-col">
          {operator ? <Chassis operator={operator} /> : null}

          {operator ? (
            <>
              <main className="mx-auto w-full max-w-[80rem] flex-1 px-4 py-6 sm:py-7">
                {children}
              </main>
              <footer className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-4">
                <p className="legend">Acme Ops &middot; internal use only</p>
              </footer>
            </>
          ) : (
            <main className="flex flex-1 items-center justify-center px-4 py-12">
              {children}
            </main>
          )}
        </div>
      </body>
    </html>
  );
}
