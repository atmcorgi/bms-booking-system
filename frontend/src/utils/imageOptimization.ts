// Image optimization utilities

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Generate Cloudinary optimized URL
 */
function getCloudinaryOptimizedUrl(
  originalUrl: string,
  width: number,
  height: number,
  _quality: number,
  _format: string
): string {
  try {
    // Extract public_id from Cloudinary URL
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split("/");
    const publicId = pathParts[pathParts.length - 1].replace(/\.[^/.]+$/, ""); // Remove extension

    // Build optimized URL
    const optimizedUrl = `https://res.cloudinary.com/${url.hostname.split(".")[0]}/image/upload/w_${width},h_${height},c_fill,g_face,q_auto,f_auto/${publicId}`;

    return optimizedUrl;
  } catch (error) {
    console.warn("Failed to optimize Cloudinary URL:", error);
    return originalUrl;
  }
}

/**
 * Generate optimized image URL with parameters
 * This can be used with image CDN services like Cloudinary, ImageKit, etc.
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return "";

  const { width = 300, height = 450, quality = 80, format = "webp" } = options;

  try {
    // Cloudinary optimization
    if (originalUrl.includes("cloudinary.com")) {
      return getCloudinaryOptimizedUrl(
        originalUrl,
        width,
        height,
        quality,
        format
      );
    }

    // For external URLs (like Amazon images), we can't optimize them directly
    // But we can add loading hints
    if (
      originalUrl.includes("amazon") ||
      originalUrl.includes("media-amazon")
    ) {
      // For Amazon images, try to add referrer policy to avoid blocking
      try {
        const url = new URL(originalUrl);
        // Don't modify Amazon URLs, they work better as-is
        return url.toString();
      } catch {
        return originalUrl;
      }
    }

    // Handle relative URLs
    if (originalUrl.startsWith("/")) {
      return originalUrl;
    }

    // For absolute URLs, try to add optimization parameters
    const url = new URL(originalUrl);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("h", height.toString());
    url.searchParams.set("q", quality.toString());
    url.searchParams.set("f", format);

    return url.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    return originalUrl;
  }
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(originalUrl: string) {
  return {
    small: getOptimizedImageUrl(originalUrl, { width: 200, height: 300 }),
    medium: getOptimizedImageUrl(originalUrl, { width: 300, height: 450 }),
    large: getOptimizedImageUrl(originalUrl, { width: 400, height: 600 }),
    original: originalUrl,
  };
}

/**
 * Check if image URL is from external source
 */
export function isExternalImage(url: string): boolean {
  return url.startsWith("http") && !url.includes(window.location.hostname);
}

/**
 * Generate placeholder for image loading
 */
export function generateImagePlaceholder(
  width: number,
  height: number
): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">Loading...</text>
    </svg>
  `)}`;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload images with concurrency limit
 */
export async function preloadImages(
  urls: string[],
  concurrency: number = 3
): Promise<void[]> {
  const results: Promise<void>[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map((url) =>
      preloadImage(url).catch(() => {
        // Ignore individual failures
        console.warn(`Failed to preload image: ${url}`);
      })
    );
    results.push(...batchPromises);
  }

  return Promise.all(results);
}

/**
 * Get optimal image dimensions based on container size
 */
export function getOptimalImageDimensions(
  containerWidth: number,
  containerHeight: number,
  aspectRatio: number = 2 / 3
): { width: number; height: number } {
  const containerAspectRatio = containerWidth / containerHeight;

  if (containerAspectRatio > aspectRatio) {
    // Container is wider, fit by height
    return {
      width: Math.round(containerHeight * aspectRatio),
      height: containerHeight,
    };
  } else {
    // Container is taller, fit by width
    return {
      width: containerWidth,
      height: Math.round(containerWidth / aspectRatio),
    };
  }
}
