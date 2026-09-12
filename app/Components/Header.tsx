'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/app/store/auth'

const navLinks = [
  { href: '/', label: 'Статьи' },
  { href: '/pages/docs', label: 'Документация' },
  { href: '/pages/products', label: 'Продукты' },
]

export default function Header() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [burgerOpen, setBurgerOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-page/85 backdrop-blur-sm border-b border-border-soft">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Лого */}
        <Link href="/" className="font-serif text-lg font-semibold text-text-primary shrink-0">
          OREL <span className="text-accent">News</span>
        </Link>

        {/* Навигация — только на десктопе */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(link => {
            const active = pathname === link.href || (link.href === '/pages/docs' && pathname.startsWith('/pages/docs'))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm px-3.5 py-2 rounded-full transition-colors ${
                  active
                    ? 'bg-accent-soft-bg text-accent-soft-text font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-2">

          {/* Поддержка — только десктоп */}
          <Link
            href="https://t.me/obr_orel_bot"
            className="hidden sm:block text-xs text-text-secondary hover:text-text-primary border border-border-soft rounded-full px-3.5 py-2 transition-colors"
          >
            Поддержка
          </Link>

          {/* Аккаунт */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-accent-soft-bg flex items-center justify-center text-accent-soft-text text-xs font-medium"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 w-48 bg-surface border border-border-soft rounded-2xl shadow-sm py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-border-soft">
                    <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/pages/user/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3.5 py-2 text-sm text-text-secondary hover:bg-surface-soft rounded-lg mx-1.5 mt-1"
                  >
                    Профиль
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); void logout() }}
                    className="w-full text-left px-3.5 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg mx-1.5"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/pages/auth/login"
              className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-full transition-colors font-medium"
            >
              Войти
            </Link>
          )}

          {/* Бургер — только мобиле */}
          <button
            onClick={() => setBurgerOpen(!burgerOpen)}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full border border-border-soft text-text-secondary"
          >
            {burgerOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {burgerOpen && (
        <div className="sm:hidden border-t border-border-soft bg-page px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setBurgerOpen(false)}
              className={`text-sm py-2.5 px-3.5 rounded-2xl transition-colors ${
                pathname === link.href
                  ? 'bg-accent-soft-bg text-accent-soft-text font-medium'
                  : 'text-text-secondary hover:bg-surface-soft'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="https://t.me/obr_orel_bot"
            onClick={() => setBurgerOpen(false)}
            className="text-sm py-2.5 px-3.5 rounded-2xl text-text-secondary hover:bg-surface-soft transition-colors"
          >
            Поддержка
          </Link>
        </div>
      )}
    </header>
  )
}
