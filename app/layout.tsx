import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from 'next-themes';
import {ThemeToggle} from './components/ThemeToggle';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
	title: 'ReVideo AI Editor',
	description: 'AI-powered video editing with Revideo',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="stylesheet" href="http://localhost:4000/player/project.css" />
			</head>
			<body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<div className="min-h-screen">
						<header className="border-b border-gray-200 dark:border-gray-800">
							<div className="container mx-auto px-4 py-4 flex justify-between items-center">
								<h1 className="text-xl font-bold">ReVideo AI</h1>
								<ThemeToggle />
							</div>
						</header>
						<main className="container mx-auto px-4 py-8">
							{children}
						</main>
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
