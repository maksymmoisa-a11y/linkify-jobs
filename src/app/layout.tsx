import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linkify Jobs",
  description: "Find your dream job with AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
