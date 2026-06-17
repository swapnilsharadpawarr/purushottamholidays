import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isDbConfigured } from '../lib/supabase';


interface UploadResult {
  url: string;
  fileId: string;
  thumbnailUrl: string;
}

interface ImageKitUploaderProps {
  folder: 'rooms' | 'attractions' | 'food' | 'gallery' | 'site-assets';
  onUploadSuccess: (result: UploadResult) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  label?: string;
  accept?: string;
}

// Helper to generate HMAC-SHA1 signature locally in browser using Web Crypto API
const generateLocalSignature = async (token: string, expire: number, privateKey: string): Promise<string> => {
  const text = token + expire;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(text);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );
  
  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({
  folder,
  onUploadSuccess,
  onUploadStart,
  onUploadError,
  label = 'Upload Image',
  accept = 'image/*',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateDemoUpload = (file: File) => {
    setIsUploading(true);
    setProgress(0);
    if (onUploadStart) onUploadStart();

    // Create a local object URL to show as preview instantly
    const localUrl = URL.createObjectURL(file);

    // Simulate progress bar loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsUploading(false);

      // Choose a beautiful placeholder image from Unsplash to simulate a real upload URL
      const categoryImages: Record<string, string> = {
        rooms: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
        food: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80',
        attractions: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?w=800&auto=format&fit=crop&q=80',
        gallery: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
        'site-assets': 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&auto=format&fit=crop&q=80',
      };

      const finalUrl = categoryImages[folder] || localUrl;

      onUploadSuccess({
        url: finalUrl,
        fileId: `demo-file-${Date.now()}`,
        thumbnailUrl: finalUrl,
      });
    }, 1500);
  };

  const handleRealUpload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    if (onUploadStart) onUploadStart();

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
    const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;

    try {
      let authData: { token: string; expire: number; signature: string };

      if (privateKey) {
        // Generate signature locally using Web Crypto API to bypass needing a Supabase Edge Function
        const token = window.crypto.randomUUID();
        const expire = Math.floor(Date.now() / 1000) + 1800; // expires in 30 minutes
        const signature = await generateLocalSignature(token, expire, privateKey);
        authData = { token, expire, signature };
      } else {
        // Fetch authentication parameters from Supabase edge function
        const authResponse = await fetch(`${supabaseUrl}/functions/v1/imagekit-auth`, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (!authResponse.ok) {
          throw new Error('Could not get upload authentication signature from Supabase.');
        }

        authData = await authResponse.json();
      }

      // 2. Prepare FormData for ImageKit
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `${folder}_${Date.now()}_${file.name}`);
      formData.append('publicKey', publicKey);
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      formData.append('folder', `purushottamholidays/${folder}`);

      // 3. Perform the upload request with Progress Tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload', true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          setProgress(percentage);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          onUploadSuccess({
            url: response.url,
            fileId: response.fileId,
            thumbnailUrl: response.thumbnailUrl,
          });
        } else {
          const errText = `Upload failed with status ${xhr.status}`;
          toast.error(errText);
          if (onUploadError) onUploadError(errText);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        const errText = 'Network error during media upload.';
        toast.error(errText);
        if (onUploadError) onUploadError(errText);
      };

      xhr.send(formData);
    } catch (err: any) {
      console.error('Real ImageKit upload failed:', err);
      setIsUploading(false);
      const errMsg = err.message || 'Signature generation error.';
      toast.error(`Image upload failed: ${errMsg}. Please configure VITE_IMAGEKIT_PRIVATE_KEY in Vercel or deploy the Supabase imagekit-auth edge function.`);
      if (onUploadError) onUploadError(errMsg);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (isDbConfigured()) {
      handleRealUpload(file);
    } else {
      simulateDemoUpload(file);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept={accept}
        className="hidden"
      />
      
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-amber-gold bg-forest-50/50 scale-[0.99]'
            : 'border-forest-200 bg-white hover:border-forest-500'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-10 w-10 text-forest-500 animate-spin" />
            <p className="text-sm font-semibold text-forest-700">Uploading to ImageKit...</p>
            <div className="w-48 bg-forest-100 rounded-full h-2">
              <div
                className="bg-forest-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-forest-500">{progress}% completed</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-forest-50 rounded-full text-forest-600">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-forest-800">{label}</p>
            <p className="text-xs text-forest-500">
              Drag & drop your file here, or click to browse
            </p>
            <span className="text-[10px] text-amber-gold-dark font-medium uppercase tracking-wider bg-forest-50 px-2 py-0.5 rounded-full">
              {!isDbConfigured() ? 'Demo Mode active' : 'ImageKit CDN Connected'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
export default ImageKitUploader;
