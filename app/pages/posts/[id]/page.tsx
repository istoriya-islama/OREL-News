'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import DocLayout from '@/app/Components/DocLayout'
import { api, Comment, Post } from '@/app/lib/api'
import { parseOrelMarkdown } from '@/app/lib/orelMarkdown'
import { useAuth } from '@/app/store/auth'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

// ── Стили (один раз на странице) ─────────────────────────────────────────────
const ORM_STYLES = `
  /* ── Общие для news и doc ────────────────────────────── */
  .orm-pre {
    background: #111827;
    border-radius: 0.75rem;
    padding: 1rem 1.2rem;
    margin: 0.8rem 0;
    overflow-x: auto;
  }
  .orm-pre code {
    font-family: 'Geist Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.8rem;
    color: #e5e7eb;
    line-height: 1.75;
    background: transparent;
    padding: 0;
    border: none;
  }
  .orm-code {
    font-family: 'Geist Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.8rem;
    background: #ede9fe;
    color: #5b21b6;
    padding: 0.15em 0.45em;
    border-radius: 0.3rem;
  }
  .dark .orm-code { background: #2e1065; color: #c4b5fd; }

  .orm-terminal {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'Geist Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.8rem;
    background: #111827;
    color: #34d399;
    padding: 0.15em 0.6em;
    border-radius: 0.35rem;
  }
  .orm-terminal-prompt { color: #4b5563; user-select: none; }

  /* ── News стиль ──────────────────────────────────────── */
  .orm-news .orm-h1 {
    font-size: 1.35rem; font-weight: 600;
    color: inherit; margin: 1.5rem 0 0.5rem;
    border-bottom: 1px solid #e5e7eb; padding-bottom: 0.35rem;
  }
  .dark .orm-news .orm-h1 { border-color: #1f2937; }
  .orm-news .orm-h2 {
    font-size: 1.05rem; font-weight: 600;
    color: inherit; margin: 1.2rem 0 0.4rem;
  }
  .orm-news .orm-h3 {
    font-size: 0.9rem; font-weight: 600;
    color: #7c3aed; margin: 1rem 0 0.3rem;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
  .orm-news .orm-p {
    font-size: 0.9rem; line-height: 1.8;
    color: #374151; margin: 0;
  }
  .dark .orm-news .orm-p { color: #e5e7eb; }
  .orm-news .orm-spacer { height: 0.55rem; }
  .orm-news .orm-list {
    margin: 0.4rem 0 0.4rem 1rem;
    list-style: none; display: flex; flex-direction: column; gap: 0.3rem;
  }
  .orm-news .orm-list li {
    font-size: 0.9rem; line-height: 1.65;
    color: #374151; position: relative; padding-left: 1rem;
  }
  .dark .orm-news .orm-list li { color: #e5e7eb; }
  .orm-news .orm-list li::before { content: '·'; position: absolute; left: 0; color: #7c3aed; font-size: 1.1rem; line-height: 1.4; }
  .orm-news .orm-blockquote {
    border-left: 3px solid #7c3aed;
    margin: 0.8rem 0; padding: 0.5rem 1rem;
    background: #f5f3ff; border-radius: 0 0.5rem 0.5rem 0;
    font-size: 0.875rem; color: #4b5563; font-style: italic;
  }
  .dark .orm-news .orm-blockquote { background: #1e1730; color: #c4b5fd; }

  /* ── Doc стиль ───────────────────────────────────────── */
  .orm-doc .orm-h1 {
    font-size: 1.5rem; font-weight: 700;
    color: inherit; margin: 0 0 0.3rem;
    padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;
  }
  .dark .orm-doc .orm-h1 { border-color: #1f2937; }
  .orm-doc .orm-h2 {
    font-size: 1.1rem; font-weight: 600;
    color: inherit; margin: 2rem 0 0.5rem;
    padding-top: 1.5rem; border-top: 1px solid #f3f4f6;
    scroll-margin-top: 5rem;
  }
  .dark .orm-doc .orm-h2 { border-color: #111827; }
  .orm-doc .orm-h3 {
    font-size: 0.875rem; font-weight: 600;
    color: #6d28d9; margin: 1.2rem 0 0.3rem;
    letter-spacing: 0.03em; scroll-margin-top: 5rem;
  }
  .orm-doc [id] { scroll-margin-top: 5rem; }
  .orm-doc .orm-p {
    font-size: 0.875rem; line-height: 1.85;
    color: #374151; margin: 0;
  }
  .dark .orm-doc .orm-p { color: #e5e7eb; }
  .orm-doc .orm-spacer { height: 0.4rem; }
  .orm-doc .orm-list {
    margin: 0.5rem 0 0.5rem 1.1rem;
    list-style: none; display: flex; flex-direction: column; gap: 0.25rem;
  }
  .orm-doc .orm-list li {
    font-size: 0.875rem; line-height: 1.7;
    color: #374151; position: relative; padding-left: 1rem;
  }
  .dark .orm-doc .orm-list li { color: #e5e7eb; }
  .orm-doc .orm-list li::before { content: '–'; position: absolute; left: 0; color: #7c3aed; }
  .orm-doc .orm-blockquote {
    border-left: 3px solid #d1d5db;
    margin: 0.75rem 0; padding: 0.4rem 1rem;
    background: transparent; border-radius: 0 0.4rem 0.4rem 0;
    font-size: 0.875rem; color: #9ca3af;
  }
  .dark .orm-doc .orm-blockquote { background: #111827; border-color: #374151; color: #d1d5db; }
`

// ── Вспомогалки ──────────────────────────────────────────────────────────────
const tagStyles: Record<string, string> = {
  web: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  ai: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  mobile: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  os: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  documentation: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}
const tagLabels: Record<string, string> = {
  web: 'Web', ai: 'AI', mobile: 'Mobile', os: 'OS', documentation: 'Documentation',
}

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

// ── Компонент ────────────────────────────────────────────────────────────────
export default function PostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [allDocs, setAllDocs] = useState<Post[]>([])
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
        // Если документация — грузим все доки для сайдбара
        if (data.tag === 'documentation') {
          const all = await api.getPosts()
          setAllDocs(all.filter(p => p.tag === 'documentation'))
        }
      } catch {
        setError('Статья не найдена')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  // Парсим markdown
  const { html, headings } = useMemo(() => {
    if (!post) return { html: '', headings: [] }
    return parseOrelMarkdown(post.body, post.tag === 'documentation')
  }, [post])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentError('')
    setCommentLoading(true)
    try {
      const updated = await api.addComment(id, commentText)
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
      await api.deleteComment(id, index.toString())
      setPost(prev =>
        prev ? { ...prev, comments: prev.comments.filter((_, i) => i !== index) } : prev,
      )
    } catch {}
  }

  // ── Скелетон ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="space-y-2 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-400 dark:text-gray-100 mb-4">{error || 'Статья не найдена'}</p>
        <Button variant="secondary" onClick={() => router.push('/')}>← На главную</Button>
      </div>
    )
  }

  const isDoc = post.tag === 'documentation'

  // ── Общий контент страницы ───────────────────────────────────────────────
  const pageContent = (
    <div className={isDoc ? 'max-w-2xl' : 'max-w-2xl mx-auto'}>
      <style dangerouslySetInnerHTML={{ __html: ORM_STYLES }} />

      {/* Кнопка назад */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-400 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 mb-6 flex items-center gap-1 transition-colors"
      >
        ← Назад
      </button>

      {/* Тег */}
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagStyles[post.tag] ?? tagStyles.web}`}>
        {tagLabels[post.tag] ?? post.tag}
      </span>

      {/* Заголовок */}
      <h1 className="text-2xl font-medium text-gray-900 dark:text-white mt-4 mb-3 leading-snug">
        {post.title}
      </h1>

      {/* Дата */}
      <p className="text-sm text-gray-400 dark:text-gray-100 mb-8">
        {formatDate(post.createdAt)}
      </p>

      <div className="border-t border-gray-100 dark:border-gray-800 mb-8" />

      {/* Тело */}
      <article
        className={isDoc ? 'orm-doc' : 'orm-news'}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="border-t border-gray-100 dark:border-gray-800 mt-12 mb-8" />

      {/* Комментарии */}
      <section>
        <h2 className="text-base font-medium text-gray-900 dark:text-white mb-6">
          Комментарии{' '}
          {post.comments.length > 0 && (
            <span className="text-gray-400 dark:text-gray-100 font-normal">({post.comments.length})</span>
          )}
        </h2>

        {post.comments.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-100 mb-6">Пока нет комментариев. Будь первым!</p>
        )}

        <div className="space-y-4 mb-8">
          {post.comments.map((comment: Comment, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-medium">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {comment.authorName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-100">{formatDate(comment.createdAt)}</span>
                  {user && (user._id === comment.authorId || user.isAdmin) && (
                    <button
                      onClick={() => void handleDeleteComment(index)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-100 leading-relaxed">
                {comment.text}
              </p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleComment} className="space-y-3">
            <Input
              placeholder="Напиши комментарий..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              required
            />
            {commentError && <p className="text-xs text-red-500">{commentError}</p>}
            <Button type="submit" loading={commentLoading}>Отправить</Button>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Чтобы оставить комментарий,{' '}
              <a href="/pages/auth/login" className="text-violet-600 hover:underline font-medium">
                войди в аккаунт
              </a>
            </p>
          </div>
        )}
      </section>
    </div>
  )

  // ── Документация — с сайдбаром ───────────────────────────────────────────
  if (isDoc) {
    return (
      <DocLayout post={post} allDocs={allDocs} headings={headings}>
        {pageContent}
      </DocLayout>
    )
  }

  // ── Новость — как раньше ─────────────────────────────────────────────────
  return pageContent
}