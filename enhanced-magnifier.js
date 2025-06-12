/**
 * Enhanced Image Magnifier - Vanilla JavaScript
 * Complete feature-rich magnifier inspired by React Image Magnifier Waft
 * 
 * Features:
 * - Side-by-side and in-place magnification
 * - Zoom on hover and zoom on move modes
 * - Positive and negative space lens options
 * - Configurable dimensions and styling
 * - Fade transitions and hover delays
 * - Touch support with long-press gesture
 * - Portal rendering support
 * - Responsive design
 * - Loading indicators
 * - E-commerce ready (Amazon/Flipkart style)
 * 
 * @author Inspired by React Image Magnifier Waft (easy-magnify-waft)
 * @version 2.0.0
 * @license MIT
 */

class EnhancedImageMagnifier {
	constructor(selector, options = {}) {
		this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
		if (!this.element) {
			console.error('EnhancedImageMagnifier: Element not found');
			return;
		}

		// Comprehensive default options matching react-image-magnify features
		this.options = {
			// Image sources
			smallImage: {
				src: this.element.src || options.smallImage?.src,
				alt: this.element.alt || options.smallImage?.alt || '',
				width: options.smallImage?.width,
				height: options.smallImage?.height,
				isFluidWidth: options.smallImage?.isFluidWidth || false,
				...options.smallImage
			},
			largeImage: {
				src: options.largeImage?.src || this.element.src,
				alt: options.largeImage?.alt || this.element.alt || '',
				width: options.largeImage?.width || 1200,
				height: options.largeImage?.height || 1800,
				...options.largeImage
			},

			// Magnification behavior
			enlargedImagePosition: options.enlargedImagePosition || 'beside', // 'beside' or 'over'
			enlargedImageContainerDimensions: options.enlargedImageContainerDimensions || { width: '100%', height: '100%' },

			// Zoom settings
			zoom: options.zoom || 3,
			zoomFactor: options.zoomFactor || 4, // For zoom-on-move mode

			// Container dimensions
			width: options.width || 300,
			height: options.height || 300,
			zoomContainerWidth: options.zoomContainerWidth || 500,
			zoomContainerHeight: options.zoomContainerHeight || 500,

			// Positioning
			distance: options.distance || 10, // Distance between main and zoom image
			offsetX: options.offsetX || 0,
			offsetY: options.offsetY || 0,

			// Visual styling - completely borderless
			borderColor: options.borderColor || 'transparent',             // No border color
			borderWidth: options.borderWidth || 0,                         // No border
			borderRadius: options.borderRadius || 0,                       // No border radius
			boxShadow: options.boxShadow || 'none',                        // No shadow

			// Lens settings
			shouldUsePositiveSpaceLens: options.shouldUsePositiveSpaceLens || false,
			lensStyle: options.lensStyle || {},
			zoomLensScale: options.zoomLensScale || 3,

			// Interaction timing
			fadeDurationInMs: options.fadeDurationInMs || 150,  // Default fade-in transition
			hoverDelayInMs: options.hoverDelayInMs || 100,      // Reduced from 250ms for quicker activation
			hoverOffDelayInMs: options.hoverOffDelayInMs || 150,
			delayTimer: options.delayTimer || 300,              // Reduced from 1600ms for faster loading

			// Touch settings
			isActivatedOnTouch: options.isActivatedOnTouch || false,
			pressDuration: options.pressDuration || 500,
			pressMoveThreshold: options.pressMoveThreshold || 5,
			disableScrollLock: options.disableScrollLock || true, // Default to true (don't disable scroll)

			// Mode selection
			mode: options.mode || 'hover', // 'hover' or 'move'
			inPlace: options.inPlace !== undefined ? options.inPlace : false,

			// Portal rendering
			enlargedImagePortalId: options.enlargedImagePortalId,
			isEnlargedImagePortalEnabledForTouch: options.isEnlargedImagePortalEnabledForTouch || false,

			// Hint system
			isHintEnabled: options.isHintEnabled || false,
			hintTextMouse: options.hintTextMouse || 'Hover to Zoom',
			hintTextTouch: options.hintTextTouch || 'Long-Touch to Zoom',
			shouldHideHintAfterFirstActivation: options.shouldHideHintAfterFirstActivation || true,

			// Loading
			showLoadingIndicator: options.showLoadingIndicator !== undefined ? options.showLoadingIndicator : true,
			loadingIndicatorText: options.loadingIndicatorText || 'Loading...',

			// CSS classes
			className: options.className || '',
			imageClassName: options.imageClassName || '',
			enlargedImageContainerClassName: options.enlargedImageContainerClassName || '',
			enlargedImageClassName: options.enlargedImageClassName || '',

			// CSS styles
			style: options.style || {},
			imageStyle: options.imageStyle || {},
			enlargedImageContainerStyle: options.enlargedImageContainerStyle || {},
			enlargedImageStyle: options.enlargedImageStyle || {},

			// Callbacks
			onLoad: options.onLoad,
			onError: options.onError,
			onZoomStart: options.onZoomStart,
			onZoomEnd: options.onZoomEnd,

			...options
		};

		// State management
		this.state = {
			isActive: false,
			isLoading: false,
			isLoaded: false,
			hasError: false,
			hintShown: false,
			touchStartTime: 0,
			touchStartPos: { x: 0, y: 0 },
			isTouch: false
		};

		// DOM references
		this.elements = {
			container: null,
			magnifierWindow: null,
			magnifiedImg: null,
			lens: null,
			hint: null,
			loadingIndicator: null,
			portal: null
		};

		// Event handling
		this.boundMethods = {};
		this.timers = {};
		this.controller = new AbortController();

		this.init();
	}

	/**
	 * Initialize the magnifier
	 */
	init() {
		console.log('EnhancedImageMagnifier: Initializing with comprehensive features...');

		// Ensure parent has relative positioning
		this.setupParentContainer();

		// Create all necessary DOM elements
		this.createMagnifierElements();

		// Set up event listeners
		this.bindEvents();

		// Initialize hint if enabled
		if (this.options.isHintEnabled) {
			this.createHintElement();
		}

		// Apply custom styles
		this.applyCustomStyles();

		// Handle portal rendering
		this.setupPortalRendering();

		console.log('EnhancedImageMagnifier: Initialization complete');
	}

	/**
	 * Set up parent container with proper positioning
	 */
	setupParentContainer() {
		const parent = this.element.parentElement;
		const parentStyle = getComputedStyle(parent);
		if (parentStyle.position === 'static') {
			parent.style.position = 'relative';
		}

		// Add container class if specified
		if (this.options.className) {
			parent.classList.add(this.options.className);
		}

		// Apply container styles
		Object.assign(parent.style, this.options.style);
	}

	/**
	 * Create all magnifier DOM elements
	 */
	createMagnifierElements() {
		// Create the main container for the magnifier
		this.elements.container = this.element.parentElement;

		// Create loading indicator
		if (this.options.showLoadingIndicator) {
			this.createLoadingIndicator();
		}

		// Create magnified view window
		this.createMagnifierWindow();

		// Create lens element for hover mode
		if (this.options.mode === 'hover') {
			this.createLensElement();
		}

		// Set initial image dimensions
		this.updateMagnifiedImageSize();
	}

	/**
	 * Create loading indicator element
	 */
	createLoadingIndicator() {
		this.elements.loadingIndicator = document.createElement('div');
		this.elements.loadingIndicator.className = 'enhanced-magnifier-loading';
		this.elements.loadingIndicator.innerHTML = `
			<div class="loading-spinner"></div>
			<div class="loading-text">${this.options.loadingIndicatorText}</div>
		`;

		this.elements.loadingIndicator.style.cssText = `
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(255, 255, 255, 0.9);
			padding: 20px;
			border-radius: ${this.options.borderRadius}px;
			box-shadow: ${this.options.boxShadow};
			z-index: 1001;
			display: none;
			text-align: center;
			font-family: Arial, sans-serif;
			color: #333;
		`;

		// Add CSS for spinner animation
		const style = document.createElement('style');
		style.textContent = `
			.loading-spinner {
				width: 20px;
				height: 20px;
				border: 2px solid #f3f3f3;
				border-top: 2px solid ${this.options.borderColor};
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin: 0 auto 10px;
			}
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`;
		document.head.appendChild(style);

		this.elements.container.appendChild(this.elements.loadingIndicator);
	}

	/**
	 * Create the main magnifier window
	 */
	createMagnifierWindow() {
		this.elements.magnifierWindow = document.createElement('div');
		this.elements.magnifierWindow.className = `enhanced-magnifier-window ${this.options.enlargedImageContainerClassName}`;

		const windowWidth = this.options.inPlace ? this.options.width : this.options.zoomContainerWidth;
		const windowHeight = this.options.inPlace ? this.options.height : this.options.zoomContainerHeight;

		this.elements.magnifierWindow.style.cssText = `
			position: absolute;
			width: ${windowWidth}px;
			height: ${windowHeight}px;
			border: ${this.options.borderWidth}px solid ${this.options.borderColor};
			border-radius: ${this.options.borderRadius}px;
			background: #ffffff;
			box-shadow: ${this.options.boxShadow};
			pointer-events: none;
			z-index: 1000;
			display: none;
			overflow: hidden;
			opacity: 0;
		`;

		// Apply custom container styles
		Object.assign(this.elements.magnifierWindow.style, this.options.enlargedImageContainerStyle);

		// Ensure transition is applied after custom styles to prevent override
		this.elements.magnifierWindow.style.transition = `opacity ${this.options.fadeDurationInMs}ms ease`;

		// Create the magnified image
		this.createMagnifiedImage();

		// Determine where to append based on portal settings
		const targetContainer = this.getTargetContainer();
		targetContainer.appendChild(this.elements.magnifierWindow);
	}

	/**
	 * Create the magnified image element
	 */
	createMagnifiedImage() {
		this.elements.magnifiedImg = document.createElement('img');
		this.elements.magnifiedImg.className = `enhanced-magnifier-image ${this.options.enlargedImageClassName}`;
		this.elements.magnifiedImg.src = this.options.largeImage.src;
		this.elements.magnifiedImg.alt = this.options.largeImage.alt;

		this.elements.magnifiedImg.style.cssText = `
			position: absolute;
			pointer-events: none;
			user-select: none;
			transform-origin: 0 0;
			max-width: none;
			transition: transform 0.05s ease;
		`;

		// Apply custom image styles
		Object.assign(this.elements.magnifiedImg.style, this.options.enlargedImageStyle);

		// Handle image loading
		this.elements.magnifiedImg.addEventListener('load', () => {
			this.state.isLoaded = true;
			this.state.isLoading = false;
			this.hideLoadingIndicator();
			if (this.options.onLoad) {
				this.options.onLoad();
			}
		});

		this.elements.magnifiedImg.addEventListener('error', () => {
			this.state.hasError = true;
			this.state.isLoading = false;
			this.hideLoadingIndicator();
			if (this.options.onError) {
				this.options.onError();
			}
		});

		this.elements.magnifierWindow.appendChild(this.elements.magnifiedImg);
	}

	/**
	 * Create lens element for hover mode
	 */
	createLensElement() {
		this.elements.lens = document.createElement('div');
		this.elements.lens.className = 'enhanced-magnifier-lens';

		// Determine lens style based on positive/negative space setting
		const lensBackgroundStyle = this.options.shouldUsePositiveSpaceLens
			? `background: rgba(255, 255, 255, 0.3); border: 2px solid ${this.options.borderColor};`
			: `background: url(data:image/gif;base64,R0lGODlhZABkAPABAHOf4fj48yH5BAEAAAEALAAAAABkAGQAAAL+jI+py+0PowOB2oqvznz7Dn5iSI7SiabqWrbj68bwTLL2jUv0Lvf8X8sJhzmg0Yc8mojM5kmZjEKPzqp1MZVqs7Cr98rdisOXr7lJHquz57YwDV8j3XRb/C7v1vcovD8PwicY8VcISDGY2GDIKKf4mNAoKQZZeXg5aQk5yRml+dgZ2vOpKGraQpp4uhqYKsgKi+H6ils7Cxr4QdpbO+dqq+Y7ELzMZGzoSqtJOlgKCWrJkOra6gra+noZa1lL6otpOVnLGvxJaRo8Spqqqfp8OzzMfEccXJy8fP0svSz5u+3dfQ1eDR6OLW79ve2eTi5unk5+rq5+zr7Ozs7fDu8fLy9PPz9/j4+f39/wAAIfkEAQAAAQAsAAAAAGQAZAAAAgKMj6nL7Q+jA4HaigAAAACbBwAAOw==) 50% 50% repeat; cursor: pointer;`;

		this.elements.lens.style.cssText = `
			position: absolute;
			display: none;
			${lensBackgroundStyle}
			border-radius: 50%;
			pointer-events: none;
			z-index: 999;
			opacity: 0.7;
		`;

		// Apply custom lens styles
		Object.assign(this.elements.lens.style, this.options.lensStyle);

		this.elements.container.appendChild(this.elements.lens);
	}

	/**
	 * Create hint element
	 */
	createHintElement() {
		this.elements.hint = document.createElement('div');
		this.elements.hint.className = 'enhanced-magnifier-hint';

		const hintText = 'ontouchstart' in window ? this.options.hintTextTouch : this.options.hintTextMouse;
		this.elements.hint.textContent = hintText;

		this.elements.hint.style.cssText = `
			position: absolute;
			bottom: 10px;
			left: 50%;
			transform: translateX(-50%);
			background: rgba(0, 0, 0, 0.8);
			color: white;
			padding: 8px 12px;
			border-radius: 4px;
			font-size: 12px;
			font-family: Arial, sans-serif;
			z-index: 1002;
			pointer-events: none;
			transition: opacity ${this.options.fadeDurationInMs}ms ease;
		`;

		this.elements.container.appendChild(this.elements.hint);
	}

	/**
	 * Get target container for magnifier window (handles portal rendering)
	 */
	getTargetContainer() {
		if (this.options.enlargedImagePortalId) {
			const portal = document.getElementById(this.options.enlargedImagePortalId);
			if (portal) {
				this.elements.portal = portal;
				return portal;
			}
		}
		return this.elements.container;
	}

	/**
	 * Set up portal rendering if specified
	 */
	setupPortalRendering() {
		if (this.options.enlargedImagePortalId && this.elements.portal) {
			// Apply portal-specific styles
			this.elements.portal.style.position = 'relative';

			// Handle touch portal enabling
			if (!this.options.isEnlargedImagePortalEnabledForTouch && 'ontouchstart' in window) {
				// Move magnifier back to main container for touch devices
				this.elements.container.appendChild(this.elements.magnifierWindow);
			}
		}
	}

	/**
	 * Apply custom styles to elements
	 */
	applyCustomStyles() {
		// Apply image styles to main image
		if (this.options.imageClassName) {
			this.element.classList.add(this.options.imageClassName);
		}
		Object.assign(this.element.style, this.options.imageStyle);
	}

	/**
	 * Bind all event listeners
	 */
	bindEvents() {
		const signal = this.controller.signal;

		// Bind methods to preserve 'this' context
		this.boundMethods.onPointerEnter = (e) => this.onPointerEnter(e);
		this.boundMethods.onPointerMove = (e) => this.onPointerMove(e);
		this.boundMethods.onPointerLeave = (e) => this.onPointerLeave(e);
		this.boundMethods.onTouchStart = (e) => this.onTouchStart(e);
		this.boundMethods.onTouchMove = (e) => this.onTouchMove(e);
		this.boundMethods.onTouchEnd = (e) => this.onTouchEnd(e);
		this.boundMethods.onImageLoad = () => this.updateMagnifiedImageSize();
		this.boundMethods.onScroll = () => this.onScroll();
		this.boundMethods.onResize = () => this.onResize();

		// Enhanced mouse/pointer events - simple direct binding
		this.element.addEventListener('pointerenter', this.boundMethods.onPointerEnter, { signal });
		this.element.addEventListener('pointermove', this.boundMethods.onPointerMove, { signal });
		this.element.addEventListener('pointerleave', this.boundMethods.onPointerLeave, { signal });

		// Also add mousemove for better compatibility
		this.element.addEventListener('mouseenter', this.boundMethods.onPointerEnter, { signal });
		this.element.addEventListener('mousemove', this.boundMethods.onPointerMove, { signal });
		this.element.addEventListener('mouseleave', this.boundMethods.onPointerLeave, { signal });

		// Touch events for better mobile support - simple direct binding
		if (this.options.isActivatedOnTouch || this.options.pressDuration > 0) {
			this.element.addEventListener('touchstart', this.boundMethods.onTouchStart, { signal });
			this.element.addEventListener('touchmove', this.boundMethods.onTouchMove, { signal });
			this.element.addEventListener('touchend', this.boundMethods.onTouchEnd, { signal });
		}

		// Handle main image load
		if (this.element.complete && this.element.naturalWidth > 0) {
			this.updateMagnifiedImageSize();
		} else {
			this.element.addEventListener('load', this.boundMethods.onImageLoad, { signal });
		}

		// Window events
		window.addEventListener('scroll', this.boundMethods.onScroll, { signal });
		window.addEventListener('resize', this.boundMethods.onResize, { signal });
	}

	/**
	 * Handle pointer enter event
	 */
	onPointerEnter(e) {
		if (this.state.isTouch) return; // Skip if touch interaction is active

		// Clear any existing timers
		this.clearTimers();

		// Activate immediately with no delay for responsive magnification
		this.activateMagnifier(e);
	}

	/**
	 * Handle pointer move event
	 */
	onPointerMove(e) {
		if (this.state.isTouch) return;

		if (this.state.isActive) {
			this.updateMagnifier(e);
		}
	}

	/**
	 * Handle pointer leave event
	 */
	onPointerLeave(e) {
		if (this.state.isTouch) return;

		this.clearTimers();

		// Start hover-off delay timer
		this.timers.hoverOffDelay = setTimeout(() => {
			this.deactivateMagnifier();
		}, this.options.hoverOffDelayInMs);
	}

	/**
	 * Handle touch start event
	 */
	onTouchStart(e) {
		this.state.isTouch = true;
		this.state.touchStartTime = Date.now();
		this.state.touchStartPos = {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY
		};

		if (this.options.isActivatedOnTouch) {
			this.activateMagnifier(e.touches[0]);
		} else if (this.options.pressDuration > 0) {
			// Start long-press timer
			this.timers.longPress = setTimeout(() => {
				this.activateMagnifier(e.touches[0]);
			}, this.options.pressDuration);
		}

		// Prevent default to avoid scrolling issues
		if (!this.options.disableScrollLock) {
			e.preventDefault();
		}
	}

	/**
	 * Handle touch move event
	 */
	onTouchMove(e) {
		if (!this.state.isTouch) return;

		const currentPos = {
			x: e.touches[0].clientX,
			y: e.touches[0].clientY
		};

		const distance = Math.sqrt(
			Math.pow(currentPos.x - this.state.touchStartPos.x, 2) +
			Math.pow(currentPos.y - this.state.touchStartPos.y, 2)
		);

		// Cancel long-press if movement exceeds threshold
		if (distance > this.options.pressMoveThreshold && this.timers.longPress) {
			clearTimeout(this.timers.longPress);
			this.timers.longPress = null;
		}

		if (this.state.isActive) {
			this.updateMagnifier(e.touches[0]);
		}

		if (!this.options.disableScrollLock) {
			e.preventDefault();
		}
	}

	/**
	 * Handle touch end event
	 */
	onTouchEnd(e) {
		this.clearTimers();

		// Reset touch state after a delay to prevent mouse events
		setTimeout(() => {
			this.state.isTouch = false;
		}, 300);

		if (this.state.isActive) {
			this.deactivateMagnifier();
		}
	}

	/**
	 * Activate the magnifier
	 */
	activateMagnifier(e) {
		if (this.state.isActive) return;

		this.state.isActive = true;

		// Only show loading indicator if image isn't loaded yet
		if (!this.state.isLoaded) {
			this.showLoadingIndicator();
		}

		// Hide hint after first activation
		if (this.options.shouldHideHintAfterFirstActivation && !this.state.hintShown) {
			this.hideHint();
			this.state.hintShown = true;
		}

		// Show magnifier window with fade-in
		this.elements.magnifierWindow.style.display = 'block';

		// Force browser to process the display change before starting transition
		requestAnimationFrame(() => {
			this.elements.magnifierWindow.style.opacity = '1';
		});

		// Show lens for hover mode
		if (this.options.mode === 'hover' && this.elements.lens) {
			this.elements.lens.style.display = 'block';
		}

		// Disable scroll if option is set
		// Note: disableScrollLock=true means "disable the scroll lock feature" (keep scrolling enabled)
		// disableScrollLock=false means "enable the scroll lock feature" (disable scrolling during magnification)
		if (!this.options.disableScrollLock) {
			this.disableScroll();
		}

		// Position magnifier window for inPlace mode (only once during activation)
		if (this.options.inPlace || this.options.enlargedImagePosition === 'over') {
			this.positionMagnifierWindow(e);
		}

		// Update magnifier position
		this.updateMagnifier(e);

		// Trigger callback
		if (this.options.onZoomStart) {
			this.options.onZoomStart();
		}

		console.log('EnhancedImageMagnifier: Activated');
	}

	/**
	 * Deactivate the magnifier
	 */
	deactivateMagnifier() {
		if (!this.state.isActive) return;

		this.state.isActive = false;

		// Hide magnifier window with fade-out
		this.elements.magnifierWindow.style.opacity = '0';

		setTimeout(() => {
			if (!this.state.isActive) {
				this.elements.magnifierWindow.style.display = 'none';
			}
		}, this.options.fadeDurationInMs);

		// Hide lens
		if (this.elements.lens) {
			this.elements.lens.style.display = 'none';
		}

		// Hide loading indicator
		this.hideLoadingIndicator();

		// Re-enable scroll (only if we disabled it)
		if (!this.options.disableScrollLock) {
			this.enableScroll();
		}

		// Trigger callback
		if (this.options.onZoomEnd) {
			this.options.onZoomEnd();
		}

		console.log('EnhancedImageMagnifier: Deactivated');
	}

	/**
	 * Update magnifier position and zoom
	 */
	updateMagnifier(e) {
		if (!this.state.isActive) return;

		// For inPlace mode, only position the window once (during activation)
		// For side-by-side mode, update window position on mouse move
		if (!this.options.inPlace && this.options.enlargedImagePosition !== 'over') {
			this.positionMagnifierWindow(e);
		}

		this.updateMagnifiedImagePosition(e);

		if (this.options.mode === 'hover' && this.elements.lens) {
			this.updateLensPosition(e);
		}
	}

	/**
	 * Position the magnifier window
	 */
	positionMagnifierWindow(e) {
		const imageRect = this.element.getBoundingClientRect();
		const containerRect = this.elements.container.getBoundingClientRect();

		// Calculate position relative to container
		const relativeImageX = imageRect.left - containerRect.left;
		const relativeImageY = imageRect.top - containerRect.top;

		if (this.options.inPlace || this.options.enlargedImagePosition === 'over') {
			// In-place/overlay mode: position magnifier exactly over the image
			// The magnifier window should be fixed over the original image, not follow cursor

			// Use appropriate dimensions based on mode
			const windowWidth = this.options.inPlace ? this.options.width : this.options.zoomContainerWidth;
			const windowHeight = this.options.inPlace ? this.options.height : this.options.zoomContainerHeight;

			// Position magnifier window exactly over the original image (centered)
			const left = relativeImageX + (imageRect.width - windowWidth) / 2 + this.options.offsetX;
			const top = relativeImageY + (imageRect.height - windowHeight) / 2 + this.options.offsetY;

			this.elements.magnifierWindow.style.left = left + 'px';
			this.elements.magnifierWindow.style.top = top + 'px';
		} else {
			// Side-by-side mode: position beside the image
			const left = relativeImageX + imageRect.width + this.options.distance + this.options.offsetX;
			const top = relativeImageY + this.options.offsetY;

			this.elements.magnifierWindow.style.left = left + 'px';
			this.elements.magnifierWindow.style.top = top + 'px';
		}
	}

	/**
	 * Get the actual image content bounds (accounting for object-fit)
	 */
	getActualImageBounds() {
		const rect = this.element.getBoundingClientRect();
		const style = getComputedStyle(this.element);

		// Account for padding and borders
		const paddingLeft = parseFloat(style.paddingLeft) || 0;
		const paddingTop = parseFloat(style.paddingTop) || 0;
		const paddingRight = parseFloat(style.paddingRight) || 0;
		const paddingBottom = parseFloat(style.paddingBottom) || 0;
		const borderLeft = parseFloat(style.borderLeftWidth) || 0;
		const borderTop = parseFloat(style.borderTopWidth) || 0;
		const borderRight = parseFloat(style.borderRightWidth) || 0;
		const borderBottom = parseFloat(style.borderBottomWidth) || 0;

		// Calculate content area (excluding padding and borders)
		const contentLeft = rect.left + paddingLeft + borderLeft;
		const contentTop = rect.top + paddingTop + borderTop;
		const contentWidth = rect.width - paddingLeft - paddingRight - borderLeft - borderRight;
		const contentHeight = rect.height - paddingTop - paddingBottom - borderTop - borderBottom;

		if (this.options.debug) {
			console.log('getActualImageBounds:', {
				element: this.element,
				rect,
				padding: { left: paddingLeft, top: paddingTop, right: paddingRight, bottom: paddingBottom },
				border: { left: borderLeft, top: borderTop, right: borderRight, bottom: borderBottom },
				contentArea: { left: contentLeft, top: contentTop, width: contentWidth, height: contentHeight }
			});
		}

		// Handle object-fit scenarios
		const objectFit = style.objectFit;

		if (this.element.naturalWidth && this.element.naturalHeight && objectFit === 'contain') {
			const imageRatio = this.element.naturalWidth / this.element.naturalHeight;
			const contentRatio = contentWidth / contentHeight;

			if (imageRatio > contentRatio) {
				// Image is wider - width constrained
				const imageWidth = contentWidth;
				const imageHeight = contentWidth / imageRatio;
				const imageLeft = contentLeft;
				const imageTop = contentTop + (contentHeight - imageHeight) / 2;

				const bounds = {
					left: imageLeft,
					top: imageTop,
					width: imageWidth,
					height: imageHeight,
					right: imageLeft + imageWidth,
					bottom: imageTop + imageHeight
				};

				if (this.options.debug) {
					console.log('object-fit: contain (wider)', bounds);
				}

				return bounds;
			} else {
				// Image is taller - height constrained
				const imageHeight = contentHeight;
				const imageWidth = contentHeight * imageRatio;
				const imageTop = contentTop;
				const imageLeft = contentLeft + (contentWidth - imageWidth) / 2;

				const bounds = {
					left: imageLeft,
					top: imageTop,
					width: imageWidth,
					height: imageHeight,
					right: imageLeft + imageWidth,
					bottom: imageTop + imageHeight
				};

				if (this.options.debug) {
					console.log('object-fit: contain (taller)', bounds);
				}

				return bounds;
			}
		}

		// For all other cases (cover, fill, none, etc.), use content area
		const bounds = {
			left: contentLeft,
			top: contentTop,
			width: contentWidth,
			height: contentHeight,
			right: contentLeft + contentWidth,
			bottom: contentTop + contentHeight
		};

		if (this.options.debug) {
			console.log('Using content area bounds:', bounds);
		}

		return bounds;
	}

	/**
	 * Update magnified image position based on cursor/touch position
	 */
	updateMagnifiedImagePosition(e) {
		// Use the element's direct bounds - simple and reliable
		const imageRect = this.element.getBoundingClientRect();
		const mouseX = e.clientX - imageRect.left;
		const mouseY = e.clientY - imageRect.top;

		if (this.options.mode === 'move') {
			// Zoom-on-move mode: transform the image
			const containerRect = this.elements.magnifierWindow.getBoundingClientRect();
			const zoomPointX = mouseX;
			const zoomPointY = mouseY;

			const currentPositionX = this.calculatePositionX(-zoomPointX * this.options.zoomFactor + zoomPointX);
			const currentPositionY = this.calculatePositionY(-zoomPointY * this.options.zoomFactor + zoomPointY);

			this.elements.magnifiedImg.style.transform = `translate(${currentPositionX}px, ${currentPositionY}px) scale(${this.options.zoomFactor})`;
		} else {
			// Zoom-on-hover mode: position the scaled image with perfect 1:1 ratio

			// Ensure mouse position is within bounds (clamp to image boundaries)
			const clampedMouseX = Math.max(0, Math.min(imageRect.width, mouseX));
			const clampedMouseY = Math.max(0, Math.min(imageRect.height, mouseY));

			const xPercent = clampedMouseX / imageRect.width;
			const yPercent = clampedMouseY / imageRect.height;

			const magnifiedImageWidth = imageRect.width * this.options.zoom;
			const magnifiedImageHeight = imageRect.height * this.options.zoom;

			const windowWidth = this.options.inPlace ? this.options.width : this.options.zoomContainerWidth;
			const windowHeight = this.options.inPlace ? this.options.height : this.options.zoomContainerHeight;

			// Calculate the range of movement for the magnified image
			const maxMoveX = magnifiedImageWidth - windowWidth;
			const maxMoveY = magnifiedImageHeight - windowHeight;

			// Position magnified image directly based on mouse percentage
			// 0% = show left/top edge, 100% = show right/bottom edge
			const left = -xPercent * maxMoveX;
			const top = -yPercent * maxMoveY;

			this.elements.magnifiedImg.style.left = left + 'px';
			this.elements.magnifiedImg.style.top = top + 'px';
		}
	}

	/**
	 * Update lens position for hover mode
	 */
	updateLensPosition(e) {
		if (!this.elements.lens) return;

		const imageRect = this.element.getBoundingClientRect();
		const containerRect = this.elements.container.getBoundingClientRect();

		const mouseX = e.clientX - imageRect.left;
		const mouseY = e.clientY - imageRect.top;

		const relativeImageX = imageRect.left - containerRect.left;
		const relativeImageY = imageRect.top - containerRect.top;

		// Calculate lens size based on zoom level
		const windowWidth = this.options.inPlace ? this.options.width : this.options.zoomContainerWidth;
		const windowHeight = this.options.inPlace ? this.options.height : this.options.zoomContainerHeight;

		const lensWidth = (windowWidth / this.options.zoom) * this.options.zoomLensScale;
		const lensHeight = (windowHeight / this.options.zoom) * this.options.zoomLensScale;

		this.elements.lens.style.width = lensWidth + 'px';
		this.elements.lens.style.height = lensHeight + 'px';

		// Position lens centered on cursor, constrained to image bounds
		const lensLeft = Math.max(0, Math.min(imageRect.width - lensWidth, mouseX - lensWidth / 2));
		const lensTop = Math.max(0, Math.min(imageRect.height - lensHeight, mouseY - lensHeight / 2));

		this.elements.lens.style.left = (relativeImageX + lensLeft) + 'px';
		this.elements.lens.style.top = (relativeImageY + lensTop) + 'px';
	}

	/**
	 * Calculate X position for zoom-on-move mode
	 */
	calculatePositionX(newPositionX) {
		const width = this.element.clientWidth;
		if (newPositionX > 0) return 0;
		if (newPositionX + width * this.options.zoomFactor < width) return -width * (this.options.zoomFactor - 1);
		return newPositionX;
	}

	/**
	 * Calculate Y position for zoom-on-move mode
	 */
	calculatePositionY(newPositionY) {
		const height = this.element.clientHeight;
		if (newPositionY > 0) return 0;
		if (newPositionY + height * this.options.zoomFactor < height) return -height * (this.options.zoomFactor - 1);
		return newPositionY;
	}

	/**
	 * Update magnified image size
	 */
	updateMagnifiedImageSize() {
		const imageRect = this.element.getBoundingClientRect();

		if (this.options.mode === 'move') {
			// For zoom-on-move, we use transform scale
			this.elements.magnifiedImg.style.width = imageRect.width + 'px';
			this.elements.magnifiedImg.style.height = imageRect.height + 'px';
		} else {
			// For zoom-on-hover, we scale the image dimensions
			this.elements.magnifiedImg.style.width = (imageRect.width * this.options.zoom) + 'px';
			this.elements.magnifiedImg.style.height = (imageRect.height * this.options.zoom) + 'px';
		}
	}

	/**
	 * Show loading indicator
	 */
	showLoadingIndicator() {
		if (this.elements.loadingIndicator && this.options.showLoadingIndicator) {
			this.state.isLoading = true;
			this.elements.loadingIndicator.style.display = 'block';

			// Auto-hide after delay timer
			setTimeout(() => {
				this.hideLoadingIndicator();
			}, this.options.delayTimer);
		}
	}

	/**
	 * Hide loading indicator
	 */
	hideLoadingIndicator() {
		if (this.elements.loadingIndicator) {
			this.state.isLoading = false;
			this.elements.loadingIndicator.style.display = 'none';
		}
	}

	/**
	 * Hide hint element
	 */
	hideHint() {
		if (this.elements.hint) {
			this.elements.hint.style.opacity = '0';
			setTimeout(() => {
				if (this.elements.hint) {
					this.elements.hint.style.display = 'none';
				}
			}, this.options.fadeDurationInMs);
		}
	}

	/**
	 * Handle scroll events
	 */
	onScroll() {
		if (this.state.isActive) {
			// Update positions on scroll
			this.updateMagnifier({
				clientX: this.lastMousePos?.x || 0,
				clientY: this.lastMousePos?.y || 0
			});
		}
	}

	/**
	 * Handle resize events
	 */
	onResize() {
		this.updateMagnifiedImageSize();
		if (this.state.isActive) {
			this.updateMagnifier({
				clientX: this.lastMousePos?.x || 0,
				clientY: this.lastMousePos?.y || 0
			});
		}
	}

	/**
	 * Clear all timers
	 */
	clearTimers() {
		Object.values(this.timers).forEach(timer => {
			if (timer) clearTimeout(timer);
		});
		this.timers = {};
	}

	/**
	 * Disable page scrolling
	 */
	disableScroll() {
		document.body.style.overflow = 'hidden';
		document.body.style.touchAction = 'none';
	}

	/**
	 * Enable page scrolling
	 */
	enableScroll() {
		document.body.style.overflow = '';
		document.body.style.touchAction = '';
	}

	/**
	 * Update magnifier options
	 */
	updateOptions(newOptions) {
		this.options = { ...this.options, ...newOptions };

		// Update relevant styles
		if (this.elements.magnifierWindow) {
			const windowWidth = this.options.inPlace ? this.options.width : this.options.zoomContainerWidth;
			const windowHeight = this.options.inPlace ? this.options.height : this.options.zoomContainerHeight;

			this.elements.magnifierWindow.style.width = windowWidth + 'px';
			this.elements.magnifierWindow.style.height = windowHeight + 'px';
			this.elements.magnifierWindow.style.borderColor = this.options.borderColor;
			this.elements.magnifierWindow.style.borderWidth = this.options.borderWidth + 'px';
			this.elements.magnifierWindow.style.borderRadius = this.options.borderRadius + 'px';
			this.elements.magnifierWindow.style.boxShadow = this.options.boxShadow;
		}

		// Update large image source
		if (newOptions.largeImage?.src && this.elements.magnifiedImg) {
			this.elements.magnifiedImg.src = this.options.largeImage.src;
		}

		// Update magnified image size
		this.updateMagnifiedImageSize();
	}

	/**
	 * Destroy the magnifier instance
	 */
	destroy() {
		console.log('EnhancedImageMagnifier: Destroying instance...');

		// Clear all timers
		this.clearTimers();

		// Abort all event listeners
		this.controller.abort();

		// Remove DOM elements
		if (this.elements.magnifierWindow && this.elements.magnifierWindow.parentElement) {
			this.elements.magnifierWindow.parentElement.removeChild(this.elements.magnifierWindow);
		}

		if (this.elements.lens && this.elements.lens.parentElement) {
			this.elements.lens.parentElement.removeChild(this.elements.lens);
		}

		if (this.elements.hint && this.elements.hint.parentElement) {
			this.elements.hint.parentElement.removeChild(this.elements.hint);
		}

		if (this.elements.loadingIndicator && this.elements.loadingIndicator.parentElement) {
			this.elements.loadingIndicator.parentElement.removeChild(this.elements.loadingIndicator);
		}

		// Re-enable scrolling
		this.enableScroll();

		// Clear references
		this.element = null;
		this.elements = {};
		this.boundMethods = {};
		this.options = null;
		this.state = null;

		console.log('EnhancedImageMagnifier: Instance destroyed');
	}

	/**
	 * Static cleanup method to remove all magnifier instances
	 */
	static cleanup() {
		const existingMagnifiers = document.querySelectorAll('.enhanced-magnifier-window, .enhanced-magnifier-lens, .enhanced-magnifier-hint, .enhanced-magnifier-loading');
		existingMagnifiers.forEach(element => {
			if (element.parentElement) {
				element.parentElement.removeChild(element);
			}
		});

		// Re-enable scrolling
		document.body.style.overflow = '';
		document.body.style.touchAction = '';

		console.log('EnhancedImageMagnifier: Global cleanup completed');
	}

	/**
	 * Get current magnifier state
	 */
	getState() {
		return { ...this.state };
	}

	/**
	 * Check if magnifier is currently active
	 */
	isActive() {
		return this.state.isActive;
	}

	/**
	 * Check if image is loaded
	 */
	isLoaded() {
		return this.state.isLoaded;
	}

	/**
	 * Check if there was an error loading
	 */
	hasError() {
		return this.state.hasError;
	}

	/**
	 * Check if a pointer event is within the actual image content bounds
	 * Simplified and reliable approach
	 */
	isWithinImageBounds(e) {
		const imageRect = this.getActualImageBounds();

		const withinBounds = e.clientX >= imageRect.left &&
			e.clientX <= imageRect.right &&
			e.clientY >= imageRect.top &&
			e.clientY <= imageRect.bottom;

		if (this.options.debug) {
			console.log('isWithinImageBounds check:', {
				mousePos: { x: e.clientX, y: e.clientY },
				imageBounds: imageRect,
				withinBounds
			});
		}

		return withinBounds;
	}
}

// Make it globally available
window.EnhancedImageMagnifier = EnhancedImageMagnifier;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
	module.exports = EnhancedImageMagnifier;
}
