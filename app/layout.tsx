import Header from '@/app/Components/Header'
import { AuthProvider } from '@/app/store/auth'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'OREL News',
	description: 'Блог о разработке',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<body className='bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen'>
				<AuthProvider>
					<Header />
					<main className='max-w-5xl mx-auto px-4 py-8'>{children}</main>
				</AuthProvider>
			</body>
		</html>
	)
}
