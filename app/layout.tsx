import "./globals.css";
import Script from "next/script"; // <-- 1. Import the Next.js Script component

export const metadata = {
  title: "TI Squad Gateway",
  description: "Zensar to Nedbank Gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 2. Use the capital <Script> tag so Next.js handles it properly */}
        <Script 
          src="https://unpkg.com/@tailwindcss/browser@4" 
          strategy="beforeInteractive" 
        />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000000' }}>
        {children}
      </body>
    </html>
  );
}