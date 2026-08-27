import { z } from 'zod';

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD' });

export const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Format waktu harus HH:mm' });

export const cornerSchema = z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']);

export const locationSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(120),
  admin1: z.string().max(120).optional(),
  country: z.string().min(1).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1).max(100),
});

export const agendaItemSchema = z
  .object({
    id: z.string().min(1),
    date: dateStringSchema,
    title: z.string().trim().min(1, 'Judul agenda tidak boleh kosong').max(120, 'Maksimal 120 karakter'),
    startTime: timeStringSchema,
    endTime: timeStringSchema.optional().or(z.literal('')),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine(
    (val) => {
      if (!val.endTime || val.endTime.trim() === '') return true;
      return val.endTime > val.startTime;
    },
    {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['endTime'],
    }
  );

export const createAgendaInputSchema = z
  .object({
    date: dateStringSchema,
    title: z.string().trim().min(1, 'Judul agenda tidak boleh kosong').max(120, 'Maksimal 120 karakter'),
    startTime: timeStringSchema,
    endTime: timeStringSchema.optional().or(z.literal('')),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
  })
  .refine(
    (val) => {
      if (!val.endTime || val.endTime.trim() === '') return true;
      return val.endTime > val.startTime;
    },
    {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['endTime'],
    }
  );

export const updateAgendaInputSchema = z
  .object({
    id: z.string().min(1),
    date: dateStringSchema,
    title: z.string().trim().min(1, 'Judul agenda tidak boleh kosong').max(120, 'Maksimal 120 karakter'),
    startTime: timeStringSchema,
    endTime: timeStringSchema.optional().or(z.literal('')),
    notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
  })
  .refine(
    (val) => {
      if (!val.endTime || val.endTime.trim() === '') return true;
      return val.endTime > val.startTime;
    },
    {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['endTime'],
    }
  );

export const todoItemSchema = z.object({
  id: z.string().min(1),
  seriesId: z.string().min(1),
  date: dateStringSchema,
  title: z.string().trim().min(1, 'Judul todo tidak boleh kosong').max(160, 'Maksimal 160 karakter'),
  completed: z.boolean(),
  carryOver: z.boolean(),
  carriedFromId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTodoInputSchema = z.object({
  date: dateStringSchema.optional(),
  title: z.string().trim().min(1, 'Judul todo tidak boleh kosong').max(160, 'Maksimal 160 karakter'),
  carryOver: z.boolean().optional(),
});

export const updateTodoInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, 'Judul todo tidak boleh kosong').max(160, 'Maksimal 160 karakter'),
  carryOver: z.boolean(),
});

export const quickNoteSchema = z.object({
  text: z.string().max(10000, 'Catatan maksimal 10.000 karakter'),
  updatedAt: z.string(),
});

export const saveNoteInputSchema = z.object({
  text: z.string().max(10000, 'Catatan maksimal 10.000 karakter'),
});

export const weatherDataSchema = z.object({
  temperature: z.number(),
  apparentTemperature: z.number(),
  relativeHumidity: z.number(),
  isDay: z.number(),
  precipitation: z.number(),
  weatherCode: z.number(),
  windSpeed: z.number(),
  temperatureMax: z.number(),
  temperatureMin: z.number(),
  precipitationProbabilityMax: z.number(),
  locationName: z.string(),
});

export const weatherCacheSchema = z.object({
  locationId: z.number(),
  fetchedAt: z.string(),
  data: weatherDataSchema,
});

export const windowBoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const appSettingsSchema = z.object({
  corner: cornerSchema,
  margin: z.number().min(0).max(128),
  alwaysOnTop: z.boolean(),
  launchAtLogin: z.boolean(),
  location: locationSchema.nullable(),
  windowBounds: windowBoundsSchema.nullable().optional(),
});

export const updateSettingsInputSchema = z.object({
  corner: cornerSchema.optional(),
  margin: z.number().min(0).max(128).optional(),
  alwaysOnTop: z.boolean().optional(),
  launchAtLogin: z.boolean().optional(),
  location: locationSchema.nullable().optional(),
  windowBounds: windowBoundsSchema.nullable().optional(),
});

export const appDataSchema = z.object({
  schemaVersion: z.literal(1),
  settings: appSettingsSchema,
  agenda: z.array(agendaItemSchema),
  todos: z.array(todoItemSchema),
  quickNote: quickNoteSchema,
  weatherCache: weatherCacheSchema.nullable(),
  meta: z.object({
    lastRolloverDate: dateStringSchema.nullable(),
  }),
});
