import { z } from 'zod';

export const CountryCodeSchema = z.enum(['BE', 'NL']);
export const CountryScopeSchema = z.enum(['BE', 'NL', '*']);
export const PrioritySchema = z.enum(['low', 'medium', 'high']);
export const StockStatusSchema = z.enum(['in_stock', 'out_of_stock', 'unknown']);

export type CountryCode = z.infer<typeof CountryCodeSchema>;
export type CountryScope = z.infer<typeof CountryScopeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type StockStatus = z.infer<typeof StockStatusSchema>;
export type AppEnvironment = 'dev' | 'staging' | 'prod';
