import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function separarTags(texto: string): string[] {
  return texto.split(",").map((tag) => tag.trim()).filter(Boolean);
}
