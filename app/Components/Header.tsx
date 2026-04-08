'use client'

import { useAuth } from '@/app/store/auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const langs = ['RU', 'EN', 'AR', 'UG']

export default function Header() {
	const { user, logout } = useAuth()
	const pathname = usePathname()
	const [dark, setDark] = useState(false)
	const [lang, setLang] = useState('RU')
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		const init = () => {
			const saved = localStorage.getItem('theme')
			if (saved === 'dark') {
				setDark(true)
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
		}
		init()
	}, [])

	const navLinks = [
		{ href: '/', label: 'Статьи' },
		{ href: '/pages/products', label: 'Продукты' },
	]

	return (
		<header className='sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'>
			<div className='max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4'>
				<Link
					href='/'
					className='text-base font-medium tet-gray-900 dark:text-white shrink-0'
				>
					OREL <span className='text-violet-600'>News</span>
				</Link>

				<nav className='hidden sm:flex items-center gap-5'>
					{navLinks.map(link => (
						<Link
							key={link.href}
							href={link.href}
							className={`text-sm transition-colors ${
								pathname === link.href
									? 'text-gray-900 dark:text-white font-medium'
									: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
							}`}
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className='flex items-center gap-2'>
					<select
						value={lang}
						onChange={e => setLang(e.target.value)}
						className='text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 outline-none cursor-pointer'
					>
						{langs.map(l => (
							<option key={l} value={l}>
								{l}
							</option>
						))}
					</select>

					<Link
						href='/support'
						className='hidden sm:block text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors'
					>
						Поддержка
					</Link>

					{user ? (
						<div className='relative'>
							<button
								onClick={() => setMenuOpen(!menuOpen)}
								className='w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-medium'
							>
								{user.name.charAt(0).toUpperCase()}
							</button>

							{menuOpen && (
								<div className='absolute right-0 top-10 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm py-1 z-50'>
									<div className='px-3 py-2 border-b border-gray-100 dark:border-gray-800'>
										<p className='text-xs font-medium text-gray-900 dark:text-white truncate'>
											{user.name}
										</p>
										<p className='text-xs text-gray-400 truncate'>
											{user.email}
										</p>
									</div>
									<Link
										href='/pages/user/profile'
										onClick={() => setMenuOpen(false)}
										className='block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
									>
										Профиль
									</Link>
									<button
										onClick={() => {
											setMenuOpen(false)
											void logout()
										}}
										className='w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
									>
										Выйти
									</button>
								</div>
							)}
						</div>
					) : (
						<Link
							href='/pages/auth/login'
							className='text-sm bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 rounded-xl transition-colors'
						>
							Войти
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}