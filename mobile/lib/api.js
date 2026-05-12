import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

export const TOKEN_KEY = "silifind.token";

let unauthorizedHandler = null;

const defaultBaseURL = "https://silifind.onrender.com/api";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseURL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function removeToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function getErrorMessage(error, fallback = "Terjadi kesalahan") {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

export async function uploadImage(asset) {
  const formData = new FormData();
  const name = asset.fileName ?? `silifind-${Date.now()}.jpg`;
  const type = asset.mimeType ?? getMimeType(name);

  if (Platform.OS === "web") {
    const file = asset.file ?? (await createWebFile(asset.uri, name, type));
    formData.append("image", file);
  } else {
    formData.append("image", {
      uri: asset.uri,
      name,
      type,
    });
  }

  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Gagal upload gambar");
  }

  return data.url;
}

async function createWebFile(uri, name, type) {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new File([blob], name, { type: type ?? blob.type ?? "image/jpeg" });
}

function getMimeType(name) {
  const extension = name.split(".").pop()?.toLowerCase();

  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";

  return "image/jpeg";
}
