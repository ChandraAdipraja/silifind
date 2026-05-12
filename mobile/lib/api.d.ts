import type { AxiosInstance } from 'axios';
import type { ImagePickerAsset } from 'expo-image-picker';

export type UserRole = 'user' | 'operator' | 'admin';

export type AuthUser = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
};

export type Report = {
  _id: string;
  title: string;
  category: string;
  description: string;
  image?: string | null;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  type: 'lost' | 'found';
  status: 'open' | 'claimed' | 'returned';
  reportedBy?: AuthUser | string;
  createdAt?: string;
};

export type Claim = {
  _id: string;
  claimant?: AuthUser | string;
  report?: Report;
  proofDescription: string;
  proofImage?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
};

export const TOKEN_KEY: string;
export const API_BASE_URL: string;
export const api: AxiosInstance;
export function saveToken(token: string): Promise<void>;
export function getToken(): Promise<string | null>;
export function removeToken(): Promise<void>;
export function setUnauthorizedHandler(handler: (() => void) | null): void;
export function getErrorMessage(error: unknown, fallback?: string): string;
export function uploadImage(asset: ImagePickerAsset): Promise<string>;
