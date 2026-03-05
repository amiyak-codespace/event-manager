import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names intelligently, resolving conflicts.
 *
 * Args:
 *   inputs (ClassValue[]): Class values to merge.
 *
 * Returns:
 *   string: Merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
