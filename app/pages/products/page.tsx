'use client'

import { FiArrowUpRight, FiPackage } from 'react-icons/fi'

const products = [
	{
		name: 'OREL',
		description: 'Официальный сайт OREL — узнай больше о проекте, его истории и команде.',
		url: 'https://istoriya-islama.github.io/OREL/',
		tag: 'Сайт',
		tagColor: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
	},
	{
		name: 'OREL Insider',
		description: 'Тестируй приложения раньше всех — скачивай бета-версии и помогай улучшать продукты.',
		url: 'https://orel-insider.onrender.com/',
		tag: 'Бета-тестирование',
		tagColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
	},
    {
		name: 'OREL Support',
		description: 'Нужна помощь? Свяжись с нашей поддержкой для решения любых вопросов и проблем.',
		url: 'https://t.me/obr_orel_bot',
		tag: 'Поддержка',
		tagColor: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
	},
	{
		name: 'OREL Store',
		description: 'Официальный магазин приложений OREL. Другие продукты OREL можно найти здесь.',
		url: 'https://orel-store-nw8e.onrender.com',
		tag: 'Магазин',
		tagColor: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
		highlight: true,
	},
]

export default function ProductsPage() {
	return (
		<div className="max-w-5xl mx-auto">

			{/* Заголовок */}
			<div className="mb-8">
				<h1 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
					Продукты
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Все официальные продукты OREL в одном месте
				</p>
			</div>

			{/* Карточки */}
			<div className="grid gap-4 sm:grid-cols-4">
				{products.map(product => (
					<a
						key={product.name}
						href={product.url}
						target="_blank"
						rel="noopener noreferrer"
						className={`group bg-white dark:bg-gray-900 border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-all ${
							product.highlight
								? 'border-green-300 dark:border-green-700'
								: 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-700'
						}`}
					>
						{/* Иконка + тег */}
						<div className="flex items-center justify-between">
							<div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
								<FiPackage size={16} className="text-gray-500 dark:text-gray-400" />
							</div>
							<span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.tagColor}`}>
								{product.tag}
							</span>
						</div>

						{/* Название */}
						<div>
							<div className="flex items-center gap-1.5">
								<h2 className="text-sm font-medium text-gray-900 dark:text-white">
									{product.name}
								</h2>
								<FiArrowUpRight
									size={13}
									className="text-gray-400 group-hover:text-violet-500 transition-colors"
								/>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
								{product.description}
							</p>
						</div>

						{/* Ссылка */}
						<p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-auto">
							{product.url.replace('https://', '')}
						</p>
					</a>
				))}
			</div>

			{/* Баннер OREL Store */}
			<div className="mt-8 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
				<div>
					<p className="text-sm font-medium text-green-800 dark:text-green-200">
						Ищешь другие продукты OREL?
					</p>
					<p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
						Все приложения и проекты собраны в OREL Store
					</p>
				</div>
				<a
					href="https://orel-store-nw8e.onrender.com/pages/orelprogram"
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs font-medium text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 rounded-xl px-3.5 py-2 hover:bg-green-100 dark:hover:bg-green-900 transition-colors shrink-0 flex items-center gap-1.5"
				>
					Открыть Store <FiArrowUpRight size={12} />
				</a>
			</div>
		</div>
	)
}