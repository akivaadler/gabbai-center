// Minimal layout for print view — no sidebar, no header
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-sans">
        {children}
      </body>
    </html>
  );
}
