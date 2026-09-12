'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
}

export default function Input({
	label,
	error,
	className = '',
	...props
}: InputProps) {
	return (
		<div className='flex flex-col gap-1.5'>
			{label && (
				<label className='text-sm text-text-secondary'>
					{label}
				</label>
			)}
			<input
				className={`w-full px-4 py-2.5 text-sm border rounded-2xl bg-surface-soft text-text-primary outline-none transition-colors
					${
						error
							? 'border-rose-300 focus:border-rose-400'
							: 'border-border-soft focus:border-accent focus:bg-surface'
					} ${className}`}
				{...props}
			/>
			{error && <p className='text-xs text-rose-500'>{error}</p>}
		</div>
	)
}
