import { supabase, isSupabaseConfigured } from './supabase';
import * as ImagePicker from 'expo-image-picker';

export const BUCKET_NAME = 'product-images';

/**
 * Convert base64 string to Uint8Array safely in React Native / Expo
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');

  if (typeof atob === 'function') {
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Pure JS fallback for base64 decoding
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bufferLength = Math.floor(cleanBase64.length * 0.75);
  if (cleanBase64.endsWith('==')) bufferLength -= 2;
  else if (cleanBase64.endsWith('=')) bufferLength -= 1;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < cleanBase64.length; i += 4) {
    const enc1 = chars.indexOf(cleanBase64[i]);
    const enc2 = chars.indexOf(cleanBase64[i + 1]);
    const enc3 = chars.indexOf(cleanBase64[i + 2]);
    const enc4 = chars.indexOf(cleanBase64[i + 3]);

    bytes[p++] = (enc1 << 2) | (enc2 >> 4);
    if (enc3 !== 64 && enc3 !== -1 && p < bufferLength) {
      bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
    }
    if (enc4 !== 64 && enc4 !== -1 && p < bufferLength) {
      bytes[p++] = ((enc3 & 3) << 6) | enc4;
    }
  }

  return bytes;
}

/**
 * Uploads an image asset to Supabase Storage and returns its permanent Public URL.
 * Falls back gracefully to local URI if offline or upload fails.
 */
export async function uploadImageToSupabase(
  asset: ImagePicker.ImagePickerAsset,
  folder: 'categories' | 'products' = 'categories'
): Promise<string> {
  // If Supabase is not configured or no base64, return local URI
  if (!isSupabaseConfigured() || !asset.base64) {
    return asset.uri;
  }

  try {
    const bytes = base64ToUint8Array(asset.base64);
    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
    const contentType = asset.mimeType || 'image/jpeg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, bytes.buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('Supabase image upload error, using local URI fallback:', error);
      return asset.uri;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase storage:', err);
    return asset.uri;
  }
}

