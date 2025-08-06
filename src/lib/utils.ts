import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Converts degrees to radians.
 * @param {number} degrees - Angle in degrees.
 * @returns {number} - Angle in radians.
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees.
 * @param {number} radians - Angle in radians.
 * @returns {number} - Angle in degrees.
 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}
