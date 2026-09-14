import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";

export const metadata: Metadata = {
  title: {
    default: "ContextBridge — Portable AI Context",
    template: "%s | ContextBridge",
  },
  description:
    "Carry your AI conversation context from ChatGPT, Claude, Gemini, or Grok to any other AI — without starting over. Your AI context shouldn't be locked to one AI.",
  keywords: [
    "AI context",
    "ChatGPT",
    "Claude",
    "Gemini",
    "AI portability",
    "conversation transfer",
    "AI productivity",
  ],
  openGraph: {
    title: "ContextBridge — Portable AI Context",
    description:
      "Start anywhere. Continue anywhere. Carry your AI conversation context across ChatGPT, Claude, Gemini, and Grok.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
