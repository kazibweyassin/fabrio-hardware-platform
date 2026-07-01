import Link from 'next/link'
import { ArrowRight, Sparkles, Timer, Zap } from 'lucide-react'
import JsonLd from '@/components/seo/json-ld'
import {
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildWebSiteJsonLd,
  SITE_TAGLINE,
} from '@/lib/seo'
import CategoryIcon from '@/components/home/category-icon'
import HomeProductCard from '@/components/home/product-card'
import HeroImageSlider from '@/components/home/hero-image-slider'
import B2BValueStrip from '@/components/layout/b2b-value-strip'
import RevealOnScroll from '@/components/layout/reveal-on-scroll'
import SectionHeader from '@/components/layout/section-header'
import TrustBar from '@/components/layout/trust-bar'
import { Button } from '@/components/ui/button'
import { getHeroImages } from '@/lib/hero-images'
import { getCategoriesWithCounts, getFeaturedProducts, getFlashSaleProducts } from '@/lib/products'

export const metadata = buildPageMetadata({
  title: SITE_TAGLINE,
  description:
    'Shop industrial hardware, OSHA-certified PPE, power tools, and safety equipment in Uganda. Bulk pricing and B2B fulfillment from Fabrio Hardware.',
  path: '/',
  keywords: ['hardware store Uganda', 'industrial supply Kampala', 'PPE wholesale'],
})

export default async function HomePage() {
  const [categories, featuredProducts, flashSaleProducts] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProducts(6),
    getFlashSaleProducts(3),
  ])
  const heroImages = getHeroImages()

  const structuredData = [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildItemListJsonLd(
      featuredProducts.map((p) => ({ id: p.id, name: p.name })),
      'Featured Products'
    ),
  ]

  return (
    <div className="bg-background">
      <JsonLd data={structuredData} />
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[min(42vw,720px)] lg:min-h-[min(38vw,760px)]">
        <HeroImageSlider images={heroImages} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 pb-16 sm:pb-20">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-on-dark text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Trusted by 2,400+ enterprises
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] text-balance">
              Building your safety for{' '}
              <span className="text-brand-on-dark">success</span>
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
              {[
                { value: '12K+', label: 'Products in stock' },
                { value: '48hr', label: 'Avg. delivery' },
                { value: '99.2%', label: 'Fill rate' },
              ].map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tabular-nums">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <RevealOnScroll>
        <B2BValueStrip />
      </RevealOnScroll>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <RevealOnScroll delay={80}>
        <SectionHeader
          eyebrow="Shop by Category"
          title="Find what your team needs"
          action={{ href: '/products', label: 'View all' }}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.name.toLowerCase().replace(/ /g, '-')}`}
              className="group card-interactive p-5 text-center hover:-translate-y-1 hover:border-brand/20"
            >
              <CategoryIcon name={cat.name} />
              <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {cat.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{cat._count.products} items</p>
            </Link>
          ))}
        </div>
        </RevealOnScroll>
      </section>

      {/* Flash Sales */}
      {flashSaleProducts.length > 0 && (
        <section className="section-surface py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <RevealOnScroll delay={120}>
            <SectionHeader
              title="Flash Sales"
              description="Limited-time bulk pricing"
              icon={Timer}
              iconVariant="accent"
              action={{ href: '/products', label: 'See all deals' }}
            />
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
            </RevealOnScroll>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <RevealOnScroll delay={160}>
        <SectionHeader
          title="Featured Products"
          description="Top picks from our catalog"
          icon={Zap}
          action={{ href: '/products', label: 'View catalog' }}
        />
        {featuredProducts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <HomeProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        )}
        </RevealOnScroll>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <RevealOnScroll delay={200}>
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
        </RevealOnScroll>
      </section>
    </div>
  )
}