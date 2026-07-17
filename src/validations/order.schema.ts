import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(3, "Postal code is required"),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().min(0),
});

export type CouponInput = z.infer<typeof couponSchema>;
