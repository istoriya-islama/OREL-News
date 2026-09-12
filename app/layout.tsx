import Header from '@/app/Components/Header'
import { AuthProvider } from '@/app/store/auth'
import type { Metadata } from 'next'
import { Inter, Lora, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ReCaptchaProvider } from '@/app/Components/ReCaptchaProvider'

const sans = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans-base', display: 'swap' })
const serif = Lora({ subsets: ['latin', 'cyrillic'], variable: '--font-serif-base', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono-base', display: 'swap' })

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
		<html lang='ru' suppressHydrationWarning className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
			<ReCaptchaProvider>
			<body className='bg-page text-text-primary min-h-screen'>
				<AuthProvider>
					<Header />
					<main className='max-w-5xl mx-auto px-4 py-8'>{children}</main>
				</AuthProvider>
			</body>
			</ReCaptchaProvider>
		</html>
	)
}
