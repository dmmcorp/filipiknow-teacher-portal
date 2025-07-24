import { clsx, type ClassValue } from "clsx";
import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const geistEfcaFont = localFont({
  src: "../../public/assets/fonts/EfcoBrookshire.ttf",
});
