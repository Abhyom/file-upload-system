import { FileManager } from "@/components/FileManager";

export default function Home() {
	return (
		<main className="relative min-h-screen">
			{/* Soft Yellow Grid Background */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[#FFFDEB] bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]" />

			{/* Main Content */}
			<FileManager />
		</main>
	);
}
