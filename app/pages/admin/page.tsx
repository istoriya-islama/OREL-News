'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import MarkdownContent from '@/app/Components/MarkdownContent'
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
type EditorTab = 'write' | 'preview'

const tagOptions: { value: PostTag; label: string }[] = [
	{ value: 'web', label: 'Веб' },
	{ value: 'ai', label: 'AI' },
	{ value: 'mobile', label: 'Mobile' },
	{ value: 'os', label: 'OS' },
	{ value: 'documentation', label: 'Documentation' },
]

const tagStyles: Record<string, string> = {
	web: 'bg-[var(--tag-web-bg)] text-[var(--tag-web-text)]',
	ai: 'bg-[var(--tag-ai-bg)] text-[var(--tag-ai-text)]',
	mobile: 'bg-[var(--tag-mobile-bg)] text-[var(--tag-mobile-text)]',
	os: 'bg-[var(--tag-os-bg)] text-[var(--tag-os-text)]',
	documentation: 'bg-[var(--tag-doc-bg)] text-[var(--tag-doc-text)]',
}

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

	const [loginEmail, setLoginEmail] = useState('')
	const [loginPassword, setLoginPassword] = useState('')
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)

	const [posts, setPosts] = useState<Post[]>([])
	const [postsLoading, setPostsLoading] = useState(false)

	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const [title, setTitle] = useState('')
	const [body, setBody] = useState('')
	const [tag, setTag] = useState<PostTag>('web')
	const [saveLoading, setSaveLoading] = useState(false)
	const [publishLoading, setPublishLoading] = useState(false)
	const [editorError, setEditorError] = useState('')
	const [editorTab, setEditorTab] = useState<EditorTab>('write')

	const [docCats, setDocCats] = useState<Record<string, string[]>>({})
	const [docOrder, setDocOrder] = useState<string[]>([])
	const [selectedCat, setSelectedCat] = useState<string>('none')
	const [newCatName, setNewCatName] = useState('')
	const [showNewCat, setShowNewCat] = useState(false)

	useEffect(() => {
		if (user?.isAdmin) {
			setView('list')
			void loadPosts()
		}
	}, [user])

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
		setEditorTab('write')
		setView('editor')
	}

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

	const assignCategory = (postId: string, catName: string) => {
		const cats = loadDocCats()
		const order = loadDocOrder()
		const newCats: Record<string, string[]> = {}
		for (const [k, v] of Object.entries(cats)) {
			newCats[k] = v.filter(id => id !== postId)
		}
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
						<h1 className='font-serif text-xl font-semibold text-text-primary'>
							Панель управления
						</h1>
						<p className='text-sm text-text-secondary mt-1'>
							Только для администратора
						</p>
						<p className='text-xs text-text-muted mt-1'>
							orel-news.com
							<span className='font-medium text-text-secondary'>/admin</span>
						</p>
					</div>
					<div className='bg-surface rounded-3xl p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
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
								<p className='text-xs text-rose-500'>{loginError}</p>
							)}
							<Button type='submit' fullWidth loading={loginLoading}>
								Войти
							</Button>
						</form>
					</div>
					<button
						onClick={() => router.push('/')}
						className='text-xs text-text-muted hover:text-text-secondary mt-4 mx-auto block transition-colors'
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
					<h1 className='font-serif text-lg font-semibold text-text-primary'>
						{editingPost ? 'Редактировать статью' : 'Новая статья'}
					</h1>
					<button
						onClick={() => setView('list')}
						className='text-sm text-text-muted hover:text-text-secondary transition-colors'
					>
						← Назад
					</button>
				</div>

				<div className='bg-surface rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
					{/* Тулбар */}
					<div className='flex items-center gap-2 px-4 py-3 border-b border-border-soft bg-surface-soft flex-wrap'>
						<select
							value={tag}
							onChange={e => {
								setTag(e.target.value as PostTag)
								setSelectedCat('none')
							}}
							className='text-xs border border-border-soft rounded-full px-3 py-1.5 bg-surface text-text-secondary outline-none'
						>
							{tagOptions.map(t => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>

						{isDoc && (
							<>
								<select
									value={selectedCat}
									onChange={e => setSelectedCat(e.target.value)}
									className='text-xs border border-border-soft rounded-full px-3 py-1.5 bg-surface text-text-secondary outline-none'
								>
									<option value='none'>Без категории</option>
									{docOrder.map(cat => (
										<option key={cat} value={cat}>
											{cat}
										</option>
									))}
								</select>

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
											className='text-xs border border-accent/40 rounded-full px-3 py-1.5 bg-surface text-text-primary outline-none w-32'
										/>
										<button
											onClick={handleAddCat}
											className='text-xs bg-accent text-white px-3 py-1.5 rounded-full hover:bg-accent-hover transition-colors'
										>
											ОК
										</button>
										<button
											onClick={() => setShowNewCat(false)}
											className='text-xs text-text-muted hover:text-text-secondary px-1'
										>
											✕
										</button>
									</>
								) : (
									<button
										onClick={() => setShowNewCat(true)}
										className='text-xs text-text-muted hover:text-accent border border-border-soft rounded-full px-3 py-1.5 transition-colors flex items-center gap-1'
									>
										<FiPlus size={11} /> Новая категория
									</button>
								)}
							</>
						)}

						<span className='text-xs bg-[var(--tag-os-bg)] text-[var(--tag-os-text)] px-3 py-1.5 rounded-full ml-auto'>
							AI переведёт при публикации
						</span>
					</div>

					{/* Заголовок */}
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Заголовок статьи...'
						className='w-full px-6 py-4 text-lg font-serif font-medium border-b border-border-soft bg-surface text-text-primary outline-none placeholder-text-muted'
					/>

					{/* Подсказка по markdown */}
					{isDoc && (
						<div className='px-6 py-2.5 bg-surface-soft border-b border-border-soft'>
							<p className='text-xs text-text-muted'>
								Markdown: <span className='font-mono'># ## ###</span> заголовки ·{' '}
								<span className='font-mono'>**жирный**</span> ·{' '}
								<span className='font-mono'>*курсив*</span> ·{' '}
								<span className='font-mono'>`код`</span> ·{' '}
								<span className='font-mono'>```блок```</span> ·{' '}
								<span className='font-mono'>- список</span> ·{' '}
								<span className='font-mono'>&gt; цитата</span> ·{' '}
								<span className='font-mono'>[ссылка](url)</span> ·{' '}
								<span className='font-mono'>| таблицы |</span>
							</p>
						</div>
					)}

					{/* Переключатель write / preview */}
					<div className='flex items-center gap-1 px-4 pt-3'>
						<button
							onClick={() => setEditorTab('write')}
							className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors ${
								editorTab === 'write'
									? 'bg-text-primary text-page'
									: 'text-text-secondary hover:bg-surface-soft'
							}`}
						>
							Писать
						</button>
						<button
							onClick={() => setEditorTab('preview')}
							className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-colors ${
								editorTab === 'preview'
									? 'bg-text-primary text-page'
									: 'text-text-secondary hover:bg-surface-soft'
							}`}
						>
							Предпросмотр
						</button>
					</div>

					{/* Тело / превью */}
					{editorTab === 'write' ? (
						<textarea
							value={body}
							onChange={e => setBody(e.target.value)}
							placeholder={
								isDoc
									? '# Введение\n\nПиши документацию на русском...'
									: 'Пиши на русском — при публикации AI автоматически переведёт на EN, AR и UG...'
							}
							rows={18}
							className='w-full px-6 py-4 text-sm bg-surface text-text-secondary outline-none placeholder-text-muted resize-none leading-relaxed font-mono'
						/>
					) : (
						<div className='px-6 py-4 min-h-[420px]'>
							{body.trim() ? (
								<MarkdownContent content={body} />
							) : (
								<p className='text-sm text-text-muted'>Нечего показывать — начни писать во вкладке «Писать»</p>
							)}
						</div>
					)}

					{/* Футер */}
					<div className='flex items-center justify-between px-4 py-3 border-t border-border-soft bg-surface-soft'>
						<div className='flex items-center gap-3'>
							<span className='text-xs text-text-muted'>
								{body.length} символов
							</span>
							{isDoc && selectedCat !== 'none' && (
								<span className='text-xs text-accent-soft-text bg-accent-soft-bg px-2.5 py-0.5 rounded-full'>
									{selectedCat}
								</span>
							)}
						</div>
						<div className='flex gap-2 items-center'>
							{editorError && (
								<p className='text-xs text-rose-500'>{editorError}</p>
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
				<h1 className='font-serif text-lg font-semibold text-text-primary'>
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
							className='h-16 bg-surface-soft rounded-2xl animate-pulse'
						/>
					))}
				</div>
			)}

			{!postsLoading && posts.length === 0 && (
				<div className='text-center py-16'>
					<p className='text-sm text-text-muted'>Статей пока нет</p>
				</div>
			)}

			{!postsLoading && posts.length > 0 && (
				<div className='space-y-3'>
					{posts.map(post => (
						<div
							key={post._id}
							className='bg-surface rounded-3xl px-5 py-3.5 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
						>
							<span
								className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${tagStyles[post.tag]}`}
							>
								{post.tag.toUpperCase()}
							</span>
							<p className='text-sm text-text-primary flex-1 truncate'>
								{post.title}
							</p>
							<span
								className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
									post.published
										? 'bg-[var(--tag-mobile-bg)] text-[var(--tag-mobile-text)]'
										: 'bg-surface-soft text-text-muted'
								}`}
							>
								{post.published ? 'Опубликовано' : 'Черновик'}
							</span>
							<div className='flex items-center gap-1 shrink-0'>
								<button
									onClick={() => openEditor(post)}
									className='p-1.5 text-text-muted hover:text-accent transition-colors'
									title='Редактировать'
								>
									<FiEdit2 size={14} />
								</button>
								<button
									onClick={() => void handleTogglePublish(post)}
									className='p-1.5 text-text-muted hover:text-emerald-600 transition-colors'
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
									className='p-1.5 text-text-muted hover:text-rose-500 transition-colors'
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
