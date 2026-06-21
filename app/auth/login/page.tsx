'use client'

import { signIn } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Lock, Mail } from 'lucide-react'
import AuthPanel from '@/components/layout/auth-panel'
import AuthMobileHeader from '@/components/layout/auth-mobile-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [redirectTo, setRedirectTo] = useState('/products')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectTo(params.get('redirect') || '/products')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: redirectTo,
      })

      if (result.error) {
        toast.error(result.error.message || 'Login failed')
      } else {
        toast.success('Welcome back!')
        router.push(redirectTo)
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <AuthPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md animate-slide-up">
          <AuthMobileHeader />
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your Fabrio B2B account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 p-4 rounded-xl bg-surface border border-border text-sm">
              <summary className="font-semibold text-foreground cursor-pointer">Demo credentials</summary>
              <p className="text-muted-foreground mt-2">Email: john@company.com</p>
              <p className="text-muted-foreground">Password: customer</p>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}