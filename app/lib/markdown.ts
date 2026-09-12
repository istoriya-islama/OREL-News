/**
 * Общие хелперы для рендеринга обычного Markdown (react-markdown + remark-gfm).
 * Заменяет старый самописный OREL Markdown.
 */

export interface DocHeading {
	id: string
	text: string
	level: 1 | 2 | 3
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\wа-яёА-ЯЁ\s-]/gi, '')
		.replace(/\s+/g, '-')
}

/** Быстрое извлечение заголовков h1-h3 из исходного markdown для сайдбара документации. */
export function extractHeadings(raw: string): DocHeading[] {
	const headings: DocHeading[] = []
	for (const line of raw.split('\n')) {
		const match = line.match(/^(#{1,3})\s+(.+)$/)
		if (match) {
			const level = match[1].length as 1 | 2 | 3
			const text = match[2].trim()
			headings.push({ id: slugify(text), text, level })
		}
	}
	return headings
}
