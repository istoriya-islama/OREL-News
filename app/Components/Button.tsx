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
		'text-sm font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-60 cursor-pointer'

	const variants = {
		primary: 'bg-violet-600 hover:bg-violet-700 text-white',
		secondary:
			'bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
		danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
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
