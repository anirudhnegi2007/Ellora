export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  details: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Minimalist Leather Backpack",
    description: "Handcrafted from full-grain leather, this minimalist backpack is perfect for work, travel, and daily use.",
    price: 149.00,
    category: "Bags",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.8, count: 124 },
    details: [
      "Fits up to 15-inch laptops in a dedicated sleeve",
      "Full-grain premium cowhide leather",
      "Water-resistant interior lining",
      "Padded adjustable shoulder straps"
    ]
  },
  {
    id: "2",
    name: "Wireless ANC Headphones",
    description: "Premium over-ear noise-cancelling headphones featuring studio-grade sound reproduction and 40-hour battery life.",
    price: 299.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.7, count: 88 },
    details: [
      "Active Noise Cancellation (ANC) with ambient transparency mode",
      "Up to 40 hours of battery life with quick charging",
      "Bluetooth 5.2 and multipoint pairing support",
      "Ergonomic memory-foam ear cushions"
    ]
  },
  {
    id: "3",
    name: "Mechanical Ergonomic Keyboard",
    description: "Compact 75% layout mechanical keyboard with hot-swappable switches, RGB backlighting, and wireless connectivity.",
    price: 120.00,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.5, count: 56 },
    details: [
      "Hot-swappable tactile brown switches pre-installed",
      "Triple-mode connection (Type-C, 2.4GHz wireless, Bluetooth)",
      "Customizable RGB backlighting with companion software",
      "Long-lasting 4000mAh rechargeable battery"
    ]
  },
  {
    id: "4",
    name: "Classic Chronograph Watch",
    description: "Elegant quartz chronograph watch featuring a stainless steel case, sapphire glass, and a genuine leather band.",
    price: 189.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.6, count: 95 },
    details: [
      "Precision quartz movement with three sub-dials",
      "Scratch-resistant sapphire crystal glass face",
      "Water-resistant up to 50 meters (5 ATM)",
      "Interchangeable 20mm premium leather strap"
    ]
  },
  {
    id: "5",
    name: "Organic Cotton Hoodie",
    description: "Super soft, mid-weight hoodie made entirely of ethically sourced organic cotton. Perfect for layering.",
    price: 65.00,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.4, count: 210 },
    details: [
      "100% certified organic long-staple cotton",
      "French Terry interior for ultimate comfort",
      "Pre-shrunk to retain fit and structure",
      "Produced in a Fair Trade Certified facility"
    ]
  },
  {
    id: "6",
    name: "Insulated Stainless Water Bottle",
    description: "Double-walled vacuum insulated bottle designed to keep your drinks ice cold for 24 hours or hot for 12.",
    price: 35.00,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    rating: { rate: 4.9, count: 320 },
    details: [
      "18/8 food-grade pro-section stainless steel",
      "BPA-free and toxin-free construction",
      "Leak-proof straw cap and carry loop included",
      "Sweat-free powder coat exterior finish"
    ]
  }
];
