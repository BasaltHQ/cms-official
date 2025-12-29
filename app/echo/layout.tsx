import { Inter } from "next/font/google";
import "../[locale]/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function EchoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#020617] antialiased`}>
                {children}
            </body>
        </html>
    );
}
