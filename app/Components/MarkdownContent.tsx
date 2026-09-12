'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugify } from '@/app/lib/markdown'

function flatten(children: React.ReactNode): string {
	if (Array.isArray(children)) return children.map(flatten).join('')
	if (typeof children === 'string') return children
	if (typeof children === 'number') return String(children)
	return ''
}

function makeHeading(level: 1 | 2 | 3) {
	const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3'
	const sizeClass =
		level === 1
			? 'text-2xl mt-8 mb-3 pb-2 border-b border-border-soft'
			: level === 2
				? 'text-lg mt-8 mb-3'
				: 'text-sm uppercase tracking-wide text-accent mt-6 mb-2'

	function Heading({ children }: { children?: React.ReactNode }) {
		const id = slugify(flatten(children))
		return (
			<Tag id={id} className={`font-serif font-semibold scroll-mt-24 text-text-primary ${sizeClass}`}>
				{children}
			</Tag>
		)
	}
	Heading.displayName = `MarkdownHeading${level}`
	return Heading
}

const components: Components = {
	h1: makeHeading(1),
	h2: makeHeading(2),
	h3: makeHeading(3),
	p: ({ children }) => (
		<p className="text-[15px] leading-[1.8] text-text-secondary my-3">{children}</p>
	),
	a: ({ href, children }) => (
		<a
			href={href}
			target={href?.startsWith('http') ? '_blank' : undefined}
			rel="noopener noreferrer"
			className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
		>
			{children}
		</a>
	),
	strong: ({ children }) => (
		<strong className="font-semibold text-text-primary">{children}</strong>
	),
	code: ({ children }) => (
		<code className="font-mono text-[0.85em] bg-accent-soft-bg text-accent-soft-text px-1.5 py-0.5 rounded-md">
			{children}
		</code>
	),
	pre: ({ children }) => (
		<pre className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 overflow-x-auto my-4 text-[0.85em] leading-relaxed [&_code]:bg-transparent [&_code]:text-inherit [&_code]:p-0">
			{children}
		</pre>
	),
	blockquote: ({ children }) => (
		<blockquote className="border-l-4 border-accent/40 bg-accent-soft-bg/50 rounded-r-2xl px-4 py-2 my-4 italic text-[15px] text-text-secondary">
			{children}
		</blockquote>
	),
	ul: ({ children }) => (
		<ul className="my-3 ml-5 list-disc space-y-1.5 marker:text-accent">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="my-3 ml-5 list-decimal space-y-1.5 marker:text-accent">{children}</ol>
	),
	li: ({ children }) => (
		<li className="text-[15px] leading-[1.7] text-text-secondary">{children}</li>
	),
	table: ({ children }) => (
		<div className="overflow-x-auto my-4">
			<table className="w-full text-sm border-collapse">{children}</table>
		</div>
	),
	th: ({ children }) => (
		<th className="border-b-2 border-border-soft px-3 py-2 text-left font-semibold text-text-primary">
			{children}
		</th>
	),
	td: ({ children }) => (
		<td className="border-b border-border-soft px-3 py-2 text-text-secondary">{children}</td>
	),
	img: ({ src, alt }) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt ?? ''} className="rounded-2xl my-4 max-w-full" />
	),
	hr: () => <hr className="my-8 border-border-soft" />,
}

export default function MarkdownContent({ content }: { content: string }) {
	return (
		<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
			{content}
		</ReactMarkdown>
	)
}
