'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import DocLayout from '@/app/Components/DocLayout'
import MarkdownContent from '@/app/Components/MarkdownContent'
import { api, Comment, Post } from '@/app/lib/api'
import { extractHeadings } from '@/app/lib/markdown'
import { useAuth } from '@/app/store/auth'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const tagStyles: Record<string, string> = {
  web: 'bg-[var(--tag-web-bg)] text-[var(--tag-web-text)]',
  ai: 'bg-[var(--tag-ai-bg)] text-[var(--tag-ai-text)]',
  mobile: 'bg-[var(--tag-mobile-bg)] text-[var(--tag-mobile-text)]',
  os: 'bg-[var(--tag-os-bg)] text-[var(--tag-os-text)]',
  documentation: 'bg-[var(--tag-doc-bg)] text-[var(--tag-doc-text)]',
}
const tagLabels: Record<string, string> = {
  web: 'Web', ai: 'AI', mobile: 'Mobile', os: 'OS', documentation: 'Documentation',
}

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

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

  // Заголовки для сайдбара документации — считаем прямо из markdown-исходника
  const headings = useMemo(() => {
    if (!post || post.tag !== 'documentation') return []
    return extractHeadings(post.body)
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

  const handleDeleteComment = async (commentId: string, commentt: Comment) => {
  try {
    console.log('Comment:',  commentt)
    console.log('Comment ID:',  commentt._id)
    await api.deleteComment(id, commentId)

    setPost(prev =>
      prev
        ? {
            ...prev,
            comments: prev.comments.filter(comment => comment._id !== commentId),
          }
        : prev,
    )
  } catch {}
}

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-4 w-20 bg-surface-soft rounded-full" />
        <div className="h-8 w-3/4 bg-surface-soft rounded-2xl" />
        <div className="h-4 w-32 bg-surface-soft rounded-full" />
        <div className="space-y-2 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-surface-soft rounded-full" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-text-muted mb-4">{error || 'Статья не найдена'}</p>
        <Button variant="secondary" onClick={() => router.push('/')}>← На главную</Button>
      </div>
    )
  }

  const isDoc = post.tag === 'documentation'

  const pageContent = (
    <div className={isDoc ? 'max-w-2xl' : 'max-w-2xl mx-auto'}>

      <button
        onClick={() => router.back()}
        className="text-sm text-text-muted hover:text-text-secondary mb-6 flex items-center gap-1 transition-colors"
      >
        ← Назад
      </button>

      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tagStyles[post.tag] ?? tagStyles.web}`}>
        {tagLabels[post.tag] ?? post.tag}
      </span>

      <h1 className="font-serif text-2xl font-semibold text-text-primary mt-4 mb-3 leading-snug">
        {post.title}
      </h1>

      <p className="text-sm text-text-muted mb-8">
        {formatDate(post.createdAt)}
      </p>

      <div className="border-t border-border-soft mb-8" />

      <article>
        <MarkdownContent content={post.body} />
      </article>

      <div className="border-t border-border-soft mt-12 mb-8" />

      <section>
        <h2 className="text-base font-medium text-text-primary mb-6">
          Комментарии{' '}
          {post.comments.length > 0 && (
            <span className="text-text-muted font-normal">({post.comments.length})</span>
          )}
        </h2>

        {post.comments.length === 0 && (
          <p className="text-sm text-text-muted mb-6">Пока нет комментариев. Будь первым!</p>
        )}

        <div className="space-y-4 mb-8">
          {post.comments.map((comment: Comment, index: number) => (
            <div key={index} className="bg-surface-soft rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-soft-bg flex items-center justify-center text-accent-soft-text text-xs font-medium">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {comment.authorName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
                  {user && (user._id === comment.authorId || user.isAdmin) && (
                    <button
                      onClick={() => void handleDeleteComment(comment._id, comment)}
                      className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
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
            {commentError && <p className="text-xs text-rose-500">{commentError}</p>}
            <Button type="submit" loading={commentLoading}>Отправить</Button>
          </form>
        ) : (
          <div className="bg-surface-soft rounded-2xl px-4 py-3 text-center">
            <p className="text-sm text-text-secondary">
              Чтобы оставить комментарий,{' '}
              <a href="/pages/auth/login" className="text-accent hover:underline font-medium">
                войди в аккаунт
              </a>
            </p>
          </div>
        )}
      </section>
    </div>
  )

  if (isDoc) {
    return (
      <DocLayout post={post} allDocs={allDocs} headings={headings}>
        {pageContent}
      </DocLayout>
    )
  }

  return pageContent
}
