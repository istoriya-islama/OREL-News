'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiEdit2, FiEye, FiEyeOff, FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi'
import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { api, Post, PostTag } from '@/app/lib/api'
import { useAuth } from '@/app/store/auth'

type View = 'login' | 'list' | 'editor'

const tagOptions: { value: PostTag; label: string }[] = [
	{ value: 'web', label: 'Web' },
	{ value: 'ai', label: 'AI' },
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'os', label: 'OS' },
]

const tagStyles: Record<string, string> = {
	web: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
	ai: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
	mobile: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
	os: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

export default function AdminPage() {
	const router = useRouter()
	const { user, logout } = useAuth()

	const [view, setView] = useState<View>('login')

	// Логин в админку
	const [loginEmail, setLoginEmail] = useState('')
	const [loginPassword, setLoginPassword] = useState('')
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)

	// Список статей
	const [posts, setPosts] = useState<Post[]>([])
	const [postsLoading, setPostsLoading] = useState(false)

	// Редактор
	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const [title, setTitle] = useState('')
	const [body, setBody] = useState('')
	const [tag, setTag] = useState<PostTag>('web')
	const [saveLoading, setSaveLoading] = useState(false)
	const [publishLoading, setPublishLoading] = useState(false)
	const [editorError, setEditorError] = useState('')

	// Если уже залогинен и админ — сразу показываем список
	useEffect(() => {
		const init = () => {
			if (user?.isAdmin) {
				setView('list')
				void loadPosts()
			}
		}
		init()
	}, [user])

	const loadPosts = async () => {
		setPostsLoading(true)
		try {
			const data = await api.adminGetPosts()
			setPosts(data)
		} catch {
			// тихая ошибка
		} finally {
			setPostsLoading(false)
		}
	}

	// Войти в админку
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoginError('')
		setLoginLoading(true)

		try {
			const res = await api.login({ email: loginEmail, password: loginPassword })
			if (!res.user.isAdmin) {
				setLoginError('Нет прав администратора')
				return
			}
			setView('list')
			void loadPosts()
		} catch (err) {
			setLoginError(err instanceof Error ? err.message : 'Ошибка входа')
		} finally {
			setLoginLoading(false)
		}
	}

	// Открыть редактор
	const openEditor = (post?: Post) => {
		if (post) {
			setEditingPost(post)
			setTitle(post.title)
			setBody(post.body)
			setTag(post.tag)
		} else {
			setEditingPost(null)
			setTitle('')
			setBody('')
			setTag('web')
		}
		setEditorError('')
		setView('editor')
	}

	// Сохранить черновик
	const handleSave = async () => {
		if (!title.trim() || !body.trim()) {
			setEditorError('Заполни заголовок и текст')
			return
		}
		setEditorError('')
		setSaveLoading(true)

		try {
			if (editingPost) {
				await api.adminUpdatePost(editingPost._id, { title, body, tag })
			} else {
				await api.adminCreatePost({ title, body, tag })
			}
			setView('list')
			void loadPosts()
		} catch (err) {
			setEditorError(err instanceof Error ? err.message : 'Ошибка')
		} finally {
			setSaveLoading(false)
		}
	}

	// Опубликовать
	const handlePublish = async () => {
		if (!title.trim() || !body.trim()) {
			setEditorError('Заполни заголовок и текст')
			return
		}
		setEditorError('')
		setPublishLoading(true)

		try {
			let postId = editingPost?._id

			// Если новая статья — сначала создаём
			if (!postId) {
				const created = await api.adminCreatePost({ title, body, tag })
				postId = created._id
			} else {
				await api.adminUpdatePost(postId, { title, body, tag })
			}

			await api.adminPublishPost(postId)
			setView('list')
			void loadPosts()
		} catch (err) {
			setEditorError(err instanceof Error ? err.message : 'Ошибка публикации')
		} finally {
			setPublishLoading(false)
		}
	}

	// Снять с публикации / опубликовать из списка
	const handleTogglePublish = async (post: Post) => {
		try {
			if (post.published) {
				await api.adminUnpublishPost(post._id)
			} else {
				await api.adminPublishPost(post._id)
			}
			void loadPosts()
		} catch {
			// тихая ошибка
		}
	}

	// Удалить статью
	const handleDelete = async (id: string) => {
		if (!confirm('Удалить статью?')) return
		try {
			await api.adminDeletePost(id)
			void loadPosts()
		} catch {
			// тихая ошибка
		}
	}

	// ── Страница входа ────────────────────────────────────────────────────────
	if (view === 'login') {
		return (
			<div className="min-h-[80vh] flex items-center justify-center px-4">
				<div className="w-full max-w-sm">
					<div className="text-center mb-8">
						<h1 className="text-xl font-medium text-gray-900 dark:text-white">
							Панель управления
						</h1>
						<p className="text-sm text-gray-500 mt-1">
							Только для администратора
						</p>
						<p className="text-xs text-gray-400 mt-1">
							orel-news.com<span className="font-medium text-gray-500">/admin</span>
						</p>
					</div>

					<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
						<form onSubmit={handleLogin} className="space-y-4">
							<Input
								label="Email"
								type="email"
								value={loginEmail}
								onChange={e => setLoginEmail(e.target.value)}
								placeholder="admin@orel.app"
								required
							/>
							<Input
								label="Пароль"
								type="password"
								value={loginPassword}
								onChange={e => setLoginPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
							{loginError && (
								<p className="text-xs text-red-500">{loginError}</p>
							)}
							<Button type="submit" fullWidth loading={loginLoading}>
								Войти
							</Button>
						</form>
					</div>

					<button
						onClick={() => router.push('/')}
						className="text-xs text-gray-400 hover:text-gray-600 mt-4 mx-auto block transition-colors"
					>
						← На сайт
					</button>
				</div>
			</div>
		)
	}

	// ── Редактор ──────────────────────────────────────────────────────────────
	if (view === 'editor') {
		return (
			<div className="max-w-2xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-lg font-medium text-gray-900 dark:text-white">
						{editingPost ? 'Редактировать статью' : 'Новая статья'}
					</h1>
					<button
						onClick={() => setView('list')}
						className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
					>
						← Назад
					</button>
				</div>

				<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
					{/* Тулбар */}
					<div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
						<select
							value={tag}
							onChange={e => setTag(e.target.value as PostTag)}
							className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none"
						>
							{tagOptions.map(t => (
								<option key={t.value} value={t.value}>{t.label}</option>
							))}
						</select>
						<span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
							AI переведёт при публикации
						</span>
					</div>

					{/* Заголовок */}
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder="Заголовок статьи..."
						className="w-full px-5 py-4 text-lg font-medium border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-600"
					/>

					{/* Тело */}
					<textarea
						value={body}
						onChange={e => setBody(e.target.value)}
						placeholder="Пиши на русском — при публикации AI автоматически переведёт на EN, AR и UG..."
						rows={16}
						className="w-full px-5 py-4 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none leading-relaxed"
					/>

					{/* Футер */}
					<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
						<span className="text-xs text-gray-400">{body.length} символов</span>
						<div className="flex gap-2">
							{editorError && (
								<p className="text-xs text-red-500 self-center mr-2">{editorError}</p>
							)}
							<Button variant="secondary" loading={saveLoading} onClick={() => void handleSave()}>
								Черновик
							</Button>
							<Button loading={publishLoading} onClick={() => void handlePublish()}>
								Опубликовать →
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// ── Список статей ─────────────────────────────────────────────────────────
	return (
		<div className="max-w-3xl mx-auto">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-lg font-medium text-gray-900 dark:text-white">
					Панель управления
				</h1>
				<div className="flex gap-2">
					<Button onClick={() => openEditor()}>
						<span className="flex items-center gap-1.5">
							<FiPlus size={14} /> Новая статья
						</span>
					</Button>
					<Button variant="secondary" onClick={() => void logout()}>
						<FiLogOut size={14} />
					</Button>
				</div>
			</div>

			{postsLoading && (
				<div className="space-y-3">
					{[...Array(3)].map((_, i) => (
						<div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
					))}
				</div>
			)}

			{!postsLoading && posts.length === 0 && (
				<div className="text-center py-16">
					<p className="text-sm text-gray-400">Статей пока нет</p>
				</div>
			)}

			{!postsLoading && posts.length > 0 && (
				<div className="space-y-3">
					{posts.map(post => (
						<div
							key={post._id}
							className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3"
						>
							{/* Тег */}
							<span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${tagStyles[post.tag]}`}>
								{post.tag.toUpperCase()}
							</span>

							{/* Заголовок */}
							<p className="text-sm text-gray-900 dark:text-white flex-1 truncate">
								{post.title}
							</p>

							{/* Статус */}
							<span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
								post.published
									? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
									: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
							}`}>
								{post.published ? 'Опубликовано' : 'Черновик'}
							</span>

							{/* Действия */}
							<div className="flex items-center gap-1 shrink-0">
								<button
									onClick={() => openEditor(post)}
									className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
									title="Редактировать"
								>
									<FiEdit2 size={14} />
								</button>
								<button
									onClick={() => void handleTogglePublish(post)}
									className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
									title={post.published ? 'Снять с публикации' : 'Опубликовать'}
								>
									{post.published ? <FiEyeOff size={14} /> : <FiEye size={14} />}
								</button>
								<button
									onClick={() => void handleDelete(post._id)}
									className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
									title="Удалить"
								>
									<FiTrash2 size={14} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}