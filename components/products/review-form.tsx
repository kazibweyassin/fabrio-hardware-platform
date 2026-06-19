'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ReviewForm() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // In a real app this would call an API
    setSubmitted(true)
    // Reset after showing message (simple UX)
    setTimeout(() => {
      setSubmitted(false)
      // Optionally could reset form fields here if we tracked them
    }, 2000)
  }

  if (submitted) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        Thank you! Your review has been submitted for moderation.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <textarea
        className="w-full rounded-xl border border-border p-3 text-sm"
        rows={3}
        placeholder="Share your experience with this product..."
        required
      />
      <Button type="submit" size="sm" variant="outline" className="rounded-xl">
        Submit Review
      </Button>
    </form>
  )
}
