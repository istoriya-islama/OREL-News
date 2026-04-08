'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { api, User } from '../lib/api'

interface AuthContextType {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	// флаг — идёт выход, не обновлять пользователя
	const isLoggingOut = useRef(false)

	const refreshUser = useCallback(async () => {
		// если выходим — игнорируем
		if (isLoggingOut.current) return
		try {
			const currentUser = await api.getCurrentUser()
			if (!isLoggingOut.current) {
				setUser(currentUser)
			}
		} catch {
			setUser(null)
		}
	}, [])

	useEffect(() => {
		const init = async () => {
			await refreshUser()
			setLoading(false)
		}
		void init()
	}, [])

	const login = useCallback(async (email: string, password: string) => {
		const res = await api.login({ email, password })
		setUser(res.user)
	}, [])

	const logout = useCallback(async () => {
		// сначала ставим флаг — refreshUser больше не сработает
		isLoggingOut.current = true
		try {
			await api.logout()
		} catch {
			// даже если бэк упал — всё равно выходим
		}
		setUser(null)
		window.location.href = '/'
	}, [])

	const value = useMemo(
		() => ({ user, loading, login, logout, refreshUser }),
		[user, loading, login, logout, refreshUser],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}
