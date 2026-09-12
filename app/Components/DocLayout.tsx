'use client'

import { Post } from '@/app/lib/api'
import { DocHeading } from '@/app/lib/markdown'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FiBook } from 'react-icons/fi'

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
		<div className='max-w-5xl mx-auto flex gap-10 relative'>
			{/* ── Сайдбар ───────────────────────────────────────────────────────── */}
			<aside className='hidden lg:flex flex-col gap-7 w-60 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pb-8'>
				<div>
					<p className='text-xs font-semibold text-text-muted uppercase tracking-widest mb-2.5 px-1'>
						Документация
					</p>
					<nav className='flex flex-col gap-0.5'>
						{allDocs.map(doc => (
							<Link
								key={doc._id}
								href={`/pages/posts/${doc._id}`}
								className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors truncate ${
									doc._id === post._id
										? 'bg-accent-soft-bg text-accent-soft-text font-medium'
										: 'text-text-secondary hover:bg-surface-soft hover:text-text-primary'
								}`}
							>
								<FiBook size={13} className="shrink-0 opacity-60" />
								<span className="truncate">{doc.title}</span>
							</Link>
						))}
					</nav>
				</div>

				{headings.length > 0 && (
					<div className="border-t border-border-soft pt-5">
						<p className='text-xs font-semibold text-text-muted uppercase tracking-widest mb-2.5 px-1'>
							На этой странице
						</p>
						<nav className='flex flex-col gap-0.5'>
							{headings.map(h => (
								<button
									key={h.id}
									onClick={() => scrollTo(h.id)}
									className={`text-left text-sm py-1.5 rounded-lg transition-colors truncate ${
										h.level === 1 ? 'px-3' : h.level === 2 ? 'pl-6 pr-3' : 'pl-9 pr-3'
									} ${
										activeId === h.id
											? 'text-accent font-medium bg-accent-soft-bg'
											: 'text-text-muted hover:text-text-primary'
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
			<main className='flex-1 min-w-0 bg-surface rounded-3xl px-6 py-8 sm:px-10 sm:py-10'>{children}</main>
		</div>
	)
}
