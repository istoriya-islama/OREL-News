'use client'

import Link from 'next/link'
import { Post } from '@/app/lib/api'

const tagStyles: Record<string, string> = {
	web: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
	ai: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
	mobile: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
	os: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

const tagLabels: Record<string, string> = {
	web: 'Web',
	ai: 'AI',
	mobile: 'Mobile',
	os: 'OS',
}

interface PostCardProps {
	post: Post
}

export default function PostCard({ post }: PostCardProps) {
	// Показываем первые 150 символов как превью
	const preview = post.body.length > 150
		? post.body.slice(0, 150) + '...'
		: post.body

	const date = new Date(post.createdAt).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	return (
		<Link href={`/pages/posts/${post._id}`}>
			<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer">

				{/* Тег */}
				<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagStyles[post.tag] ?? tagStyles.web}`}>
					{tagLabels[post.tag] ?? post.tag}
				</span>

				{/* Заголовок */}
				<h2 className="text-base font-medium text-gray-900 dark:text-white mt-3 mb-2 leading-snug">
					{post.title}
				</h2>

				{/* Превью */}
				<p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
					{preview}
				</p>

				{/* Футер */}
				<div className="flex items-center justify-between mt-4">
					<span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
					<span className="text-xs text-gray-400 dark:text-gray-500">
						{!post.comments ? 'Нет комментариев' : `${post.comments.length} комм.`}
					</span>
				</div>
			</div>
		</Link>
	)
}