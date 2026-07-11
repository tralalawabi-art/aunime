import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an Otakudesu episode slug into its corresponding anime details slug.
 * Example: "boruto-episode-200-sub-indo" -> "boruto-sub-indo"
 * Example: "boruto-episode-200" -> "boruto"
 */
export function getAnimeSlug(slug: string | undefined): string {
  if (!slug) return '';
  // Check if it's an episode slug (contains "-episode-" followed by numbers)
  if (/-episode-\d+/i.test(slug)) {
    return slug.replace(/-episode-\d+/gi, '');
  }
  return slug;
}
