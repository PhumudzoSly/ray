export interface PaymentProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: string;
  paymentMethods: string[];
  regions: string[];
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    name: "Stripe",
    description: "Complete payments platform for the internet",
    features: [
      "Online payments",
      "Subscriptions",
      "Marketplace",
      "Connect platform",
      "Fraud prevention",
      "Global payments",
    ],
    link: "https://stripe.com/",
    pricing: "2.9% + 30¢ per transaction",
    paymentMethods: [
      "Credit/Debit Cards",
      "Digital Wallets",
      "Bank Transfers",
      "BNPL",
    ],
    regions: ["Global"],
  },
  {
    name: "PayPal",
    description: "Global leader in online payment solutions",
    features: [
      "PayPal checkout",
      "Credit card processing",
      "Subscriptions",
      "Marketplace payments",
      "Fraud protection",
      "Global reach",
    ],
    link: "https://www.paypal.com/",
    pricing: "2.9% + $0.30 per transaction",
    paymentMethods: ["PayPal", "Credit/Debit Cards", "Digital Wallets"],
    regions: ["Global"],
  },
  {
    name: "Square",
    description: "Payment processing for businesses of all sizes",
    features: [
      "Online payments",
      "In-person payments",
      "Invoicing",
      "Subscriptions",
      "Point of sale",
      "Business tools",
    ],
    link: "https://squareup.com/",
    pricing: "2.9% + 30¢ per transaction",
    paymentMethods: ["Credit/Debit Cards", "Digital Wallets", "Cash"],
    regions: [
      "US",
      "Canada",
      "Australia",
      "UK",
      "Ireland",
      "Spain",
      "France",
      "Japan",
    ],
  },
  {
    name: "Paddle",
    description: "Complete payments, tax, and subscriptions solution for SaaS",
    features: [
      "Global tax compliance",
      "Subscription management",
      "Fraud prevention",
      "Checkout optimization",
      "Revenue recovery",
      "Analytics",
    ],
    link: "https://www.paddle.com/",
    pricing: "5% + payment processing fees",
    paymentMethods: ["Credit/Debit Cards", "PayPal", "Apple Pay", "Google Pay"],
    regions: ["Global"],
  },
  {
    name: "Razorpay",
    description: "Complete payment solution for businesses in India",
    features: [
      "Payment gateway",
      "UPI payments",
      "Subscriptions",
      "Marketplace",
      "Banking services",
      "Business tools",
    ],
    link: "https://razorpay.com/",
    pricing: "2% per transaction",
    paymentMethods: ["Credit/Debit Cards", "UPI", "Net Banking", "Wallets"],
    regions: ["India"],
  },
  {
    name: "Adyen",
    description: "Global payment platform for enterprise businesses",
    features: [
      "Unified commerce",
      "Risk management",
      "Data insights",
      "Global acquiring",
      "Omnichannel",
      "Platform solutions",
    ],
    link: "https://www.adyen.com/",
    pricing: "Custom pricing",
    paymentMethods: [
      "Credit/Debit Cards",
      "Digital Wallets",
      "Local Payment Methods",
    ],
    regions: ["Global"],
  },
  {
    name: "Braintree",
    description:
      "PayPal service for accepting payments online and in mobile apps",
    features: [
      "Credit card processing",
      "PayPal integration",
      "Venmo payments",
      "Subscriptions",
      "Marketplace",
      "Fraud protection",
    ],
    link: "https://www.braintreepayments.com/",
    pricing: "2.9% + $0.30 per transaction",
    paymentMethods: [
      "Credit/Debit Cards",
      "PayPal",
      "Venmo",
      "Apple Pay",
      "Google Pay",
    ],
    regions: ["Global"],
  },
  {
    name: "Mollie",
    description: "Effortless payments for European businesses",
    features: [
      "European payment methods",
      "Subscriptions",
      "Marketplace",
      "Multi-currency",
      "Fraud prevention",
      "Easy integration",
    ],
    link: "https://www.mollie.com/",
    pricing: "1.8% + €0.25 per transaction",
    paymentMethods: [
      "Credit/Debit Cards",
      "iDEAL",
      "SEPA",
      "Bancontact",
      "Sofort",
    ],
    regions: ["Europe"],
  },
  {
    name: "Flutterwave",
    description:
      "Payment infrastructure for global merchants and payment service providers",
    features: [
      "African payment methods",
      "Global card processing",
      "Mobile money",
      "Bank transfers",
      "Subscriptions",
      "Marketplace",
    ],
    link: "https://flutterwave.com/",
    pricing: "1.4% per transaction",
    paymentMethods: [
      "Credit/Debit Cards",
      "Mobile Money",
      "Bank Transfers",
      "USSD",
    ],
    regions: ["Africa", "Global"],
  },
  {
    name: "Paystack",
    description: "Modern online and offline payments for Africa",
    features: [
      "Online payments",
      "Subscriptions",
      "Transfers",
      "Invoicing",
      "Point of sale",
      "Business tools",
    ],
    link: "https://paystack.com/",
    pricing: "1.5% + ₦100 per transaction",
    paymentMethods: [
      "Credit/Debit Cards",
      "Bank Transfers",
      "Mobile Money",
      "USSD",
    ],
    regions: ["Nigeria", "Ghana", "South Africa"],
  },
  {
    name: "Lemonsqueezy",
    description: "All-in-one platform for running your SaaS business",
    features: [
      "Global tax compliance",
      "Subscription management",
      "Affiliate program",
      "Customer portal",
      "Analytics",
      "Fraud prevention",
    ],
    link: "https://www.lemonsqueezy.com/",
    pricing: "5% + payment processing fees",
    paymentMethods: ["Credit/Debit Cards", "PayPal", "Apple Pay", "Google Pay"],
    regions: ["Global"],
  },
  {
    name: "Gumroad",
    description: "Platform for creators to sell digital products",
    features: [
      "Digital product sales",
      "Subscriptions",
      "Affiliate program",
      "Analytics",
      "Customer management",
      "Global payments",
    ],
    link: "https://gumroad.com/",
    pricing: "3.5% + 30¢ per transaction",
    paymentMethods: ["Credit/Debit Cards", "PayPal", "Apple Pay", "Google Pay"],
    regions: ["Global"],
  },
];

// Helper functions
export const getPaymentByRegion = (region: string) => {
  return PAYMENT_PROVIDERS.filter(
    (provider) =>
      provider.regions.includes(region) || provider.regions.includes("Global")
  );
};

export const getPaymentByMethod = (method: string) => {
  return PAYMENT_PROVIDERS.filter((provider) =>
    provider.paymentMethods.includes(method)
  );
};

export const PAYMENT_METHODS = [
  "Credit/Debit Cards",
  "Digital Wallets",
  "Bank Transfers",
  "PayPal",
  "Apple Pay",
  "Google Pay",
  "UPI",
  "Mobile Money",
  "BNPL",
  "Cryptocurrency",
];

export const REGIONS = [
  "Global",
  "US",
  "Europe",
  "Asia",
  "Africa",
  "Latin America",
  "Middle East",
];
