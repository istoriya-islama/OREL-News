'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { useAuth } from '@/app/store/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const { login } = useAuth()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			await login(email, password)
			router.push('/')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка входа')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-[80vh] flex items-center justify-center px-4'>
			<div className='w-full max-w-md'>
				{/* Лого */}
				<div className='text-center mb-8'>
					<h1 className='text-2xl font-medium text-gray-900 dark:text-white'>
						OREL <span className='text-violet-600'>ID</span>
					</h1>
					<p className='text-sm text-gray-500 mt-1'>Войди в свой аккаунт</p>
				</div>

				<div className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8'>
					{/* Баннер про Insider */}
					<div className='bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 mb-6'>
						<p className='text-xs text-violet-700 dark:text-violet-300 leading-relaxed'>
							Войдя здесь, ты также получаешь доступ к{' '}
							<span className='font-medium'>OREL Insider</span> — платформе для
							скачивания тестовых приложений.
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							label='Email'
							type='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder='your@email.com'
							required
						/>

						<div>
							<div className='flex justify-between items-center mb-1.5'>
								<label className='text-sm text-gray-600 dark:text-gray-400'>
									Пароль
								</label>
								<Link
									href='/pages/auth/forgot-password'
									className='text-xs text-violet-600 hover:underline'
								>
									Забыл пароль?
								</Link>
							</div>
							<Input
								type='password'
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder='••••••••'
								required
							/>
						</div>

						{error && (
							<div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5'>
								<p className='text-xs text-red-600 dark:text-red-400'>
									{error}
								</p>
							</div>
						)}

						<Button type='submit' fullWidth loading={loading}>
							Войти
						</Button>
					</form>

					<p className='text-center text-sm text-gray-500 mt-6'>
						Нет аккаунта?{' '}
						<Link
							href='/pages/auth'
							className='text-violet-600 hover:underline font-medium'
						>
							Зарегистрироваться
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
