# Enhanced Image Magnifier - Vanilla JavaScript

A comprehensive, vanilla JavaScript image magnifier inspired by **React Image Magnifier Waft** (`easy-magnify-waft` npm package). This package provides all the features of the original React package but in pure vanilla JavaScript, making it framework-agnostic and easily integrable into any web project.

## ✨ Features

- **🔍 Multiple Magnification Modes**
  - Side-by-side magnification (like Amazon/Flipkart)
  - In-place/overlay magnification
  - Zoom on hover mode
  - Zoom on move/drag mode

- **📱 Touch & Mobile Support**
  - Touch-friendly interactions
  - Long-press gesture support
  - Configurable touch activation
  - Mobile-responsive design

- **🎨 Advanced Styling**
  - Positive and negative space lens options
  - Customizable borders, shadows, and effects
  - Fade transitions and animations
  - Portal rendering support
  - Custom CSS classes and styles

- **⚡ Performance Optimized**
  - Hover intent delays
  - Loading indicators
  - Error handling
  - Memory leak prevention

- **🛠 Developer Friendly**
  - Comprehensive API
  - TypeScript-style documentation
  - Event callbacks
  - Easy configuration

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>Enhanced Image Magnifier Demo</title>
</head>
<body>
    <div style="padding: 50px;">
        <img id="product-image" 
             src="https://m.media-amazon.com/images/I/71sgEIlSvfL._AC_SX466_.jpg" 
             alt="Product Image" 
             style="width: 400px; height: auto;">
    </div>

    <script src="enhanced-magnifier.js"></script>
    <script>
        // Basic initialization
        const magnifier = new EnhancedImageMagnifier('#product-image', {
            largeImage: {
                src: 'https://m.media-amazon.com/images/I/71sgEIlSvfL._AC_SX1500_.jpg',
                width: 1500,
                height: 1500
            },
            zoomContainerWidth: 500,
            zoomContainerHeight: 500,
            zoom: 3
        });
    </script>
</body>
</html>
```

## 📖 Comprehensive API Documentation

### Constructor Options

The `EnhancedImageMagnifier` constructor accepts two parameters:

```javascript
new EnhancedImageMagnifier(selector, options)
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string \| HTMLElement` | CSS selector string or DOM element |
| `options` | `object` | Configuration options (see below) |

### Configuration Options

#### Required Props

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `largeImage.src` | `string` | `element.src` | **Required** - URL of the high-resolution image |
| `largeImage.width` | `number` | `1200` | **Required** - Natural width of large image |
| `largeImage.height` | `number` | `1800` | **Required** - Natural height of large image |

#### Image Configuration

```javascript
{
    smallImage: {
        src: string,           // Small image URL (defaults to element src)
        alt: string,           // Alt text (defaults to element alt)
        width: number,         // Small image width
        height: number,        // Small image height
        isFluidWidth: boolean  // Responsive width (default: false)
    },
    largeImage: {
        src: string,           // Large image URL (REQUIRED)
        alt: string,           // Alt text for large image
        width: number,         // Large image natural width (REQUIRED)
        height: number         // Large image natural height (REQUIRED)
    }
}
```

#### Magnification Behavior

```javascript
{
    // Mode settings
    mode: 'hover' | 'move',                    // Default: 'hover'
    enlargedImagePosition: 'beside' | 'over', // Default: 'beside'
    inPlace: boolean,                          // Default: false
    
    // IMPORTANT: For side-by-side magnification:
    // - Set enlargedImagePosition: 'beside' AND inPlace: false
    // - Use zoomContainerWidth/Height for magnifier size
    
    // IMPORTANT: For overlay magnification:
    // - Set inPlace: true (this overrides enlargedImagePosition)
    // - Use width/height for magnifier size
    // OR
    // - Set enlargedImagePosition: 'over' AND inPlace: false
    // - Use zoomContainerWidth/Height for magnifier size
    
    // Zoom settings
    zoom: number,                              // Default: 3
    zoomFactor: number,                        // Default: 4 (for move mode)
    zoomLensScale: number,                     // Default: 3
    
    // Container dimensions
    width: number,                             // Default: 300 (used when inPlace: true)
    height: number,                            // Default: 300 (used when inPlace: true)
    zoomContainerWidth: number,                // Default: 500 (used for side-by-side)
    zoomContainerHeight: number,               // Default: 500 (used for side-by-side)
    
    // Positioning
    distance: number,                          // Default: 10 (space between image and magnifier)
    offsetX: number,                           // Default: 0
    offsetY: number,                           // Default: 0
}
```

#### Visual Styling

```javascript
{
    // Border and visual effects
    borderColor: string,                       // Default: '#0066cc'
    borderWidth: number,                       // Default: 2
    borderRadius: number,                      // Default: 8
    boxShadow: string,                         // Default: '0 10px 30px rgba(0, 0, 0, 0.3)'
    
    // Lens styling
    shouldUsePositiveSpaceLens: boolean,       // Default: false
    lensStyle: object,                         // Custom lens CSS styles
    
    // CSS classes
    className: string,                         // Container class
    imageClassName: string,                    // Main image class
    enlargedImageContainerClassName: string,   // Magnifier container class
    enlargedImageClassName: string,            // Magnified image class
    
    // CSS styles
    style: object,                             // Container styles
    imageStyle: object,                        // Main image styles
    enlargedImageContainerStyle: object,       // Magnifier container styles
    enlargedImageStyle: object                 // Magnified image styles
}
```

#### Interaction & Timing

```javascript
{
    // Hover timing
    fadeDurationInMs: number,                  // Default: 150
    hoverDelayInMs: number,                    // Default: 100
    hoverOffDelayInMs: number,                 // Default: 150
    delayTimer: number,                        // Default: 300
    
    // Touch settings
    isActivatedOnTouch: boolean,               // Default: false
    pressDuration: number,                     // Default: 500
    pressMoveThreshold: number,                // Default: 5
    disableScrollLock: boolean,                // Default: true (keeps page scrolling enabled)
}
```

#### Portal Rendering

```javascript
{
    enlargedImagePortalId: string,             // Portal container ID
    isEnlargedImagePortalEnabledForTouch: boolean // Default: false
}
```

#### Hint System

```javascript
{
    isHintEnabled: boolean,                    // Default: false
    hintTextMouse: string,                     // Default: 'Hover to Zoom'
    hintTextTouch: string,                     // Default: 'Long-Touch to Zoom'
    shouldHideHintAfterFirstActivation: boolean // Default: true
}
```

#### Loading Indicators

```javascript
{
    showLoadingIndicator: boolean,             // Default: true
    loadingIndicatorText: string,              // Default: 'Loading...'
}
```

#### Event Callbacks

```javascript
{
    onLoad: function,                          // Image load callback
    onError: function,                         // Image error callback
    onZoomStart: function,                     // Zoom activation callback
    onZoomEnd: function                        // Zoom deactivation callback
}
```

## 🎯 Usage Examples

### 🔧 Understanding Magnifier Positioning Modes

There are **three ways** to position the magnified image:

1. **Side-by-Side** (like Amazon/Flipkart):
   - Set `enlargedImagePosition: 'beside'` AND `inPlace: false`
   - Uses `zoomContainerWidth` and `zoomContainerHeight` for magnifier size
   - Magnifier appears next to the original image

2. **In-Place Overlay** (magnifier over the image):
   - Set `inPlace: true` (overrides `enlargedImagePosition`)
   - Uses `width` and `height` for magnifier size
   - Magnifier appears over the original image, following cursor

3. **Alternative Overlay**:
   - Set `enlargedImagePosition: 'over'` AND `inPlace: false`
   - Uses `zoomContainerWidth` and `zoomContainerHeight` for magnifier size
   - Similar to in-place but with different sizing options

---

### 1. E-commerce Product Zoom (Amazon Style) - Side-by-Side

```javascript
const productMagnifier = new EnhancedImageMagnifier('#product-image', {
    largeImage: {
        src: 'product-large.jpg',
        width: 1200,
        height: 1200
    },
    mode: 'hover',
    enlargedImagePosition: 'beside',  // THIS is key for side-by-side
    inPlace: false,                   // THIS must be false for side-by-side
    zoomContainerWidth: 500,
    zoomContainerHeight: 500,
    zoom: 3,
    distance: 20,
    borderColor: '#e47911',
    borderWidth: 2,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    hoverDelayInMs: 200,
    fadeDurationInMs: 250
});
```

### 2. In-Place Overlay Magnifier

```javascript
const overlayMagnifier = new EnhancedImageMagnifier('#gallery-image', {
    largeImage: {
        src: 'gallery-large.jpg',
        width: 2000,
        height: 1500
    },
    mode: 'hover',
    inPlace: true,                    // THIS enables in-place/overlay mode
    width: 300,                       // Use 'width' and 'height' for in-place
    height: 300,
    zoom: 4,
    borderRadius: 150, // Circular magnifier
    shouldUsePositiveSpaceLens: true,
    lensStyle: {
        border: '3px solid white',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }
});
```

### 3. Alternative Overlay (using enlargedImagePosition)

```javascript
const overlayMagnifier2 = new EnhancedImageMagnifier('#gallery-image-2', {
    largeImage: {
        src: 'gallery-large.jpg',
        width: 2000,
        height: 1500
    },
    mode: 'hover',
    enlargedImagePosition: 'over',    // Alternative way to enable overlay
    inPlace: false,                   // Can be false when using 'over'
    zoomContainerWidth: 400,         // Use container dimensions for 'over' mode
    zoomContainerHeight: 400,
    zoom: 4,
    borderRadius: 200 // Circular magnifier
});
```

### 3. Touch-Enabled Mobile Magnifier

```javascript
const mobileMagnifier = new EnhancedImageMagnifier('#mobile-image', {
    largeImage: {
        src: 'mobile-large.jpg',
        width: 1500,
        height: 1500
    },
    mode: 'move',
    isActivatedOnTouch: true,
    pressDuration: 300,
    pressMoveThreshold: 10,
    disableScrollLock: true,
    zoomFactor: 3,
    borderColor: '#007AFF',
    isHintEnabled: true,
    hintTextTouch: 'Touch and drag to zoom'
});
```

### 4. Portal Rendering (External Container)

```html
<div id="image-container">
    <img id="main-image" src="image.jpg" alt="Main Image">
</div>
<div id="zoom-portal" style="position: fixed; top: 20px; right: 20px;"></div>
```

```javascript
const portalMagnifier = new EnhancedImageMagnifier('#main-image', {
    largeImage: {
        src: 'image-large.jpg',
        width: 1800,
        height: 1200
    },
    enlargedImagePortalId: 'zoom-portal',
    zoomContainerWidth: 400,
    zoomContainerHeight: 300,
    zoom: 2.5
});
```

### 5. Advanced Configuration with All Features

```javascript
const advancedMagnifier = new EnhancedImageMagnifier('#advanced-image', {
    // Image configuration
    smallImage: {
        isFluidWidth: true,
        alt: 'Product thumbnail'
    },
    largeImage: {
        src: 'product-4k.jpg',
        width: 3840,
        height: 2160,
        alt: 'Product high resolution'
    },
    
    // Behavior
    mode: 'hover',
    enlargedImagePosition: 'beside',
    zoom: 4,
    zoomLensScale: 2,
    
    // Dimensions
    zoomContainerWidth: 600,
    zoomContainerHeight: 400,
    distance: 30,
    
    // Styling
    borderColor: '#2196F3',
    borderWidth: 3,
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
    shouldUsePositiveSpaceLens: true,
    
    // Timing
    hoverDelayInMs: 300,
    hoverOffDelayInMs: 100,
    fadeDurationInMs: 400,
    
    // Touch
    pressDuration: 600,
    pressMoveThreshold: 8,
    
    // Hints
    isHintEnabled: true,
    hintTextMouse: '🔍 Hover to magnify',
    hintTextTouch: '👆 Long press to zoom',
    
    // CSS classes
    className: 'magnifier-container',
    enlargedImageContainerClassName: 'zoom-window',
    
    // Callbacks
    onZoomStart: () => console.log('Zoom started'),
    onZoomEnd: () => console.log('Zoom ended'),
    onLoad: () => console.log('Image loaded'),
    onError: () => console.error('Image load failed')
});
```

## 🔧 API Methods

### Instance Methods

```javascript
// Update options
magnifier.updateOptions({
    zoom: 5,
    borderColor: '#ff0000'
});

// Get current state
const state = magnifier.getState();
console.log(state.isActive, state.isLoaded);

// Check status
if (magnifier.isActive()) {
    console.log('Magnifier is currently active');
}

if (magnifier.isLoaded()) {
    console.log('Image has loaded successfully');
}

if (magnifier.hasError()) {
    console.log('There was an error loading the image');
}

// Destroy instance
magnifier.destroy();
```

### Static Methods

```javascript
// Clean up all magnifier instances
EnhancedImageMagnifier.cleanup();
```

## 🎨 CSS Customization

The magnifier generates several CSS classes that you can customize:

```css
/* Main magnifier window */
.enhanced-magnifier-window {
    /* Your custom styles */
}

/* Magnified image */
.enhanced-magnifier-image {
    /* Your custom styles */
}

/* Lens element (hover mode) */
.enhanced-magnifier-lens {
    /* Your custom styles */
}

/* Hint element */
.enhanced-magnifier-hint {
    /* Your custom styles */
}

/* Loading indicator */
.enhanced-magnifier-loading {
    /* Your custom styles */
}

/* Loading spinner animation */
.loading-spinner {
    /* Customize the spinner */
}
```

## 📱 Responsive Design

For responsive images, use the `isFluidWidth` option:

```javascript
const responsiveMagnifier = new EnhancedImageMagnifier('#responsive-image', {
    smallImage: {
        isFluidWidth: true
    },
    largeImage: {
        src: 'large-image.jpg',
        width: 2000,
        height: 1500
    },
    // Container dimensions will adapt to image size
    enlargedImageContainerDimensions: {
        width: '150%',  // Percentage-based sizing
        height: '150%'
    }
});
```

## 🔄 Migration from React Image Magnifier Waft

If you're migrating from the React package, here's the mapping:

| React Prop | Vanilla JS Option | Notes |
|------------|-------------------|-------|
| `smallImage` | `smallImage` | Same structure |
| `largeImage` | `largeImage` | Same structure |
| `enlargedImagePosition` | `enlargedImagePosition` | Same values |
| `enlargedImageContainerDimensions` | `enlargedImageContainerDimensions` | Same structure |
| `fadeDurationInMs` | `fadeDurationInMs` | Same |
| `hoverDelayInMs` | `hoverDelayInMs` | Same |
| `isActivatedOnTouch` | `isActivatedOnTouch` | Same |
| `shouldUsePositiveSpaceLens` | `shouldUsePositiveSpaceLens` | Same |

## 🐛 Troubleshooting

### Common Issues

1. **Magnifier not appearing**
   - Check that `largeImage.src` is valid
   - Ensure container has `position: relative`
   - Verify image CORS settings

2. **Touch not working on mobile**
   - Set `isActivatedOnTouch: true`
   - Adjust `pressDuration` and `pressMoveThreshold`
   - Check for conflicting touch event handlers

3. **Performance issues**
   - Increase `hoverDelayInMs` to reduce sensitivity
   - Use appropriately sized images
   - Enable `disableScrollLock` if needed

4. **Portal rendering not working**
   - Ensure portal element exists in DOM
   - Check element ID matches `enlargedImagePortalId`
   - Verify portal container has proper positioning

## 🎯 Best Practices

1. **Image Optimization**
   - Use WebP format when possible
   - Provide appropriate image dimensions
   - Consider lazy loading for large images

2. **Performance**
   - Set reasonable hover delays
   - Clean up instances when removing from DOM
   - Use portal rendering for complex layouts

3. **Accessibility**
   - Always provide alt text
   - Test with keyboard navigation
   - Consider users with motion sensitivity

4. **Mobile Experience**
   - Test touch interactions thoroughly
   - Provide clear visual feedback
   - Consider different screen sizes

## 📄 License

MIT License - feel free to use in commercial and personal projects.

## 🤝 Contributing

This implementation is inspired by the excellent `easy-magnify-waft` React package. Contributions and improvements are welcome!

## 📚 Related Projects

- [easy-magnify-waft](https://www.npmjs.com/package/easy-magnify-waft) - Original React implementation
- [react-image-magnify](https://www.npmjs.com/package/react-image-magnify) - Original React package

---

**Created with ❤️ for the web development community**
