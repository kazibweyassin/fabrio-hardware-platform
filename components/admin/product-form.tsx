'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ImagePlus, Loader2, Package, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  id?: string
  catalogId: string
  name: string
  description: string
  categoryId: string
  subcategory: string
  sku: string
  basePrice: string
  retailPrice: string
  wholesalePrice: string
  image: string
  active: boolean
}

interface ProductFormProps {
  categories: Category[]
  initialData?: ProductFormData
  mode: 'create' | 'edit'
}

export default function ProductForm({ categories, initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<ProductFormData>(
    initialData || {
      catalogId: '',
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      subcategory: '',
      sku: '',
      basePrice: '',
      retailPrice: '',
      wholesalePrice: '',
      image: '',
      active: true,
    }
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to upload image')
        return
      }

      setForm((prev) => ({ ...prev, image: data.url }))
      toast.success('Image uploaded')
    } catch (error) {
      console.error(error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      categoryId: form.categoryId,
      subcategory: form.subcategory || null,
      catalogId: form.catalogId || null,
      sku: form.sku,
      basePrice: parseFloat(form.basePrice),
      retailPrice: parseFloat(form.retailPrice),
      wholesalePrice: form.wholesalePrice ? parseFloat(form.wholesalePrice) : null,
      image: form.image || null,
      active: form.active,
    }

    try {
      const url = mode === 'create' ? '/api/products' : `/api/products/${form.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to save product')
        return
      }

      toast.success(mode === 'create' ? 'Product created' : 'Product updated')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="card-elevated p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">Product details</h3>
          <p className="text-sm text-muted-foreground">Basic information shown in the store catalog.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Catalog ID</label>
            <input
              name="catalogId"
              value={form.catalogId}
              onChange={handleChange}
              placeholder="e.g. GH-001"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SKU *</label>
            <input name="sku" value={form.sku} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required className={inputClass}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <input
              name="subcategory"
              value={form.subcategory}
              onChange={handleChange}
              placeholder="e.g. Lubricants & Adhesives"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="card-elevated p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">Pricing</h3>
          <p className="text-sm text-muted-foreground">
            Set retail and wholesale prices in UGX. Products imported from the catalogue start at UGX 0 until you update them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Base / Cost Price (UGX) *</label>
            <input
              name="basePrice"
              type="number"
              step="1"
              min="0"
              value={form.basePrice}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Retail Price (UGX) *</label>
            <input
              name="retailPrice"
              type="number"
              step="1"
              min="0"
              value={form.retailPrice}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Wholesale Price (UGX)</label>
            <input
              name="wholesalePrice"
              type="number"
              step="1"
              min="0"
              value={form.wholesalePrice}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="card-elevated p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg mb-1">Product image</h3>
          <p className="text-sm text-muted-foreground">Upload a photo or paste an image URL.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-40 h-40 rounded-xl border border-border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
            {form.image ? (
              <img src={form.image} alt="Product preview" className="w-full h-full object-cover" />
            ) : (
              <Package className="w-12 h-12 text-muted-foreground/30" />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border font-medium text-sm cursor-pointer hover:bg-muted transition-colors"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload image'}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Or image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className={inputClass} placeholder="/uploads/products/..." />
            </div>

            {form.image && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={form.active}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label htmlFor="active" className="text-sm font-medium">
          Active (visible in store)
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || uploading}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="border border-border px-6 py-2 rounded-lg font-semibold hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}