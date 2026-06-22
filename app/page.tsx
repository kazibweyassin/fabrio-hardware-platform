import Link from 'next/link'
import { ArrowRight, ChevronRight, Sparkles, Timer, Zap } from 'lucide-react'
import CategoryIcon from '@/components/home/category-icon'
import HomeProductCard from '@/components/home/product-card'
import HeroImageSlider from '@/components/home/hero-image-slider'
import TrustBar from '@/components/layout/trust-bar'
import { Button } from '@/components/ui/button'
import { getHeroImages } from '@/lib/hero-images'
import { getCategoriesWithCounts, getFeaturedProducts, getFlashSaleProducts } from '@/lib/products'

export default async function HomePage() {
  const [categories, featuredProducts, flashSaleProducts] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProducts(6),
    getFlashSaleProducts(3),
  ])
  const heroImages = getHeroImages()

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[min(42vw,720px)] lg:min-h-[min(38vw,760px)]">
        <HeroImageSlider images={heroImages} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 pb-16 sm:pb-20">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by 2,400+ enterprises
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] text-balance">
              Building your safety for{' '}
              <span className="text-brand">success</span>
            </h1>
            <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-lg">
              Premium construction hardware, OSHA-certified PPE, and industrial equipment — with bulk pricing, fast fulfillment, and dedicated B2B support.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold shadow-lg gap-2">
                  Browse Catalog <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold">
                  Open B2B Account
                </Button>
              </Link>
            </div>
            <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-white/10">
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">12K+</p>
                <p className="text-xs text-white/50 mt-1">Products in stock</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">48hr</p>
                <p className="text-xs text-white/50 mt-1">Avg. delivery</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">99.2%</p>
                <p className="text-xs text-white/50 mt-1">Fill rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">Shop by Category</p>
            <h2 className="text-3xl font-bold">Find what your team needs</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.name.toLowerCase().replace(/ /g, '-')}`}
              className="group card-interactive p-5 text-center hover:-translate-y-1"
            >
              <CategoryIcon name={cat.name} />
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {cat.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{cat._count.products} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sales */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-surface border-y border-border py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/15 text-accent">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Flash Sales</h2>
                  <p className="text-sm text-muted-foreground">Limited-time bulk pricing</p>
                </div>
              </div>
              <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
                See all deals →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flashSaleProducts.map((product) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  variant="home"
                  showDiscount
                  discountPercent={product.discountPercent}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/5 text-primary">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <p className="text-sm text-muted-foreground">Top picks from our catalog</p>
            </div>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
            View catalog →
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <div className="gradient-hero rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-14 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-white text-balance">
                Need a custom quote for your next project?
              </h2>
              <p className="mt-3 text-white/60 leading-relaxed">
                Our B2B team offers volume pricing, net-30 terms, and dedicated fulfillment for enterprise accounts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0 w-full sm:w-auto">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl gradient-brand text-brand-foreground border-0 font-semibold">
                  Create Account
                </Button>
              </Link>
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-7 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold">
                  Request Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}