export interface BlockedDate {
  id: string;
  date: string;
  reason: string | null;
}

export interface Testimonial {
  id: string;
  customerName: string;
  message: string;
  rating: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface DateAvailability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  isActive: boolean;
  order: number;
}

export interface NavItem {
  label: string;
  href: string;
}
