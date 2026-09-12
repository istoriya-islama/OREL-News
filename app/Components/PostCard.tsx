'use client'

import Link from 'next/link'
import { Post } from '@/app/lib/api'

const tagStyles: Record<string, string> = {
	web: 'bg-[var(--tag-web-bg)] text-[var(--tag-web-text)]',
	ai: 'bg-[var(--tag-ai-bg)] text-[var(--tag-ai-text)]',
	mobile: 'bg-[var(--tag-mobile-bg)] text-[var(--tag-mobile-text)]',
	os: 'bg-[var(--tag-os-bg)] text-[var(--tag-os-text)]',
	documentation: 'bg-[var(--tag-doc-bg)] text-[var(--tag-doc-text)]',
}

const tagLabels: Record<string, string> = {
	web: 'Web',
	ai: 'AI',
	mobile: 'Mobile',
	os: 'OS',
	documentation: 'Documentation'
}

interface PostCardProps {
	post: Post
	featured?: boolean
}

export default function PostCard({ post, featured = false }: PostCardProps) {
	const preview = post.body.length > (featured ? 220 : 130)
		? post.body.slice(0, featured ? 220 : 130) + '...'
		: post.body

	const date = new Date(post.createdAt).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	return (
		<Link href={`/pages/posts/${post._id}`} className={featured ? 'sm:col-span-2' : ''}>
			<div className="bg-surface rounded-3xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow cursor-pointer h-full">

				<span className={`text-xs font-semibold px-3 py-1 rounded-full ${tagStyles[post.tag] ?? tagStyles.web}`}>
					{tagLabels[post.tag] ?? post.tag}
				</span>

				<h2 className={`font-serif font-semibold text-text-primary mt-4 mb-2 leading-snug ${featured ? 'text-xl' : 'text-base'}`}>
					{post.title}
				</h2>

				<p className="text-sm text-text-secondary leading-relaxed">
					{preview}
				</p>

				<div className="flex items-center justify-between mt-5">
					<span className="text-xs text-text-muted">{date}</span>
					<span className="text-xs text-text-muted">
						{!post.comments || post.comments.length === 0 ? 'Нет комментариев' : `${post.comments.length} комм.`}
					</span>
				</div>
			</div>
		</Link>
	)
}
