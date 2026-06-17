export interface ImageKitOptions {
  width?: number;
  height?: number;
  quality?: number;
  cropMode?: string;
  blur?: number;
  raw?: boolean;
}

/**
 * Returns a transformed ImageKit URL with the specified parameters.
 * Handles relative paths (e.g. 'rooms/ac-room.jpg'), fully qualified ImageKit URLs,
 * and falls back gracefully to standard URLs or placeholder graphics.
 */
export const getImageKitUrl = (src: string | undefined, options: ImageKitOptions = {}): string => {
  if (!src) return 'https://placehold.co/600x400?text=No+Image';

  // Check if ImageKit URL endpoint is configured
  const endpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/demo';
  const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

  let baseUrl = src;

  // If it's a relative path, prefix it with the ImageKit endpoint
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    const cleanSrc = src.startsWith('/') ? src : `/${src}`;
    baseUrl = `${cleanEndpoint}${cleanSrc}`;
  }

  // Only apply transformations if it's an ImageKit URL
  if (baseUrl.includes('ik.imagekit.io')) {
    const { width, height, quality = 80, cropMode, blur, raw = false } = options;
    if (raw) return baseUrl;

    const transforms: string[] = [];
    if (width) transforms.push(`w-${width}`);
    if (height) transforms.push(`h-${height}`);
    transforms.push(`q-${quality}`);
    transforms.push('f-auto'); // WebP/AVIF auto-format delivery

    if (cropMode) {
      transforms.push(cropMode);
    } else if (width && height) {
      transforms.push('fo-auto'); // Default smart crop focus
    }

    if (blur) {
      transforms.push(`bl-${blur}`);
    }

    const transformString = `tr=${transforms.join(',')}`;

    // Clean up existing query params if they contain tr
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set('tr', transforms.join(','));
    return urlObj.toString();
  }

  return baseUrl;
};

/**
 * Generates a responsive srcset string for responsive image loading.
 */
export const getImageKitSrcSet = (src: string | undefined, sizes = [400, 800, 1200], aspectRatio?: number): string => {
  if (!src) return '';
  return sizes
    .map((size) => {
      const opts: ImageKitOptions = { width: size };
      if (aspectRatio) {
        opts.height = Math.round(size / aspectRatio);
      }
      return `${getImageKitUrl(src, opts)} ${size}w`;
    })
    .join(', ');
};
