import React, { useState, useEffect } from 'react';
import { getImageKitUrl, getImageKitSrcSet, ImageKitOptions } from '../lib/imagekit';

interface ImageKitImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string | undefined;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  cropMode?: string;
  blur?: number;
  aspectRatio?: number;
  sizesAttr?: string;
}

export const ImageKitImage: React.FC<ImageKitImageProps> = ({
  path,
  alt,
  width,
  height,
  quality = 80,
  cropMode,
  blur,
  aspectRatio,
  sizesAttr = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // Generate a very low quality small version for a blur-up placeholder
  const placeholderUrl = getImageKitUrl(path, {
    width: 20,
    height: aspectRatio ? Math.round(20 / aspectRatio) : undefined,
    quality: 20,
    blur: 10,
  });

  // Main high-res URL
  const mainUrl = getImageKitUrl(path, { width, height, quality, cropMode, blur });

  // Source set for responsive images
  const srcSet = getImageKitSrcSet(path, [400, 800, 1200], aspectRatio);

  useEffect(() => {
    // Reset loaded status when source path changes
    setIsLoaded(false);
  }, [path]);

  return (
    <div className={`relative overflow-hidden bg-forest-50/50 ${className}`} style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto' }}>
      {/* Low-quality placeholder blurred background */}
      {!isLoaded && path && (
        <img
          src={placeholderUrl}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover scale-110 filter blur-md transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        src={mainUrl}
        srcSet={srcSet || undefined}
        sizes={sizesAttr}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        {...props}
      />
    </div>
  );
};
export default ImageKitImage;
