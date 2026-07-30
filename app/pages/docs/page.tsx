'use client'

import { api, Post } from '@/app/lib/api'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiBook, FiChevronDown, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '@/app/store/auth'

// ── Категории хранятся в localStorage ────────────────────────────────────────
// Структура: { [categoryName]: string[] } — массив _id постов в этой категории
// Порядок категорий: массив строк в localStorage key 'docs-category-order'

const LS_CATS = 'docs-categories'      // { [name]: string[] }
const LS_ORDER = 'docs-category-order' // string[]

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

  // Категории
  const [cats, setCats] = useState<Record<string, string[]>>({})
  const [order, setOrder] = useState<string[]>([])
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})

  // Новая категория (только для админа)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.getPosts()
        // Только доки, отсортированные от старых к новым (старые = начало доков = сверху)
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
    // Открываем все категории по умолчанию
    const open: Record<string, boolean> = {}
    o.forEach(name => { open[name] = true })
    setOpenCats(open)
  }, [])

  // Доки без категории
  const assignedIds = new Set(Object.values(cats).flat())
  const uncategorized = docs.filter(d => !assignedIds.has(d._id))

  // Добавить категорию
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

  // Удалить категорию
  const handleDeleteCat = (name: string) => {
    const { [name]: _, ...rest } = cats
    const newOrder = order.filter(n => n !== name)
    setCats(rest)
    setOrder(newOrder)
    saveCats(rest, newOrder)
  }

  // Переместить doc в категорию (или убрать)
  const handleAssign = (docId: string, catName: string) => {
    // Убираем из всех категорий
    const newCats: Record<string, string[]> = {}
    for (const [k, v] of Object.entries(cats)) {
      newCats[k] = v.filter(id => id !== docId)
    }
    // Добавляем в нужную (если не 'none')
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
      className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
    >
      <FiBook size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0 group-hover:text-violet-500 transition-colors" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {doc.title}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(doc.createdAt)}</p>
      </div>
      {isAdmin && (
        <select
          value={order.find(cat => cats[cat]?.includes(doc._id)) || 'none'}
          onChange={e => { e.preventDefault(); handleAssign(doc._id, e.target.value) }}
          onClick={e => e.preventDefault()}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 outline-none shrink-0"
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
      {/* Шапка */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
            Документация
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Руководства, справочники и технические материалы OREL
          </p>
        </div>

        {/* Добавить категорию — только для админа */}
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
                  className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-violet-400 w-44"
                />
                <button
                  onClick={handleAddCat}
                  className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setAddingCat(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5"
                >
                  Отмена
                </button>
              </>
            ) : (
              <button
                onClick={() => setAddingCat(true)}
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
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
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && docs.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-gray-400">Документации пока нет</p>
        </div>
      )}

      {!loading && docs.length > 0 && (
        <div className="space-y-6">

          {/* Категории */}
          {order.map(catName => {
            const catDocs = (cats[catName] || [])
              .map(id => docs.find(d => d._id === id))
              .filter(Boolean) as Post[]

            return (
              <div key={catName} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleCat(catName)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {openCats[catName]
                      ? <FiChevronDown size={14} className="text-gray-400" />
                      : <FiChevronRight size={14} className="text-gray-400" />
                    }
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{catName}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({catDocs.length})</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteCat(catName) }}
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </button>

                {openCats[catName] && (
                  <div className="px-2 pb-2">
                    {catDocs.length === 0
                      ? <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">Пусто — добавь статьи через селект справа</p>
                      : catDocs.map(doc => <DocItem key={doc._id} doc={doc} />)
                    }
                  </div>
                )}
              </div>
            )
          })}

          {/* Без категории */}
          {uncategorized.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Без категории</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">({uncategorized.length})</span>
              </div>
              <div className="px-2 py-2">
                {uncategorized.map(doc => <DocItem key={doc._id} doc={doc} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}