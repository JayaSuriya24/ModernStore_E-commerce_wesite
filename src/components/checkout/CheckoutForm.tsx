'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { addressSchema } from '@/lib/validators';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useOrders';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatPrice } from '@/utils/formatters';

const steps = [
  { id: 1, name: 'Shipping', icon: MapPin },
  { id: 2, name: 'Payment', icon: CreditCard },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export function CheckoutForm() {
  const [step, setStep] = React.useState(1);
  const { items, subtotal, total, discountAmount, couponCode } = useCart();
  const checkout = useCheckout();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      phone: '',
      isDefault: false,
    },
  });

  const onSubmit = async (data: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  }) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    checkout.mutate(
      {
        shippingAddress: {
          name: data.name,
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country,
          phone: data.phone,
        },
        couponCode: couponCode || undefined,
      },
      {
        onSuccess: (result) => {
          if (result.data.url) {
            window.location.href = result.data.url;
          } else {
            toast('Order placed successfully!', 'success');
            window.location.href = `/checkout/success?orderId=${result.data.orderId}`;
          }
        },
        onError: (err) => {
          toast(err.message, 'error');
        },
      },
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      step >= s.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step >= s.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px flex-1 ${
                      step > s.id ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              <Input
                label="Full Name"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Street Address"
                placeholder="123 Main Street"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="San Francisco"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Select
                  label="State"
                  options={US_STATES.map((s) => ({ value: s, label: s }))}
                  placeholder="Select"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  placeholder="94102"
                  error={errors.zip?.message}
                  {...register('zip')}
                />
                <Input
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>
              <input type="hidden" {...register('country')} />
              <Button type="submit" className="w-full" size="lg">
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Payment</h2>
              <p className="text-sm text-muted-foreground">
                In mock mode, your order will be placed immediately without real payment.
              </p>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Stripe test mode — No real charges will be made.
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  isLoading={checkout.isPending}
                >
                  Place Order — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground line-clamp-1">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="border-border" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({couponCode})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <hr className="border-border" />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
