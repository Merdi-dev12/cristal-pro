export interface ServiceOffer {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
  cta: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}
