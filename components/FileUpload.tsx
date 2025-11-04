'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon, Video, Music, FileImage } from 'lucide-react';
import { uploadFile } from '@/lib/storage';
import { toast } from 'sonner';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: 'thumbnails' | 'videos' | 'audio' | 'images';
  accept?: string;
  label?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  value,
  onChange,
  folder,
  accept,
  label,
  maxSize = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Dosya boyutu ${maxSize}MB'dan büyük olamaz!`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
      setPreview(url);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      toast.success('Dosya başarıyla yüklendi!');
    } catch (error: any) {
      toast.error(error.message || 'Dosya yüklenemedi');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreview(null);
  };

  const getIcon = () => {
    switch (folder) {
      case 'thumbnails':
      case 'images':
        return <ImageIcon className="w-5 h-5" />;
      case 'videos':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      default:
        return <FileImage className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL veya dosya yükleyin"
          />
        </div>
        
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${folder}`}
        />
        
        <label htmlFor={`file-upload-${folder}`}>
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {getIcon()}
                <Upload className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </label>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {preview && (
        <div className="mt-2">
          {folder === 'thumbnails' || folder === 'images' ? (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded-lg border border-white/10"
            />
          ) : (
            <div className="p-4 bg-gray-800 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">Dosya yüklendi: {value.split('/').pop()}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Maksimum dosya boyutu: {maxSize}MB
        {accept && ` • Kabul edilen formatlar: ${accept}`}
      </p>
    </div>
  );
}

