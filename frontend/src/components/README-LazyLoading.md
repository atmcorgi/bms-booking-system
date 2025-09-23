# Lazy Loading Solution

## Tổng quan

Giải pháp lazy loading đã được hoàn thiện với các tính năng tối ưu hóa hiệu suất và trải nghiệm người dùng.

## Các component chính

### 1. LazyImage

Component chính để lazy load hình ảnh với các tính năng:

- Intersection Observer API để detect khi image vào viewport
- Image optimization với fallback mechanism
- Loading states với shimmer animation
- Error handling với retry functionality
- Responsive image sizing

**Sử dụng:**

```tsx
import LazyImage from "./components/LazyImage";

<LazyImage
  src="https://example.com/image.jpg"
  alt="Movie poster"
  width={300}
  height={450}
  quality={85}
  onLoad={() => console.log("Image loaded")}
  onError={() => console.log("Image failed")}
/>;
```

### 2. LazyVideo

Component để lazy load video với các tính năng tương tự LazyImage.

**Sử dụng:**

```tsx
import LazyVideo from "./components/LazyVideo";

<LazyVideo
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  autoplay={false}
  muted={true}
  controls={true}
/>;
```

### 3. ImageGallery

Component demo để hiển thị nhiều hình ảnh với lazy loading và preloading.

**Sử dụng:**

```tsx
import ImageGallery from "./components/ImageGallery";

<ImageGallery
  images={[
    { id: "1", src: "url1", alt: "Image 1" },
    { id: "2", src: "url2", alt: "Image 2" },
  ]}
  columns={3}
  preloadCount={6}
/>;
```

## Custom Hook

### useLazyImage

Hook tùy chỉnh để quản lý logic lazy loading:

```tsx
import { useLazyImage } from "./hooks/useLazyImage";

const { imageSrc, isLoaded, isLoading, hasError, imgRef, retry } = useLazyImage(
  {
    src: "image-url",
    width: 300,
    height: 450,
    quality: 80,
  }
);
```

## Utility Functions

### imageOptimization.ts

Các utility functions để tối ưu hóa hình ảnh:

- `getOptimizedImageUrl()`: Tạo URL tối ưu với parameters
- `getResponsiveImageUrls()`: Tạo responsive URLs cho các kích thước khác nhau
- `preloadImage()`: Preload một hình ảnh
- `preloadImages()`: Preload nhiều hình ảnh với concurrency limit
- `generateImagePlaceholder()`: Tạo placeholder SVG

## CSS Classes

### optimization.css

Các CSS classes cho animations và styling:

- `.lazy-image.loading`: Loading state với shimmer effect
- `.lazy-image.error`: Error state với grayscale filter
- `.skeleton`: Skeleton loading animation
- `.movie-card`: Hover effects cho movie cards

## Tính năng chính

### 1. Performance Optimization

- Intersection Observer API thay vì scroll events
- Image preloading cho critical images
- Optimized image URLs với quality parameters
- Lazy loading với threshold và rootMargin tùy chỉnh

### 2. Error Handling

- Fallback mechanism: optimized URL → original URL → placeholder
- Retry functionality khi image load thất bại
- Graceful degradation cho external images

### 3. User Experience

- Smooth loading animations
- Loading states với shimmer effect
- Error states với retry button
- Responsive design

### 4. Accessibility

- Proper alt text support
- Reduced motion support
- Keyboard navigation
- Screen reader friendly

## Cách sử dụng trong project

### 1. Thay thế img tags thông thường

```tsx
// Trước
<img src={movie.posterUrl} alt={movie.title} />

// Sau
<LazyImage
  src={movie.posterUrl}
  alt={movie.title}
  width={300}
  height={450}
  quality={85}
/>
```

### 2. Import CSS

Đảm bảo import optimization.css trong main CSS file:

```css
@import "./styles/optimization.css";
```

### 3. Preload critical images

```tsx
import { preloadImages } from "./utils/imageOptimization";

// Preload first few images
useEffect(() => {
  const criticalImages = movies.slice(0, 6).map((m) => m.posterUrl);
  preloadImages(criticalImages, 3);
}, [movies]);
```

## Lưu ý quan trọng

1. **Browser Support**: Intersection Observer API được support từ Chrome 51+, Firefox 55+, Safari 12.1+
2. **Performance**: Sử dụng `loading="lazy"` attribute như fallback cho browsers cũ
3. **SEO**: Đảm bảo alt text được cung cấp cho tất cả images
4. **Network**: Giải pháp hoạt động tốt với slow connections nhờ progressive loading

## Troubleshooting

### Images không load

- Kiểm tra URL có hợp lệ không
- Kiểm tra CORS policy
- Sử dụng retry functionality

### Performance issues

- Giảm preloadCount
- Tăng threshold value
- Sử dụng lower quality settings

### Layout shift

- Đặt width/height cố định cho containers
- Sử dụng aspect-ratio CSS property
- Preload critical images
