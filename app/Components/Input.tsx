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
				<label className='text-sm text-gray-600 dark:text-gray-400'>
					{label}
				</label>
			)}
			<input
				className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none transition-colors
					${
						error
							? 'border-red-300 focus:border-red-400'
							: 'border-gray-200 dark:border-gray-700 focus:border-violet-400 focus:bg-white dark:focus:bg-gray-900'
					} ${className}`}
				{...props}
			/>
			{error && <p className='text-xs text-red-500'>{error}</p>}
		</div>
	)
}
