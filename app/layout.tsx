import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERAPPO PDF Service",
  description: "PDF Generation Service",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
