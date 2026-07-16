import Link from 'next/link';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=electronics', label: 'Electronics' },
    { href: '/products?category=clothing', label: 'Clothing' },
    { href: '/products?category=home', label: 'Home & Living' },
  ],
  account: [
    { href: '/login', label: 'Sign In' },
    { href: '/register', label: 'Create Account' },
    { href: '/orders', label: 'Order History' },
    { href: '/cart', label: 'Shopping Cart' },
  ],
  company: [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Press' },
  ],
  support: [
    { href: '#', label: 'Help Center' },
    { href: '#', label: 'Shipping Info' },
    { href: '#', label: 'Returns' },
    { href: '#', label: 'Contact Us' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">ModernStore</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your destination for premium products with an exceptional shopping experience.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@modernstore.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {[
            { title: 'Shop', links: footerLinks.shop },
            { title: 'Account', links: footerLinks.account },
            { title: 'Company', links: footerLinks.company },
            { title: 'Support', links: footerLinks.support },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ModernStore. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
