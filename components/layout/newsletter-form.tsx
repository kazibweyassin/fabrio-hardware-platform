'use client'

import toast from 'react-hot-toast'

export default function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
        if (email) {
          toast.success(`Thanks! We'll send updates to ${email}`)
          form.reset()
        }
      }}
    >
      <input
        name="email"
        type="email"
        placeholder="Work email"
        required
        className="flex-1 h-11 px-4 rounded-xl bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand/50"
      />
      <button
        type="submit"
        className="h-11 px-5 rounded-xl gradient-brand text-brand-foreground text-sm font-semibold shrink-0 hover:opacity-90 transition-opacity"
      >
        Subscribe
      </button>
    </form>
  )
}