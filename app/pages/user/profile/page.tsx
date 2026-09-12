'use client'

import Button from '@/app/Components/Button'
import Input from '@/app/Components/Input'
import { api } from '@/app/lib/api'
import { useAuth } from '@/app/store/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiKey, FiLogOut, FiTrash2, FiUser } from 'react-icons/fi'

export default function ProfilePage() {
	const router = useRouter()
	const { user, logout, refreshUser } = useAuth()

	// Имя
	const [name, setName] = useState('')
	const [nameLoading, setNameLoading] = useState(false)
	const [nameSuccess, setNameSuccess] = useState(false)
	const [nameError, setNameError] = useState('')

	// Пароль
	const [password, setPassword] = useState('')
	const [passwordConfirm, setPasswordConfirm] = useState('')
	const [passwordLoading, setPasswordLoading] = useState(false)
	const [passwordSuccess, setPasswordSuccess] = useState(false)
	const [passwordError, setPasswordError] = useState('')

	// Удаление
	const [deleteConfirm, setDeleteConfirm] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState(false)

	useEffect(() => {
		const init = () => {
			if (!user) {
				router.push('/pages/auth/login')
				return
			}
			setName(user.name)
		}
		init()
	}, [user, router])

	// Сохранить имя
	const handleSaveName = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return
		setNameError('')
		setNameSuccess(false)
		setNameLoading(true)

		try {
			await api.updateUser(user._id, { name })
			await refreshUser()
			setNameSuccess(true)
			setTimeout(() => setNameSuccess(false), 3000)
		} catch (err) {
			setNameError(err instanceof Error ? err.message : 'Ошибка')
		} finally {
			setNameLoading(false)
		}
	}

	// Сменить пароль
	const handleSavePassword = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return
		setPasswordError('')
		setPasswordSuccess(false)

		if (password !== passwordConfirm) {
			setPasswordError('Пароли не совпадают')
			return
		}
		if (password.length < 6) {
			setPasswordError('Минимум 6 символов')
			return
		}

		setPasswordLoading(true)
		try {
			await api.updateUser(user._id, { password })
			setPasswordSuccess(true)
			setPassword('')
			setPasswordConfirm('')
			setTimeout(() => setPasswordSuccess(false), 3000)
		} catch (err) {
			setPasswordError(err instanceof Error ? err.message : 'Ошибка')
		} finally {
			setPasswordLoading(false)
		}
	}

	// Удалить аккаунт
	const handleDelete = async () => {
		if (!user) return
		setDeleteLoading(true)
		try {
			await api.deleteUser(user._id)
			await logout()
		} catch {
			setDeleteLoading(false)
		}
	}

	if (!user) return null

	return (
		<div className='max-w-lg mx-auto'>
			{/* Заголовок */}
			<div className='mb-8'>
				<h1 className='text-xl font-medium text-text-primary'>
					Профиль
				</h1>
				<p className='text-sm text-text-secondary mt-1'>
					OREL ID — управление аккаунтом
				</p>
			</div>

			{/* Аватар */}
			<div className='flex items-center gap-4 mb-8 p-5 bg-surface border border-border-soft rounded-2xl'>
				<div className='w-14 h-14 rounded-full bg-accent-soft-bg flex items-center justify-center text-accent-soft-text text-xl font-medium shrink-0'>
					{user.name.charAt(0).toUpperCase()}
				</div>
				<div>
					<p className='font-medium text-text-primary'>
						{user.name}
					</p>
					<p className='text-sm text-text-secondary'>
						{user.email}
					</p>
					<p className='text-xs text-text-muted mt-0.5'>
						Аккаунт создан{' '}
						{new Date(user.createdAt).toLocaleDateString('ru-RU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					</p>
				</div>
			</div>

			{/* OREL ID */}
			<div className='bg-surface border border-border-soft rounded-2xl p-5 mb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<h2 className='text-sm font-medium text-text-primary'>
							OREL ID
						</h2>
						<p className='text-xs text-text-muted mt-0.5'>
							Управление аккаунтом, сессии, безопасность
						</p>
					</div>
					<a
						href='https://orel-id.istoriyaislama.workers.dev/pages/user/profile'
						target='_blank'
						rel='noopener noreferrer'
						className='text-xs px-4 py-2 rounded-lg border border-accent/40 text-accent hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors whitespace-nowrap'
					>
						Открыть →
					</a>
				</div>
			</div>

			{/* Изменить имя */}
			<div className='bg-surface border border-border-soft rounded-2xl p-5 mb-4'>
				<h2 className='text-sm font-medium text-text-primary mb-4 flex items-center gap-2'>
					<FiUser size={15} className='text-violet-500' />
					Изменить имя
				</h2>
				<form onSubmit={handleSaveName} className='space-y-3'>
					<Input
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder='Твоё имя'
						required
					/>
					{nameError && <p className='text-xs text-red-500'>{nameError}</p>}
					{nameSuccess && (
						<p className='text-xs text-green-600 dark:text-green-400'>
							Имя успешно обновлено
						</p>
					)}
					<Button type='submit' loading={nameLoading}>
						Сохранить
					</Button>
				</form>
			</div>

			{/* Изменить пароль */}
			<div className='bg-surface border border-border-soft rounded-2xl p-5 mb-4'>
				<h2 className='text-sm font-medium text-text-primary mb-4 flex items-center gap-2'>
					<FiKey size={15} className='text-violet-500' />
					Изменить пароль
				</h2>
				<form onSubmit={handleSavePassword} className='space-y-3'>
					<Input
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder='Новый пароль'
						required
					/>
					<Input
						type='password'
						value={passwordConfirm}
						onChange={e => setPasswordConfirm(e.target.value)}
						placeholder='Повтори пароль'
						required
					/>
					{passwordError && (
						<p className='text-xs text-red-500'>{passwordError}</p>
					)}
					{passwordSuccess && (
						<p className='text-xs text-green-600 dark:text-green-400'>
							Пароль успешно изменён
						</p>
					)}
					<Button type='submit' loading={passwordLoading}>
						Сохранить
					</Button>
				</form>
			</div>

			{/* Выйти */}
			<div className='bg-surface border border-border-soft rounded-2xl p-5 mb-4'>
				<h2 className='text-sm font-medium text-text-primary mb-1 flex items-center gap-2'>
					<FiLogOut size={15} className='text-gray-400' />
					Выйти из аккаунта
				</h2>
				<p className='text-xs text-text-muted mb-4'>
					Выход на этом устройстве
				</p>
				<Button variant='secondary' onClick={() => void logout()}>
					Выйти
				</Button>
			</div>

			{/* Удалить аккаунт */}
			<div className='bg-surface border border-red-200 dark:border-red-900 rounded-2xl p-5'>
				<h2 className='text-sm font-medium text-red-600 dark:text-red-400 mb-1 flex items-center gap-2'>
					<FiTrash2 size={15} />
					Удалить аккаунт
				</h2>
				<p className='text-xs text-text-muted mb-4'>
					Это действие необратимо. Все данные будут удалены.
				</p>

				{!deleteConfirm ? (
					<Button variant='danger' onClick={() => setDeleteConfirm(true)}>
						Удалить аккаунт
					</Button>
				) : (
					<div className='space-y-3'>
						<p className='text-sm text-red-600 dark:text-red-400 font-medium'>
							Ты уверен? Это нельзя отменить.
						</p>
						<div className='flex gap-2'>
							<Button
								variant='danger'
								loading={deleteLoading}
								onClick={() => void handleDelete()}
							>
								Да, удалить
							</Button>
							<Button
								variant='secondary'
								onClick={() => setDeleteConfirm(false)}
							>
								Отмена
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
