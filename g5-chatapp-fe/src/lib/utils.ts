import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export function getNameFallBack(firstName: string, lastName: string) {
  const firstInitial = firstName.trim()[0] || "";
  const lastInitial = lastName.trim()[0] || "";
  return (firstInitial + lastInitial).toUpperCase();
}
