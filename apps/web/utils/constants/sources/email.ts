export interface EmailProvider {
  name: string;
  description: string;
  features: string[];
  link: string;
  pricing: "free" | "freemium" | "paid";
  emailTypes: string[];
  monthlyLimit?: string;
}

export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    name: "Resend",
    description: "Email API for developers built by developers",
    features: [
      "Developer-first API",
      "React email templates",
      "Webhooks",
      "Analytics",
      "Domain authentication",
      "Excellent deliverability",
    ],
    link: "https://resend.com/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "3,000 emails/month free",
  },
  {
    name: "SendGrid",
    description: "Twilio SendGrid email delivery service",
    features: [
      "Email API",
      "SMTP relay",
      "Email validation",
      "Marketing campaigns",
      "Analytics",
      "Deliverability insights",
    ],
    link: "https://sendgrid.com/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "100 emails/day free",
  },
  {
    name: "Mailgun",
    description: "Email service for developers",
    features: [
      "Email API",
      "SMTP",
      "Email validation",
      "Inbound email parsing",
      "Analytics",
      "A/B testing",
    ],
    link: "https://www.mailgun.com/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "5,000 emails/month free",
  },
  {
    name: "Amazon SES",
    description: "Amazon Simple Email Service",
    features: [
      "High deliverability",
      "Email sending",
      "Email receiving",
      "Configuration sets",
      "Reputation tracking",
      "Dedicated IP",
    ],
    link: "https://aws.amazon.com/ses/",
    pricing: "paid",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "$0.10 per 1,000 emails",
  },
  {
    name: "Postmark",
    description: "Email delivery for web applications",
    features: [
      "Transactional email",
      "Fast delivery",
      "Detailed analytics",
      "Bounce handling",
      "Templates",
      "Inbound email",
    ],
    link: "https://postmarkapp.com/",
    pricing: "freemium",
    emailTypes: ["Transactional"],
    monthlyLimit: "100 emails/month free",
  },
  {
    name: "Mailchimp",
    description: "All-in-one marketing platform",
    features: [
      "Email marketing",
      "Automation",
      "Landing pages",
      "Analytics",
      "A/B testing",
      "Audience segmentation",
    ],
    link: "https://mailchimp.com/",
    pricing: "freemium",
    emailTypes: ["Marketing"],
    monthlyLimit: "10,000 emails/month free",
  },
  {
    name: "ConvertKit",
    description: "Email marketing for creators",
    features: [
      "Email sequences",
      "Automation",
      "Landing pages",
      "Forms",
      "Tagging",
      "Creator-focused",
    ],
    link: "https://convertkit.com/",
    pricing: "freemium",
    emailTypes: ["Marketing"],
    monthlyLimit: "1,000 subscribers free",
  },
  {
    name: "Brevo (Sendinblue)",
    description: "All-in-one digital marketing platform",
    features: [
      "Email marketing",
      "SMS marketing",
      "Chat",
      "CRM",
      "Marketing automation",
      "Transactional email",
    ],
    link: "https://www.brevo.com/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "300 emails/day free",
  },
  {
    name: "EmailJS",
    description: "Send emails directly from JavaScript",
    features: [
      "Client-side email sending",
      "No backend required",
      "Template support",
      "Multiple services",
      "Easy integration",
      "Form submissions",
    ],
    link: "https://www.emailjs.com/",
    pricing: "freemium",
    emailTypes: ["Transactional"],
    monthlyLimit: "200 emails/month free",
  },
  {
    name: "Loops",
    description: "Email for modern SaaS",
    features: [
      "Transactional email",
      "Email sequences",
      "User segmentation",
      "Analytics",
      "A/B testing",
      "API-first",
    ],
    link: "https://loops.so/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "2,000 emails/month free",
  },
  {
    name: "Plunk",
    description: "Email platform for developers",
    features: [
      "Simple API",
      "Email templates",
      "Analytics",
      "Webhooks",
      "Campaign management",
      "Developer-friendly",
    ],
    link: "https://useplunk.com/",
    pricing: "freemium",
    emailTypes: ["Transactional", "Marketing"],
    monthlyLimit: "3,000 emails/month free",
  },
  {
    name: "Nodemailer",
    description: "Email sending library for Node.js",
    features: [
      "SMTP support",
      "HTML/text emails",
      "Attachments",
      "Embedded images",
      "OAuth2 authentication",
      "Custom transport",
    ],
    link: "https://nodemailer.com/",
    pricing: "free",
    emailTypes: ["Transactional"],
    monthlyLimit: "Unlimited (self-hosted)",
  },
];

// Helper functions
export const getEmailByType = (type: string) => {
  return EMAIL_PROVIDERS.filter((provider) =>
    provider.emailTypes.includes(type)
  );
};

export const getFreeEmailProviders = () => {
  return EMAIL_PROVIDERS.filter((provider) => provider.pricing === "free");
};

export const getFreemiumEmailProviders = () => {
  return EMAIL_PROVIDERS.filter((provider) => provider.pricing === "freemium");
};

export const getPaidEmailProviders = () => {
  return EMAIL_PROVIDERS.filter((provider) => provider.pricing === "paid");
};

export const EMAIL_TYPES = ["Transactional", "Marketing", "Newsletter"];
