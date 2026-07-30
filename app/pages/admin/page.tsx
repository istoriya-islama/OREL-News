'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { api, Post, PostTag } from '@/app/lib/api'
import { useAuth } from '@/app/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	FiEdit2,
	FiEye,
	FiEyeOff,
	FiLogOut,
	FiPlus,
	FiTrash2,
} from 'react-icons/fi'

type View = 'login' | 'list' | 'editor'

const tagOptions: { value: PostTag; label: string }[] = [
	{ value: 'web', label: 'Веб' },
	{ value: 'ai', label: 'AI' },
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'os', label: 'OS' },
	{ value: 'documentation', label: 'Documentation' },
]

const tagStyles: Record<string, string> = {
	web: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
	ai: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
	mobile: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
	os: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
	documentation:
		'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

// ── localStorage helpers (те же ключи что и в DocsPage) ──────────────────────
const LS_CATS = 'docs-categories'
const LS_ORDER = 'docs-category-order'

function loadDocCats(): Record<string, string[]> {
	try {
		return JSON.parse(localStorage.getItem(LS_CATS) || '{}')
	} catch {
		return {}
	}
}
function loadDocOrder(): string[] {
	try {
		return JSON.parse(localStorage.getItem(LS_ORDER) || '[]')
	} catch {
		return []
	}
}
function saveDocCats(cats: Record<string, string[]>, order: string[]) {
	localStorage.setItem(LS_CATS, JSON.stringify(cats))
	localStorage.setItem(LS_ORDER, JSON.stringify(order))
}

export default function AdminPage() {
	const router = useRouter()
	const { user, logout } = useAuth()
	const [view, setView] = useState<View>('login')

	// Логин
	const [loginEmail, setLoginEmail] = useState('')
	const [loginPassword, setLoginPassword] = useState('')
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)

	// Список
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

	// Категории (только для documentation)
	const [docCats, setDocCats] = useState<Record<string, string[]>>({})
	const [docOrder, setDocOrder] = useState<string[]>([])
	const [selectedCat, setSelectedCat] = useState<string>('none')
	// Новая категория прямо в редакторе
	const [newCatName, setNewCatName] = useState('')
	const [showNewCat, setShowNewCat] = useState(false)

	useEffect(() => {
		if (user?.isAdmin) {
			setView('list')
			void loadPosts()
		}
	}, [user])

	// Загружаем категории при открытии редактора
	const loadCats = () => {
		setDocCats(loadDocCats())
		setDocOrder(loadDocOrder())
	}

	const loadPosts = async () => {
		setPostsLoading(true)
		try {
			const data = await api.adminGetPosts()
			setPosts(data)
		} catch {
		} finally {
			setPostsLoading(false)
		}
	}

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoginError('')
		setLoginLoading(true)
		try {
			const res = await api.login({
				email: loginEmail,
				password: loginPassword,
			})
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

	const openEditor = (post?: Post) => {
		loadCats()
		if (post) {
			setEditingPost(post)
			setTitle(post.title)
			setBody(post.body)
			setTag(post.tag)
			// Находим категорию поста
			const cats = loadDocCats()
			const order = loadDocOrder()
			const cat = order.find(c => cats[c]?.includes(post._id)) || 'none'
			setSelectedCat(cat)
		} else {
			setEditingPost(null)
			setTitle('')
			setBody('')
			setTag('web')
			setSelectedCat('none')
		}
		setEditorError('')
		setNewCatName('')
		setShowNewCat(false)
		setView('editor')
	}

	// Добавить новую категорию прямо из редактора
	const handleAddCat = () => {
		const name = newCatName.trim()
		if (!name || docOrder.includes(name)) return
		const newCats = { ...docCats, [name]: [] }
		const newOrder = [...docOrder, name]
		setDocCats(newCats)
		setDocOrder(newOrder)
		saveDocCats(newCats, newOrder)
		setSelectedCat(name)
		setNewCatName('')
		setShowNewCat(false)
	}

	// Назначить категорию посту
	const assignCategory = (postId: string, catName: string) => {
		const cats = loadDocCats()
		const order = loadDocOrder()
		// Убираем из всех категорий
		const newCats: Record<string, string[]> = {}
		for (const [k, v] of Object.entries(cats)) {
			newCats[k] = v.filter(id => id !== postId)
		}
		// Добавляем в нужную
		if (catName !== 'none' && newCats[catName] !== undefined) {
			newCats[catName] = [...newCats[catName], postId]
		}
		saveDocCats(newCats, order)
	}

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
				if (tag === 'documentation')
					assignCategory(editingPost._id, selectedCat)
			} else {
				const created = await api.adminCreatePost({ title, body, tag })
				if (tag === 'documentation') assignCategory(created._id, selectedCat)
			}
			setView('list')
			void loadPosts()
		} catch (err) {
			setEditorError(err instanceof Error ? err.message : 'Ошибка')
		} finally {
			setSaveLoading(false)
		}
	}

	const handlePublish = async () => {
		if (!title.trim() || !body.trim()) {
			setEditorError('Заполни заголовок и текст')
			return
		}
		setEditorError('')
		setPublishLoading(true)
		try {
			let postId = editingPost?._id
			if (!postId) {
				const created = await api.adminCreatePost({ title, body, tag })
				postId = created._id
			} else {
				await api.adminUpdatePost(postId, { title, body, tag })
			}
			if (tag === 'documentation') assignCategory(postId, selectedCat)
			await api.adminPublishPost(postId)
			setView('list')
			void loadPosts()
		} catch (err) {
			setEditorError(err instanceof Error ? err.message : 'Ошибка публикации')
		} finally {
			setPublishLoading(false)
		}
	}

	const handleTogglePublish = async (post: Post) => {
		try {
			if (post.published) {
				await api.adminUnpublishPost(post._id)
			} else {
				await api.adminPublishPost(post._id)
			}
			void loadPosts()
		} catch {}
	}

	const handleDelete = async (id: string) => {
		if (!confirm('Удалить статью?')) return
		try {
			await api.adminDeletePost(id)
			// Убираем из категорий
			const cats = loadDocCats()
			const order = loadDocOrder()
			const newCats: Record<string, string[]> = {}
			for (const [k, v] of Object.entries(cats)) {
				newCats[k] = v.filter(i => i !== id)
			}
			saveDocCats(newCats, order)
			void loadPosts()
		} catch {}
	}

	// ── Страница входа ────────────────────────────────────────────────────────
	if (view === 'login') {
		return (
			<div className='min-h-[80vh] flex items-center justify-center px-4'>
				<div className='w-full max-w-sm'>
					<div className='text-center mb-8'>
						<h1 className='text-xl font-medium text-gray-900 dark:text-white'>
							Панель управления
						</h1>
						<p className='text-sm text-gray-500 mt-1'>
							Только для администратора
						</p>
						<p className='text-xs text-gray-400 mt-1'>
							orel-news.com
							<span className='font-medium text-gray-500'>/admin</span>
						</p>
					</div>
					<div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6'>
						<form onSubmit={handleLogin} className='space-y-4'>
							<Input
								label='Email'
								type='email'
								value={loginEmail}
								onChange={e => setLoginEmail(e.target.value)}
								placeholder='admin@orel.app'
								required
							/>
							<Input
								label='Пароль'
								type='password'
								value={loginPassword}
								onChange={e => setLoginPassword(e.target.value)}
								placeholder='••••••••'
								required
							/>
							{loginError && (
								<p className='text-xs text-red-500'>{loginError}</p>
							)}
							<Button type='submit' fullWidth loading={loginLoading}>
								Войти
							</Button>
						</form>
					</div>
					<button
						onClick={() => router.push('/')}
						className='text-xs text-gray-400 hover:text-gray-600 mt-4 mx-auto block transition-colors'
					>
						← На сайт
					</button>
				</div>
			</div>
		)
	}

	// ── Редактор ──────────────────────────────────────────────────────────────
	if (view === 'editor') {
		const isDoc = tag === 'documentation'

		return (
			<div className='max-w-2xl mx-auto'>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-lg font-medium text-gray-900 dark:text-white'>
						{editingPost ? 'Редактировать статью' : 'Новая статья'}
					</h1>
					<button
						onClick={() => setView('list')}
						className='text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
					>
						← Назад
					</button>
				</div>

				<div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden'>
					{/* Тулбар */}
					<div className='flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex-wrap'>
						{/* Тег */}
						<select
							value={tag}
							onChange={e => {
								setTag(e.target.value as PostTag)
								setSelectedCat('none')
							}}
							className='text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none'
						>
							{tagOptions.map(t => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>

						{/* Категория — только для documentation */}
						{isDoc && (
							<>
								<select
									value={selectedCat}
									onChange={e => setSelectedCat(e.target.value)}
									className='text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none'
								>
									<option value='none'>Без категории</option>
									{docOrder.map(cat => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>

								{/* Создать новую категорию */}
								{showNewCat ? (
									<>
										<input
											autoFocus
											value={newCatName}
											onChange={e => setNewCatName(e.target.value)}
											onKeyDown={e => {
												if (e.key === 'Enter') handleAddCat()
												if (e.key === 'Escape') setShowNewCat(false)
											}}
											placeholder='Название...'
											className='text-xs border border-violet-300 dark:border-violet-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none w-32'
										/>
										<button
											onClick={handleAddCat}
											className='text-xs bg-violet-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-violet-700 transition-colors'
										>
											ОК
										</button>
										<button
											onClick={() => setShowNewCat(false)}
											className='text-xs text-gray-400 hover:text-gray-600 px-1'
										>
											✕
										</button>
									</>
								) : (
									<button
										onClick={() => setShowNewCat(true)}
										className='text-xs text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1'
									>
										<FiPlus size={11} /> Новая категория
									</button>
								)}
							</>
						)}

						<span className='text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 ml-auto'>
							AI переведёт при публикации
						</span>
					</div>

					{/* Заголовок */}
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Заголовок статьи...'
						className='w-full px-5 py-4 text-lg font-medium border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none placeholder-gray-300 dark:placeholder-gray-600'
					/>

					{/* Подсказка для документации */}
					{isDoc && (
						<div className='px-5 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800'>
							<p className='text-xs text-gray-400 dark:text-gray-500'>
								OREL Markdown: <span className='font-mono'># ## ###</span>{' '}
								заголовки · <span className='font-mono'>**жирный**</span> ·{' '}
								<span className='font-mono'>*курсив*</span> ·{' '}
								<span className='font-mono'>```</span> код ·{' '}
								<span className='font-mono'>&gt;&gt;</span> инлайн-код ·{' '}
								<span className='font-mono'>&gt;&gt;&gt;</span> терминал ·{' '}
								<span className='font-mono'>- список</span> ·{' '}
								<span className='font-mono'>&gt; цитата</span>
							</p>
						</div>
					)}

					{/* Тело */}
					<textarea
						value={body}
						onChange={e => setBody(e.target.value)}
						placeholder={
							isDoc
								? '# Введение\n\nПиши документацию на русском...'
								: 'Пиши на русском — при публикации AI автоматически переведёт на EN, AR и UG...'
						}
						rows={18}
						className='w-full px-5 py-4 text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none leading-relaxed font-mono'
					/>

					{/* Футер */}
					<div className='flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800'>
						<div className='flex items-center gap-3'>
							<span className='text-xs text-gray-400'>
								{body.length} символов
							</span>
							{isDoc && selectedCat !== 'none' && (
								<span className='text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded-full'>
									{selectedCat}
								</span>
							)}
						</div>
						<div className='flex gap-2 items-center'>
							{editorError && (
								<p className='text-xs text-red-500'>{editorError}</p>
							)}
							<Button
								variant='secondary'
								loading={saveLoading}
								onClick={() => void handleSave()}
							>
								Черновик
							</Button>
							<Button
								loading={publishLoading}
								onClick={() => void handlePublish()}
							>
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
		<div className='max-w-3xl mx-auto'>
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-lg font-medium text-gray-900 dark:text-white'>
					Панель управления
				</h1>
				<div className='flex gap-2'>
					<Button onClick={() => openEditor()}>
						<span className='flex items-center gap-1.5'>
							<FiPlus size={14} /> Новая статья
						</span>
					</Button>
					<Button variant='secondary' onClick={() => void logout()}>
						<FiLogOut size={14} />
					</Button>
				</div>
			</div>

			{postsLoading && (
				<div className='space-y-3'>
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							className='h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse'
						/>
					))}
				</div>
			)}

			{!postsLoading && posts.length === 0 && (
				<div className='text-center py-16'>
					<p className='text-sm text-gray-400'>Статей пока нет</p>
				</div>
			)}

			{!postsLoading && posts.length > 0 && (
				<div className='space-y-3'>
					{posts.map(post => (
						<div
							key={post._id}
							className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3'
						>
							<span
								className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${tagStyles[post.tag]}`}
							>
								{post.tag.toUpperCase()}
							</span>
							<p className='text-sm text-gray-900 dark:text-white flex-1 truncate'>
								{post.title}
							</p>
							<span
								className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
									post.published
										? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
										: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
								}`}
							>
								{post.published ? 'Опубликовано' : 'Черновик'}
							</span>
							<div className='flex items-center gap-1 shrink-0'>
								<button
									onClick={() => openEditor(post)}
									className='p-1.5 text-gray-400 hover:text-violet-600 transition-colors'
									title='Редактировать'
								>
									<FiEdit2 size={14} />
								</button>
								<button
									onClick={() => void handleTogglePublish(post)}
									className='p-1.5 text-gray-400 hover:text-green-600 transition-colors'
									title={post.published ? 'Снять с публикации' : 'Опубликовать'}
								>
									{post.published ? (
										<FiEyeOff size={14} />
									) : (
										<FiEye size={14} />
									)}
								</button>
								<button
									onClick={() => void handleDelete(post._id)}
									className='p-1.5 text-gray-400 hover:text-red-500 transition-colors'
									title='Удалить'
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
