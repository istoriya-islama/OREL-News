'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { api } from '@/app/lib/api'
import { useAuth } from '@/app/store/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AuthPage() {
	const router = useRouter()
	const { login } = useAuth()

	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			await api.register({ name, email, password, recaptchaToken: 'skip' })
			await login(email, password)
			router.push('/')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка регистрации')
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
					<p className='text-sm text-gray-500 mt-1'>Создай свой аккаунт</p>
				</div>

				<div className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8'>
					{/* Баннер про Insider */}
					<div className='bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3 mb-6'>
						<p className='text-xs text-violet-700 dark:text-violet-300 leading-relaxed'>
							Создавая аккаунт, ты также получаешь доступ к{' '}
							<span className='font-medium'>OREL Insider</span> — платформе для
							скачивания тестовых приложений раньше всех.
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<Input
							label='Имя'
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder='Твоё имя'
							required
						/>
						<Input
							label='Email'
							type='email'
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder='your@email.com'
							required
						/>
						<Input
							label='Пароль'
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder='••••••••'
							required
							minLength={6}
						/>

						{error && (
							<div className='bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5'>
								<p className='text-xs text-red-600 dark:text-red-400'>
									{error}
								</p>
							</div>
						)}

						<Button type='submit' fullWidth loading={loading}>
							Зарегистрироваться
						</Button>
					</form>

					<p className='text-center text-sm text-gray-500 mt-6'>
						Уже есть аккаунт?{' '}
						<Link
							href='/pages/auth/login'
							className='text-violet-600 hover:underline font-medium'
						>
							Войти
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
