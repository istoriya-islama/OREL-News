import { fetchWithAuth } from './fetchWithAuth'

const API_URL = 'https://orel-insider-api.onrender.com'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
	_id: string
	name: string
	email: string
	isAdmin: boolean
	createdAt: string
	updatedAt: string
}

export interface CreateUserDto {
	name: string
	email: string
	password: string
	recaptchaToken: string
}

export interface LoginDto {
	email: string
	password: string
}

export interface LoginResponse {
	message: string
	user: User
}

export type PostTag = 'web' | 'ai' | 'mobile' | 'os'

export interface Comment {
	authorId: string
	authorName: string
	text: string
	createdAt: string
}

export interface Post {
	_id: string
	title: string
	body: string
	tag: PostTag
	published: boolean
	comments: Comment[]
	translations?: Record<string, string>
	createdAt: string
	updatedAt: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
	// ── Auth (БЕЗ автообновления) ──────────────────────────────────────────

	async register(data: CreateUserDto): Promise<User> {
		const res = await fetch(`${API_URL}/users`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Registration failed')
		}

		return res.json()
	},

	async login(data: LoginDto): Promise<LoginResponse> {
		const res = await fetch(`${API_URL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Login failed')
		}

		return res.json()
	},

	async refreshToken(): Promise<{ message: string }> {
		const res = await fetch(`${API_URL}/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
		})

		if (!res.ok) {
			throw new Error('Refresh failed')
		}

		return res.json()
	},

	async forgotPassword(email: string): Promise<{ message: string }> {
		const res = await fetch(`${API_URL}/auth/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Request failed')
		}

		return res.json()
	},

	async resetPassword(
		token: string,
		password: string,
	): Promise<{ message: string }> {
		const res = await fetch(`${API_URL}/auth/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, password }),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Reset failed')
		}

		return res.json()
	},

	// ── Auth (С автообновлением) ───────────────────────────────────────────

	async logout(): Promise<{ message: string }> {
		const res = await fetch(`${API_URL}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		})

		if (!res.ok) {
			throw new Error('Logout failed')
		}

		return res.json()
	},

	// ── User ───────────────────────────────────────────────────────────────

	async getCurrentUser(): Promise<User> {
		const res = await fetchWithAuth(`${API_URL}/users/me`)

		if (!res.ok) {
			throw new Error('Not authenticated')
		}

		return res.json()
	},

	async updateUser(
		id: string,
		data: { name?: string; email?: string; password?: string },
	): Promise<User> {
		const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Update failed')
		}

		return res.json()
	},

	async deleteUser(id: string): Promise<{ message: string }> {
		const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
			method: 'DELETE',
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Delete failed')
		}

		return res.json()
	},

	// ── Posts (публичные, БЕЗ автообновления) ─────────────────────────────

	async getPosts(lang: string = 'ru'): Promise<Post[]> {
		const res = await fetch(`${API_URL}/posts?lang=${lang}`, {
			credentials: 'include',
		})

		if (!res.ok) {
			throw new Error('Failed to fetch posts')
		}

		return res.json()
	},

	async getPost(id: string, lang: string = 'ru'): Promise<Post> {
		const res = await fetch(`${API_URL}/posts/${id}?lang=${lang}`, {
			credentials: 'include',
		})

		if (!res.ok) {
			throw new Error('Post not found')
		}

		return res.json()
	},

	// ── Comments (С автообновлением) ──────────────────────────────────────

	async addComment(postId: string, text: string): Promise<Comment[]> {
		const res = await fetchWithAuth(`${API_URL}/posts/${postId}/comments`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text }),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to add comment')
		}

		return res.json()
	},

	async deleteComment(
		postId: string,
		index: number,
	): Promise<{ message: string }> {
		const res = await fetchWithAuth(
			`${API_URL}/posts/${postId}/comments/${index}`,
			{ method: 'DELETE' },
		)

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to delete comment')
		}

		return res.json()
	},

	// ── Admin posts (С автообновлением) ───────────────────────────────────

	async adminGetPosts(): Promise<Post[]> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts`)

		if (!res.ok) {
			throw new Error('Failed to fetch posts')
		}

		return res.json()
	},

	async adminCreatePost(data: {
		title: string
		body: string
		tag: PostTag
	}): Promise<Post> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to create post')
		}

		return res.json()
	},

	async adminUpdatePost(
		id: string,
		data: Partial<{ title: string; body: string; tag: PostTag }>,
	): Promise<Post> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to update post')
		}

		return res.json()
	},

	async adminPublishPost(id: string): Promise<Post> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts/${id}/publish`, {
			method: 'PATCH',
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to publish post')
		}

		return res.json()
	},

	async adminUnpublishPost(id: string): Promise<Post> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts/${id}/unpublish`, {
			method: 'PATCH',
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to unpublish post')
		}

		return res.json()
	},

	async adminDeletePost(id: string): Promise<{ message: string }> {
		const res = await fetchWithAuth(`${API_URL}/admin/posts/${id}`, {
			method: 'DELETE',
		})

		if (!res.ok) {
			const error = await res.json()
			throw new Error(error.message || 'Failed to delete post')
		}

		return res.json()
	},
}
