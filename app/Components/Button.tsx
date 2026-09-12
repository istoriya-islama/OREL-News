'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'danger'
	loading?: boolean
	fullWidth?: boolean
}

export default function Button({
	variant = 'primary',
	loading = false,
	fullWidth = false,
	children,
	className = '',
	disabled,
	...props
}: ButtonProps) {
	const base =
		'text-sm font-medium py-2.5 px-5 rounded-full transition-colors disabled:opacity-60 cursor-pointer'

	const variants = {
		primary: 'bg-accent hover:bg-accent-hover text-white',
		secondary:
			'bg-transparent border border-border-soft text-text-secondary hover:bg-surface-soft hover:text-text-primary',
		danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
	}

	return (
		<button
			disabled={disabled || loading}
			className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
			{...props}
		>
			{loading ? 'Загрузка...' : children}
		</button>
	)
}
