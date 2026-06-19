import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mb-6">
          <Search className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">404</p>
        <h1 className="text-3xl font-bold mb-3">Page not found</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="h-11 px-6 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-medium">
              Browse catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}