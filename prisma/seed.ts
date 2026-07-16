import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@modernstore.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@modernstore.com',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@modernstore.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'user@modernstore.com',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  console.log(`Created admin: ${admin.email}, user: ${user.email}`);

  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and devices' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion for everyone' },
    { name: 'Home & Living', slug: 'home-living', description: 'Furnish your dream home' },
    { name: 'Sports', slug: 'sports', description: 'Gear up for adventure' },
    { name: 'Books', slug: 'books', description: 'Expand your horizons' },
    { name: 'Beauty', slug: 'beauty', description: 'Look and feel your best' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }

  console.log(`Created ${createdCategories.length} categories`);

  const products = [
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-headphones',
      description:
        'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.',
      price: 29999,
      compareAtPrice: 39999,
      images: ['/products/headphones.jpg'],
      sku: 'ELEC-00001',
      stock: 50,
      categoryId: createdCategories[0].id,
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description:
        'Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Water-resistant up to 50 meters.',
      price: 24999,
      compareAtPrice: 29999,
      images: ['/products/smartwatch.jpg'],
      sku: 'ELEC-00002',
      stock: 35,
      categoryId: createdCategories[0].id,
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description:
        'Ultra-soft 100% organic cotton t-shirt with a modern fit. Available in multiple colors. Sustainably sourced and ethically made.',
      price: 3499,
      images: ['/products/tshirt.jpg'],
      sku: 'CLOT-00001',
      stock: 200,
      categoryId: createdCategories[1].id,
    },
    {
      name: 'Designer Denim Jacket',
      slug: 'designer-denim-jacket',
      description:
        'Classic denim jacket with a modern twist. Premium selvedge denim with brass buttons and a tailored fit.',
      price: 12999,
      compareAtPrice: 15999,
      images: ['/products/denim-jacket.jpg'],
      sku: 'CLOT-00002',
      stock: 45,
      categoryId: createdCategories[1].id,
    },
    {
      name: 'Minimalist Desk Lamp',
      slug: 'minimalist-desk-lamp',
      description:
        'Sleek, adjustable LED desk lamp with touch controls and multiple brightness levels. Energy-efficient and eye-friendly.',
      price: 5999,
      images: ['/products/desk-lamp.jpg'],
      sku: 'HOME-00001',
      stock: 80,
      categoryId: createdCategories[2].id,
    },
    {
      name: 'Ceramic Plant Pot Set',
      slug: 'ceramic-plant-pot-set',
      description:
        'Set of 3 handcrafted ceramic plant pots in varying sizes. Drainage holes included. Perfect for indoor plants.',
      price: 3999,
      compareAtPrice: 4999,
      images: ['/products/plant-pots.jpg'],
      sku: 'HOME-00002',
      stock: 120,
      categoryId: createdCategories[2].id,
    },
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description:
        'Extra-thick, non-slip yoga mat made from eco-friendly materials. Perfect cushioning for joints during practice.',
      price: 4999,
      images: ['/products/yoga-mat.jpg'],
      sku: 'SPRT-00001',
      stock: 65,
      categoryId: createdCategories[3].id,
    },
    {
      name: 'Running Shoes Ultra',
      slug: 'running-shoes-ultra',
      description:
        'Lightweight, responsive running shoes with advanced cushioning technology. Breathable mesh upper for maximum comfort.',
      price: 14999,
      compareAtPrice: 18999,
      images: ['/products/running-shoes.jpg'],
      sku: 'SPRT-00002',
      stock: 90,
      categoryId: createdCategories[3].id,
    },
    {
      name: 'The Art of Clean Code',
      slug: 'art-of-clean-code',
      description:
        'A comprehensive guide to writing maintainable, efficient, and elegant code. Essential reading for every developer.',
      price: 2999,
      images: ['/products/clean-code.jpg'],
      sku: 'BOOK-00001',
      stock: 150,
      categoryId: createdCategories[4].id,
    },
    {
      name: 'Natural Skincare Set',
      slug: 'natural-skincare-set',
      description:
        'Complete skincare routine with natural, organic ingredients. Includes cleanser, toner, moisturizer, and serum.',
      price: 7999,
      compareAtPrice: 9999,
      images: ['/products/skincare.jpg'],
      sku: 'BEAU-00001',
      stock: 75,
      categoryId: createdCategories[5].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`Created ${products.length} products`);

  const coupons = [
    {
      code: 'WELCOME10',
      discount: 10,
      type: 'PERCENT' as const,
      minOrder: 5000,
      maxUses: 1000,
    },
    {
      code: 'SAVE20',
      discount: 20,
      type: 'PERCENT' as const,
      minOrder: 10000,
      maxUses: 500,
    },
    {
      code: 'FLAT500',
      discount: 500,
      type: 'FIXED' as const,
      minOrder: 2500,
      maxUses: 200,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  console.log(`Created ${coupons.length} coupons`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
