'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on orders over $50',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment processing',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
  },
  {
    icon: ShoppingBag,
    title: 'Premium Quality',
    description: 'Curated selection of top products',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Discover
              <span className="block text-yellow-300">Premium Products</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Experience shopping reimagined with curated collections, secure checkout, and
              lightning-fast delivery. Your style, your way.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?category=new">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="glass rounded-xl p-6 text-center transition-all hover:shadow-lg"
            >
              <feature.icon className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Featured Categories</h2>
          <p className="mt-2 text-muted-foreground">Explore our curated collections</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {['Electronics', 'Clothing', 'Home & Living'].map((category) => (
            <motion.div key={category} variants={fadeUp}>
              <Link
                href={`/products?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="group relative block overflow-hidden rounded-xl bg-muted transition-all hover:shadow-lg"
              >
                <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <ShoppingBag className="h-16 w-16 text-primary/30 transition-transform group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{category}</h3>
                    <p className="mt-1 text-sm text-white/80">Explore Collection</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="bg-muted/50 py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us</h2>
            <p className="mt-2 text-muted-foreground">
              We are committed to providing the best shopping experience
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Curated Selection',
                description:
                  'Every product is carefully selected for quality, design, and value.',
                stat: '10,000+',
                label: 'Products',
              },
              {
                title: 'Fast Delivery',
                description:
                  'Lightning-fast shipping with real-time tracking on every order.',
                stat: '2-Day',
                label: 'Average Delivery',
              },
              {
                title: 'Happy Customers',
                description:
                  'Join thousands of satisfied customers who love shopping with us.',
                stat: '50,000+',
                label: 'Reviews',
              },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="glass rounded-xl p-8 text-center">
                <div className="text-4xl font-bold gradient-text">{item.stat}</div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">{item.label}</div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to Start Shopping?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our collection and find something you love.
          </p>
          <Link href="/products" className="mt-8 inline-block">
            <Button size="lg" className="gap-2">
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
