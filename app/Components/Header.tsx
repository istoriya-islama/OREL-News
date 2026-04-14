'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/app/store/auth'

const langs = ['RU', 'EN', 'AR', 'UG']

const navLinks = [
	{ href: '/', label: 'Статьи' },
	{ href: '/pages/products', label: 'Продукты' },
]

export default function Header() {
	const { user, logout } = useAuth()
	const pathname = usePathname()
	const [lang, setLang] = useState('RU')
	const [menuOpen, setMenuOpen] = useState(false)
	const [burgerOpen, setBurgerOpen] = useState(false)

	// Загружаем тему и язык из localStorage
	useEffect(() => {
		const init = () => {
			const savedLang = localStorage.getItem('lang')
			if (savedLang) setLang(savedLang)
		}
		init()
	}, [])

	// Меняем язык и сохраняем в localStorage
	// Страницы читают lang из localStorage при загрузке
	const handleLangChange = (newLang: string) => {
		setLang(newLang)
		localStorage.setItem('lang', newLang.toLowerCase())
		// Перезагружаем страницу чтобы применить язык
		window.location.reload()
	}

	return (
		<header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
			<div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

				{/* Лого */}
				<Link href="/" className="text-base font-medium text-gray-900 dark:text-white shrink-0">
					OREL <span className="text-violet-600">News</span>
				</Link>

				{/* Навигация — только на десктопе */}
				<nav className="hidden sm:flex items-center gap-5">
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

				{/* Правая часть */}
				<div className="flex items-center gap-2">

					{/* Язык */}
					<select
						value={lang}
						onChange={e => handleLangChange(e.target.value)}
						className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
					>
						{langs.map(l => (
							<option key={l} value={l}>{l}</option>
						))}
					</select>

					{/* Поддержка — только десктоп */}
					<Link
						href="https://t.me/obr_orel_bot"
						className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
					>
						Поддержка
					</Link>

					{/* Аккаунт */}
					{user ? (
						<div className="relative">
							<button
								onClick={() => setMenuOpen(!menuOpen)}
								className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-medium"
							>
								{user.name.charAt(0).toUpperCase()}
							</button>

							{menuOpen && (
								<div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm py-1 z-50">
									<div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
										<p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
										<p className="text-xs text-gray-400 truncate">{user.email}</p>
									</div>
									<Link
										href="/pages/user/profile"
										onClick={() => setMenuOpen(false)}
										className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
									>
										Профиль
									</Link>
									<button
										onClick={() => { setMenuOpen(false); void logout() }}
										className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
									>
										Выйти
									</button>
								</div>
							)}
						</div>
					) : (
						<Link
							href="/pages/auth/login"
							className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 rounded-xl transition-colors"
						>
							Войти
						</Link>
					)}

					{/* Бургер — только мобиле */}
					<button
						onClick={() => setBurgerOpen(!burgerOpen)}
						className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
					>
						{burgerOpen ? <FiX size={16} /> : <FiMenu size={16} />}
					</button>
				</div>
			</div>

			{/* Мобильное меню */}
			{burgerOpen && (
				<div className="sm:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex flex-col gap-1">
					{navLinks.map(link => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setBurgerOpen(false)}
							className={`text-sm py-2 px-3 rounded-xl transition-colors ${
								pathname === link.href
									? 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300 font-medium'
									: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
							}`}
						>
							{link.label}
						</Link>
					))}
					<Link
						href="https://t.me/obr_orel_bot"
						onClick={() => setBurgerOpen(false)}
						className="text-sm py-2 px-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
					>
						Поддержка
					</Link>
				</div>
			)}
		</header>
	)
}