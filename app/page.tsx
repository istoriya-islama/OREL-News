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
        setPosts(data.filter(p => p.tag !== 'documentation'))
      } catch {
        setError('Не удалось загрузить статьи')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = activeTag === 'all' ? posts : posts.filter(p => p.tag === activeTag)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Масштадный editorial-заголовок в мягкой панели */}
      <div className="bg-surface-soft rounded-[32px] px-8 py-11 sm:px-12 sm:py-14 mb-6">
        <div className="text-xs font-medium text-accent mb-4">Блог о разработке</div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-text-primary leading-tight max-w-xl mb-3">
          Веб, мобильные приложения, AI и операционки — без воды
        </h1>
        <p className="text-sm text-text-secondary max-w-md leading-relaxed">
          Разборы, релизы и заметки от команды OREL. Обновляется по мере того, как что-то ломается или взлетает.
        </p>
      </div>

      {/* Баннер OREL Insider */}
      <div className="bg-accent-soft-bg rounded-3xl px-6 py-5 mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-accent-soft-text">OREL Insider</p>
          <p className="text-xs text-accent-soft-text/80 mt-0.5">
            Скачивай тестовые версии приложений раньше всех
          </p>
        </div>
        <a
          href="https://orel-insider.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium bg-surface text-accent-soft-text rounded-full px-4 py-2.5 hover:shadow-sm transition-shadow shrink-0"
        >
          Перейти →
        </a>
      </div>

      {/* Фильтр по тегам */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tags.map(tag => (
          <button
            key={tag.value}
            onClick={() => setActiveTag(tag.value)}
            className={`text-xs px-4 py-2 rounded-full transition-colors cursor-pointer font-medium ${
              activeTag === tag.value
                ? 'bg-text-primary text-page'
                : 'bg-surface-soft text-text-secondary hover:text-text-primary'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Статьи */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface-soft rounded-3xl h-44 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-text-muted">Статей пока нет</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((post, i) => (
            <PostCard key={post._id} post={post} featured={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
