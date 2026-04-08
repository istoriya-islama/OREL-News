'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { api, Comment, Post } from '@/app/lib/api'
import { useAuth } from '@/app/store/auth'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function PostPage() {
	const { id } = useParams<{ id: string }>()
	const router = useRouter()
	const { user } = useAuth()

	const [post, setPost] = useState<Post | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const [commentText, setCommentText] = useState('')
	const [commentLoading, setCommentLoading] = useState(false)
	const [commentError, setCommentError] = useState('')

	useEffect(() => {
		const load = async () => {
			try {
				const data = await api.getPost(id)
				setPost(data)
			} catch {
				setError('Статья не найдена')
			} finally {
				setLoading(false)
			}
		}
		void load()
	}, [id])

	const handleComment = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!commentText.trim()) return
		setCommentError('')
		setCommentLoading(true)

		try {
			const updated = await api.addComment(id, commentText)
			// Обновляем комментарии в посте
			setPost(prev => (prev ? { ...prev, comments: updated } : prev))
			setCommentText('')
		} catch (err) {
			setCommentError(err instanceof Error ? err.message : 'Ошибка')
		} finally {
			setCommentLoading(false)
		}
	}

	const handleDeleteComment = async (index: number) => {
		try {
			await api.deleteComment(id, index)
			setPost(prev =>
				prev
					? { ...prev, comments: prev.comments.filter((_, i) => i !== index) }
					: prev,
			)
		} catch {
			// тихая ошибка
		}
	}

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})

	// Скелетон загрузки
	if (loading) {
		return (
			<div className='max-w-2xl mx-auto animate-pulse space-y-4'>
				<div className='h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full' />
				<div className='h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-xl' />
				<div className='h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-full' />
				<div className='space-y-2 mt-6'>
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className='h-4 bg-gray-100 dark:bg-gray-800 rounded-full'
						/>
					))}
				</div>
			</div>
		)
	}

	if (error || !post) {
		return (
			<div className='max-w-2xl mx-auto text-center py-20'>
				<p className='text-gray-400 mb-4'>{error || 'Статья не найдена'}</p>
				<Button variant='secondary' onClick={() => router.push('/')}>
					← На главную
				</Button>
			</div>
		)
	}

	return (
		<div className='max-w-2xl mx-auto'>
			{/* Кнопка назад */}
			<button
				onClick={() => router.back()}
				className='text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-6 flex items-center gap-1 transition-colors'
			>
				← Назад
			</button>

			{/* Тег */}
			<span
				className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagStyles[post.tag] ?? tagStyles.web}`}
			>
				{tagLabels[post.tag] ?? post.tag}
			</span>

			{/* Заголовок */}
			<h1 className='text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-3 leading-snug'>
				{post.title}
			</h1>

			{/* Дата */}
			<p className='text-sm text-gray-400 dark:text-gray-500 mb-8'>
				{formatDate(post.createdAt)}
			</p>

			{/* Разделитель */}
			<div className='border-t border-gray-100 dark:border-gray-800 mb-8' />

			{/* Тело статьи */}
			<div className='prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap'>
				{post.body}
			</div>

			{/* Разделитель */}
			<div className='border-t border-gray-100 dark:border-gray-800 mt-12 mb-8' />

			{/* Комментарии */}
			<section>
				<h2 className='text-base font-medium text-gray-900 dark:text-white mb-6'>
					Комментарии{' '}
					{post.comments.length > 0 && (
						<span className='text-gray-400 font-normal'>
							({post.comments.length})
						</span>
					)}
				</h2>

				{/* Список комментариев */}
				{post.comments.length === 0 && (
					<p className='text-sm text-gray-400 mb-6'>
						Пока нет комментариев. Будь первым!
					</p>
				)}

				<div className='space-y-4 mb-8'>
					{post.comments.map((comment: Comment, index: number) => (
						<div
							key={index}
							className='bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3'
						>
							<div className='flex items-center justify-between mb-1.5'>
								<div className='flex items-center gap-2'>
									{/* Аватар */}
									<div className='w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-medium'>
										{comment.authorName.charAt(0).toUpperCase()}
									</div>
									<span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
										{comment.authorName}
									</span>
								</div>

								<div className='flex items-center gap-2'>
									<span className='text-xs text-gray-400'>
										{formatDate(comment.createdAt)}
									</span>
									{/* Удалить — только свой комментарий или админ */}
									{user && (user._id === comment.authorId || user.isAdmin) && (
										<button
											onClick={() => void handleDeleteComment(index)}
											className='text-xs text-red-400 hover:text-red-600 transition-colors'
										>
											Удалить
										</button>
									)}
								</div>
							</div>

							<p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
								{comment.text}
							</p>
						</div>
					))}
				</div>

				{/* Форма комментария */}
				{user ? (
					<form onSubmit={handleComment} className='space-y-3'>
						<Input
							placeholder='Напиши комментарий...'
							value={commentText}
							onChange={e => setCommentText(e.target.value)}
							required
						/>
						{commentError && (
							<p className='text-xs text-red-500'>{commentError}</p>
						)}
						<Button type='submit' loading={commentLoading}>
							Отправить
						</Button>
					</form>
				) : (
					<div className='bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-center'>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Чтобы оставить комментарий,{' '}
							<a
								href='/pages/auth/login'
								className='text-violet-600 hover:underline font-medium'
							>
								войди в аккаунт
							</a>
						</p>
					</div>
				)}
			</section>
		</div>
	)
}
