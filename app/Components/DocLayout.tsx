'use client'

import { Post } from '@/app/lib/api'
import { DocHeading } from '@/app/lib/orelMarkdown'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface DocLayoutProps {
	post: Post
	allDocs: Post[]
	headings: DocHeading[]
	children: React.ReactNode
}

export default function DocLayout({
	post,
	allDocs,
	headings,
	children,
}: DocLayoutProps) {
	const [activeId, setActiveId] = useState<string>('')
	const observerRef = useRef<IntersectionObserver | null>(null)

	// Следим за активным заголовком через IntersectionObserver
	useEffect(() => {
		if (!headings.length) return

		observerRef.current?.disconnect()

		const observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
						break
					}
				}
			},
			{ rootMargin: '-20% 0px -70% 0px' },
		)

		headings.forEach(h => {
			const el = document.getElementById(h.id)
			if (el) observer.observe(el)
		})

		observerRef.current = observer
		return () => observer.disconnect()
	}, [headings])

	const scrollTo = (id: string) => {
		const el = document.getElementById(id)
		if (!el) return
		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<div className='max-w-5xl mx-auto flex gap-8 relative'>
			{/* ── Сайдбар ───────────────────────────────────────────────────────── */}
			<aside className='hidden lg:flex flex-col gap-6 w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pb-8'>
				{/* Все доки */}
				<div>
					<p className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1'>
						Документация
					</p>
					<nav className='flex flex-col gap-0.5'>
						{allDocs.map(doc => (
							<Link
								key={doc._id}
								href={`/pages/posts/${doc._id}`}
								className={`text-sm px-2.5 py-1.5 rounded-lg transition-colors truncate ${
									doc._id === post._id
										? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
										: 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
								}`}
							>
								{doc.title}
							</Link>
						))}
					</nav>
				</div>

				{/* Якоря текущей страницы */}
				{headings.length > 0 && (
					<div>
						<p className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1'>
							На этой странице
						</p>
						<nav className='flex flex-col gap-0.5'>
							{headings.map(h => (
								<button
									key={h.id}
									onClick={() => scrollTo(h.id)}
									className={`text-left text-sm py-1 transition-colors truncate ${
										h.level === 1 ? 'px-2.5' : h.level === 2 ? 'px-4' : 'px-6'
									} ${
										activeId === h.id
											? 'text-violet-600 dark:text-violet-400 font-medium'
											: 'text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
									}`}
								>
									{h.text}
								</button>
							))}
						</nav>
					</div>
				)}
			</aside>

			{/* ── Контент ────────────────────────────────────────────────────────── */}
			<main className='flex-1 min-w-0'>{children}</main>
		</div>
	)
}
