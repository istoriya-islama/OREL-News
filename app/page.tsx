'use client'

import PostCard from '@/app/Components/PostCard'
import { api, Post } from '@/app/lib/api'
import { useEffect, useState } from 'react'

const tags = [
	{ value: 'all', label: 'Все' },
	{ value: 'web', label: 'Web' },
	{ value: 'ai', label: 'AI' },
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'os', label: 'OS' },
]

export default function HomePage() {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [activeTag, setActiveTag] = useState('all')

	useEffect(() => {
		const load = async () => {
			try {
				const data = await api.getPosts()
				setPosts(data)
			} catch {
				setError('Не удалось загрузить статьи')
			} finally {
				setLoading(false)
			}
		}
		void load()
	}, [])

	const filtered =
		activeTag === 'all' ? posts : posts.filter(p => p.tag === activeTag)

	return (
		<div className='max-w-5xl mx-auto'>
			{/* Шапка страницы */}
			<div className='mb-8'>
				<h1 className='text-2xl font-medium text-gray-900 dark:text-white mb-1'>
					OREL <span className='text-violet-600'>News</span>
				</h1>
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					Блог о разработке — веб, мобильные приложения, AI и ОС
				</p>
			</div>

			{/* Баннер OREL Insider */}
			<div className='bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between gap-4'>
				<div>
					<p className='text-sm font-medium text-violet-800 dark:text-violet-200'>
						OREL Insider
					</p>
					<p className='text-xs text-violet-600 dark:text-violet-400 mt-0.5'>
						Скачивай тестовые версии приложений раньше всех
					</p>
				</div>
				<a
					href='https://orel-insider.vercel.app'
					target='_blank'
					rel='noopener noreferrer'
					className='text-xs font-medium text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 rounded-xl px-3.5 py-2 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors shrink-0'
				>
					Перейти →
				</a>
			</div>

			{/* Фильтр по тегам */}
			<div className='flex gap-2 mb-6 flex-wrap'>
				{tags.map(tag => (
					<button
						key={tag.value}
						onClick={() => setActiveTag(tag.value)}
						className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
							activeTag === tag.value
								? 'bg-violet-600 text-white border-violet-600'
								: 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-violet-300'
						}`}
					>
						{tag.label}
					</button>
				))}
			</div>

			{/* Статьи */}
			{loading && (
				<div className='grid gap-4 sm:grid-cols-2'>
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className='bg-gray-100 dark:bg-gray-800 rounded-2xl h-44 animate-pulse'
						/>
					))}
				</div>
			)}

			{error && (
				<div className='text-center py-16'>
					<p className='text-sm text-red-500'>{error}</p>
				</div>
			)}

			{!loading && !error && filtered.length === 0 && (
				<div className='text-center py-16'>
					<p className='text-sm text-gray-400'>Статей пока нет</p>
				</div>
			)}

			{!loading && !error && filtered.length > 0 && (
				<div className='grid gap-4 sm:grid-cols-2'>
					{filtered.map(post => (
						<PostCard key={post._id} post={post} />
					))}
				</div>
			)}
		</div>
	)
}
