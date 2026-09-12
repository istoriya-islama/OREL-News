'use client'

import { api, Post } from '@/app/lib/api'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiBook, FiChevronDown, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '@/app/store/auth'

const LS_CATS = 'docs-categories'
const LS_ORDER = 'docs-category-order'

function loadCats(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(LS_CATS) || '{}') } catch { return {} }
}
function loadOrder(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_ORDER) || '[]') } catch { return [] }
}
function saveCats(cats: Record<string, string[]>, order: string[]) {
  localStorage.setItem(LS_CATS, JSON.stringify(cats))
  localStorage.setItem(LS_ORDER, JSON.stringify(order))
}

export default function DocsPage() {
  const { user } = useAuth()
  const isAdmin = user?.isAdmin

  const [docs, setDocs] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const [cats, setCats] = useState<Record<string, string[]>>({})
  const [order, setOrder] = useState<string[]>([])
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})

  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.getPosts()
        const sorted = all
          .filter(p => p.tag === 'documentation')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        setDocs(sorted)
      } catch {}
      finally { setLoading(false) }
    }
    void load()

    const c = loadCats()
    const o = loadOrder()
    setCats(c)
    setOrder(o)
    const open: Record<string, boolean> = {}
    o.forEach(name => { open[name] = true })
    setOpenCats(open)
  }, [])

  const assignedIds = new Set(Object.values(cats).flat())
  const uncategorized = docs.filter(d => !assignedIds.has(d._id))

  const handleAddCat = () => {
    const name = newCatName.trim()
    if (!name || order.includes(name)) return
    const newCats = { ...cats, [name]: [] }
    const newOrder = [...order, name]
    setCats(newCats)
    setOrder(newOrder)
    setOpenCats(prev => ({ ...prev, [name]: true }))
    saveCats(newCats, newOrder)
    setNewCatName('')
    setAddingCat(false)
  }

  const handleDeleteCat = (name: string) => {
    const { [name]: _, ...rest } = cats
    const newOrder = order.filter(n => n !== name)
    setCats(rest)
    setOrder(newOrder)
    saveCats(rest, newOrder)
  }

  const handleAssign = (docId: string, catName: string) => {
    const newCats: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(cats)) {
      newCats[k] = v.filter(id => id !== docId)
    }
    if (catName !== 'none') {
      newCats[catName] = [...(newCats[catName] || []), docId]
    }
    setCats(newCats)
    saveCats(newCats, order)
  }

  const toggleCat = (name: string) =>
    setOpenCats(prev => ({ ...prev, [name]: !prev[name] }))

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })

  const DocItem = ({ doc }: { doc: Post }) => (
    <Link
      href={`/pages/posts/${doc._id}`}
      className="group flex items-start gap-3 px-3.5 py-3 rounded-2xl hover:bg-surface-soft transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-accent-soft-bg flex items-center justify-center shrink-0 mt-0.5">
        <FiBook size={13} className="text-accent-soft-text" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate font-medium group-hover:text-accent transition-colors">
          {doc.title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{formatDate(doc.createdAt)}</p>
      </div>
      {isAdmin && (
        <select
          value={order.find(cat => cats[cat]?.includes(doc._id)) || 'none'}
          onChange={e => { e.preventDefault(); handleAssign(doc._id, e.target.value) }}
          onClick={e => e.preventDefault()}
          className="text-xs border border-border-soft rounded-lg px-1.5 py-1 bg-surface text-text-secondary outline-none shrink-0"
        >
          <option value="none">Без категории</option>
          {order.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      )}
    </Link>
  )

  return (
    <div className="max-w-3xl mx-auto">
      {/* Editorial-шапка */}
      <div className="bg-surface-soft rounded-[28px] px-8 py-10 mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-medium text-accent mb-3">Справочник OREL</div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-text-primary mb-2">
            Документация
          </h1>
          <p className="text-sm text-text-secondary max-w-md">
            Руководства, справочники и технические материалы OREL
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {addingCat ? (
              <>
                <input
                  autoFocus
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCat(); if (e.key === 'Escape') setAddingCat(false) }}
                  placeholder="Название категории"
                  className="text-xs border border-border-soft rounded-full px-3.5 py-2 bg-surface text-text-primary outline-none focus:border-accent w-44"
                />
                <button
                  onClick={handleAddCat}
                  className="text-xs bg-accent hover:bg-accent-hover text-white px-3.5 py-2 rounded-full transition-colors"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setAddingCat(false)}
                  className="text-xs text-text-muted hover:text-text-secondary px-2 py-2"
                >
                  Отмена
                </button>
              </>
            ) : (
              <button
                onClick={() => setAddingCat(true)}
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent bg-surface rounded-full px-3.5 py-2.5 transition-colors"
              >
                <FiPlus size={12} /> Категория
              </button>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-soft rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && docs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-text-muted">Документации пока нет</p>
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div className="space-y-4">

          {order.map(catName => {
            const catDocs = (cats[catName] || [])
              .map(id => docs.find(d => d._id === id))
              .filter(Boolean) as Post[]

            return (
              <div key={catName} className="bg-surface rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <button
                  onClick={() => toggleCat(catName)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-soft transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {openCats[catName]
                      ? <FiChevronDown size={14} className="text-text-muted" />
                      : <FiChevronRight size={14} className="text-text-muted" />
                    }
                    <span className="text-sm font-semibold text-text-primary">{catName}</span>
                    <span className="text-xs text-text-muted bg-surface-soft px-2 py-0.5 rounded-full">{catDocs.length}</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteCat(catName) }}
                      className="p-1.5 text-text-muted hover:text-rose-500 transition-colors"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </button>

                {openCats[catName] && (
                  <div className="px-3 pb-3">
                    {catDocs.length === 0
                      ? <p className="text-xs text-text-muted px-3.5 py-2">Пусто — добавь статьи через селект справа</p>
                      : catDocs.map(doc => <DocItem key={doc._id} doc={doc} />)
                    }
                  </div>
                )}
              </div>
            )
          })}

          {uncategorized.length > 0 && (
            <div className="bg-surface rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border-soft">
                <span className="text-sm font-semibold text-text-secondary">Без категории</span>
                <span className="text-xs text-text-muted bg-surface-soft px-2 py-0.5 rounded-full">{uncategorized.length}</span>
              </div>
              <div className="px-3 py-3">
                {uncategorized.map(doc => <DocItem key={doc._id} doc={doc} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
