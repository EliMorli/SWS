import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/store'
import { login } from '../lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('aaron@swsstucco.com')
  const [password, setPassword] = useState('password123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      setUser(data.user)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sws-navy via-sws-blue to-sws-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-sws-gold tracking-widest mb-2">SWS</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Southwest Stucco, Inc.
          </p>
          <p className="text-white text-lg font-semibold mt-4">Operations Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-sws-navy mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sws-gold focus:border-sws-gold outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sws-gold focus:border-sws-gold outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-4 text-center text-xs text-gray-400">
            Demo: aaron@swsstucco.com / password123!
          </div>
        </form>
      </div>
    </div>
  )
}
