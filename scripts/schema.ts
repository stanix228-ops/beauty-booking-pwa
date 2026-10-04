import { z } from 'zod';

export const WorkplaceTypeSchema = z.enum(['MANICURE_DESK', 'PEDICURE_CHAIR', 'UNIVERSAL']);

export const WorkplaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: WorkplaceTypeSchema.default('MANICURE_DESK'),
  isActive: z.boolean().default(true),
});

export const ServiceCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const ServiceOptionSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid().optional(), // optional; if undefined, universal
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  durationMin: z.number().int().nonnegative().default(0),
  bufferAfterMin: z.number().int().nonnegative().default(0),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  durationMin: z.number().int().positive(),
  bufferAfterMin: z.number().int().nonnegative().default(15),
  requiredWorkplaceType: WorkplaceTypeSchema.default('MANICURE_DESK'),
  imageUrl: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const BreakPeriodSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  reason: z.string().default('Break'),
});

export const DayScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0: Sunday, 1: Monday ... 6: Saturday
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  isDayOff: z.boolean().default(false),
  breaks: z.array(BreakPeriodSchema).default([]),
});

export const MasterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  title: z.string().min(1),
  specialization: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).default(5.0),
  reviewsCount: z.number().int().nonnegative().default(0),
  serviceIds: z.array(z.string().uuid()).min(1),
  schedule: z.array(DayScheduleSchema).min(1),
  breaks: z.array(BreakPeriodSchema).default([]),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const BusinessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format HH:MM'),
  isClosed: z.boolean().default(false),
});

export const HexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const BusinessThemeSchema = z.object({
  accentColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').default('#4690FF'),
  secondaryAccentColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').optional().default('#F5EBE0'),
  bgColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').default('#000000'),
  cardBgColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').default('#0E0E10'),
  borderColor: z.string().optional().default('rgba(255, 255, 255, 0.1)'),
  textColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').default('#FFFFFF'),
  mutedColor: z.string().regex(HexColorRegex, 'Must be valid HEX color').default('#A1A1AA'),
  fontHeading: z.string().default('Inter, sans-serif'),
  fontBody: z.string().default('Inter, sans-serif'),
});

export const InfoCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().default('Sparkle'),
});

export const GalleryItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string(),
  caption: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const BusinessConfigSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lower-case alphanumeric with hyphens'),
  name: z.string().min(2),
  status: z.enum(['sample', 'published']).default('sample'),
  tagline: z.string().optional(),
  phone: z.string().min(7),
  address: z.string().min(3),
  city: z.string().default('Los Angeles, CA'),
  timezone: z.string().default('America/Los_Angeles'),
  currency: z.string().default('USD'),
  minBookingNoticeMin: z.number().int().nonnegative().default(60),
  maxBookingHorizonDays: z.number().int().positive().default(30),
  cancellationDeadlineHours: z.number().int().nonnegative().default(4),
  instructions: z.string().optional(),
  theme: BusinessThemeSchema,
  infoCards: z.array(InfoCardSchema).default([
    { id: 'card-1', title: 'Open Daily', description: 'From 10:00 AM to 9:00 PM without interruptions', icon: 'Clock' },
    { id: 'card-2', title: 'Top-Tier Artists', description: 'Certified specialists with 5+ years of luxury salon expertise', icon: 'Star' },
    { id: 'card-3', title: 'Hospital-Grade Sterilization', description: 'Autoclave 3-step hygiene standards & hypoallergenic gel coats', icon: 'ShieldCheck' }
  ]),
  businessHours: z.array(BusinessHoursSchema).min(7),
  workplaces: z.array(WorkplaceSchema).min(1),
  categories: z.array(ServiceCategorySchema).min(1),
  services: z.array(ServiceSchema).min(1),
  options: z.array(ServiceOptionSchema).default([]),
  masters: z.array(MasterSchema).min(1),
  assets: z.object({
    logo: z.string().optional(),
    hero: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    galleryItems: z.array(GalleryItemSchema).default([]),
  }).default({}),
});

export type BusinessConfig = z.infer<typeof BusinessConfigSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type ServiceOption = z.infer<typeof ServiceOptionSchema>;
export type Master = z.infer<typeof MasterSchema>;
export type Workplace = z.infer<typeof WorkplaceSchema>;
export type InfoCard = z.infer<typeof InfoCardSchema>;
export type GalleryItem = z.infer<typeof GalleryItemSchema>;
