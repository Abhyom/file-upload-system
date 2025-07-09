import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { FileUp } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "File Upload System",
	description: "A folder based file uploader built with Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className} suppressHydrationWarning>
				<nav className="flex w-full items-center justify-between border-y border-neutral-300 bg-yellow-50/60 backdrop-blur-3xl px-4 py-3">
					<div className="flex items-center gap-2 whitespace-nowrap">
						<div className="border-2 border-black rounded-full p-2 bg-gradient-to-br from-violet-200 to-pink-200">
							<FileUp />
						</div>
						<h1 className="text-lg font-bold md:text-xl">
							File Upload System
						</h1>
					</div>
					<div className="flex gap-3">
						<Link href="/">
							<button className="h-12 rounded-lg bg-transparent border-2 border-black  px-4 py-2 text-sm font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-200">
								File Manager
							</button>
						</Link>
						<Link href="/ledger">
							<button className="h-12 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-200 hover:text-black hover:border-black hover:border-2">
								Ledger
							</button>
						</Link>
					</div>
				</nav>

				{children}
				<Toaster />
			</body>
		</html>
	);
}
