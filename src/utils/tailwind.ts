/**
 * Tailwind CSS utility functions
 * Provides class name combination and conditional styling utilities
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with tailwind-merge for proper class conflicts resolution
 * @param inputs - Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class name helper
 * @param condition - Boolean condition
 * @param trueClasses - Classes to apply when condition is true
 * @param falseClasses - Classes to apply when condition is false
 * @returns Class string based on condition
 */
export function conditionalClass(
  condition: boolean,
  trueClasses: string,
  falseClasses: string = ''
): string {
  return condition ? trueClasses : falseClasses;
}

/**
 * Variant class selector
 * @param variant - Current variant
 * @param variants - Object mapping variants to class names
 * @param defaultVariant - Default variant to use
 * @returns Class string for the variant
 */
export function variantClass<T extends string>(
  variant: T,
  variants: Record<T, string>,
  defaultVariant?: T
): string {
  return variants[variant] || (defaultVariant ? variants[defaultVariant] : '');
}

/**
 * Size class selector
 * @param size - Size value
 * @param sizes - Object mapping sizes to class names
 * @returns Class string for the size
 */
export function sizeClass(
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  sizes: Record<string, string>
): string {
  return sizes[size] || sizes.md || '';
}

export default cn; 