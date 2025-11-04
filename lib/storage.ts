import { supabase } from '@/lib/supabase/client';

const BUCKET_NAME = 'content-files';

export async function uploadFile(
  file: File,
  folder: 'thumbnails' | 'videos' | 'audio' | 'images',
  fileName?: string
): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${finalFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    throw new Error(`Dosya yüklenemedi: ${error.message}`);
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Dosya silinemedi:', error);
    // Don't throw - file might not exist
  }
}

export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

