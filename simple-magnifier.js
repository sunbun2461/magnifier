/**
 * Simple Image Magnifier - Lightweight and focused
 * Designed specifically for gallery integration
 * 
 * Features:
 * - Universal aspect ratio support
 * - Hover-based magnification
 * - Smooth transitions
 * - Gallery integration
 * - Touch support
 * 
 * @version 1.0.0
 * @license MIT
 */

class SimpleMagnifier {
	constructor(imageElement, options = {}) {
		this.image = imageElement;
		this.options = {
			largeImageSrc: options.largeImageSrc || imageElement.src,
			zoom: options.zoom || 2,
			fadeDuration: options.fadeDuration || 300,
			hoverDelay: options.hoverDelay || 0,
			...options
		};

		this.isActive = false;
		this.magnifierContainer = null;
		this.magnifiedImage = null;
		this.hoverTimeout = null;

		this.init();
	}

	init() {
		// Create magnifier container
		this.createMagnifierContainer();

		// Bind events
		this.bindEvents();

		// Preload large image
		this.preloadLargeImage();
	}

	createMagnifierContainer() {
		this.magnifierContainer = document.createElement('div');
		this.magnifierContainer.className = 'simple-magnifier-container';
		this.magnifierContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            opacity: 0;
            transition: opacity ${this.options.fadeDuration}ms ease;
            border-radius: inherit;
        `;

		this.magnifiedImage = document.createElement('img');
		this.magnifiedImage.src = this.options.largeImageSrc;
		this.magnifiedImage.style.cssText = `
            position: absolute;
            transform-origin: top left;
            max-width: none;
            max-height: none;
            object-fit: contain;
        `;

		this.magnifierContainer.appendChild(this.magnifiedImage);

		// Ensure parent is positioned relatively
		const parent = this.image.parentElement;
		if (getComputedStyle(parent).position === 'static') {
			parent.style.position = 'relative';
		}

		parent.appendChild(this.magnifierContainer);
	}

	bindEvents() {
		this.image.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
		this.image.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
		this.image.addEventListener('mousemove', this.handleMouseMove.bind(this));

		// Touch support
		this.image.addEventListener('touchstart', this.handleTouchStart.bind(this));
		this.image.addEventListener('touchend', this.handleTouchEnd.bind(this));
		this.image.addEventListener('touchmove', this.handleTouchMove.bind(this));
	}

	handleMouseEnter() {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
		}

		this.hoverTimeout = setTimeout(() => {
			this.activate();
		}, this.options.hoverDelay);
	}

	handleMouseLeave() {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
		}
		this.deactivate();
	}

	handleMouseMove(e) {
		if (!this.isActive) return;
		this.updateMagnification(e);
	}

	handleTouchStart(e) {
		if (e.touches.length === 1) {
			this.activate();
			this.updateMagnification(e.touches[0]);
		}
	}

	handleTouchEnd() {
		this.deactivate();
	}

	handleTouchMove(e) {
		if (!this.isActive || e.touches.length !== 1) return;
		e.preventDefault();
		this.updateMagnification(e.touches[0]);
	}

	activate() {
		this.isActive = true;
		this.magnifierContainer.style.opacity = '1';
		this.calculateZoom();
	}

	deactivate() {
		this.isActive = false;
		this.magnifierContainer.style.opacity = '0';
	}

	calculateZoom() {
		// Universal zoom calculation based on aspect ratio
		const rect = this.image.getBoundingClientRect();
		const aspectRatio = rect.width / rect.height;
		const aspectRatioDeviation = Math.abs(aspectRatio - 1);
		const baseZoom = this.options.zoom;

		// Adjust zoom based on aspect ratio for optimal experience
		this.calculatedZoom = Math.max(1.2, baseZoom - (aspectRatioDeviation * 0.4));

		// Set magnified image size
		this.magnifiedImage.style.width = `${rect.width * this.calculatedZoom}px`;
		this.magnifiedImage.style.height = `${rect.height * this.calculatedZoom}px`;
	}

	updateMagnification(event) {
		const rect = this.image.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Calculate the position for the magnified image
		const xPercent = x / rect.width;
		const yPercent = y / rect.height;

		const moveX = -(xPercent * rect.width * (this.calculatedZoom - 1));
		const moveY = -(yPercent * rect.height * (this.calculatedZoom - 1));

		this.magnifiedImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
	}

	preloadLargeImage() {
		// Preload the large image for smooth experience
		const preloader = new Image();
		preloader.src = this.options.largeImageSrc;
	}

	updateImage(newSrc, newLargeSrc) {
		this.options.largeImageSrc = newLargeSrc || newSrc;
		this.magnifiedImage.src = this.options.largeImageSrc;
		this.preloadLargeImage();
	}

	destroy() {
		// Clean up event listeners
		this.image.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
		this.image.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
		this.image.removeEventListener('mousemove', this.handleMouseMove.bind(this));
		this.image.removeEventListener('touchstart', this.handleTouchStart.bind(this));
		this.image.removeEventListener('touchend', this.handleTouchEnd.bind(this));
		this.image.removeEventListener('touchmove', this.handleTouchMove.bind(this));

		// Remove DOM elements
		if (this.magnifierContainer && this.magnifierContainer.parentElement) {
			this.magnifierContainer.parentElement.removeChild(this.magnifierContainer);
		}

		// Clear timeouts
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
		}
	}
}

// Global cleanup function for easy access
SimpleMagnifier.cleanup = function () {
	// Find and remove any existing magnifier containers
	const containers = document.querySelectorAll('.simple-magnifier-container');
	containers.forEach(container => {
		if (container.parentElement) {
			container.parentElement.removeChild(container);
		}
	});
};

// Export for use
window.SimpleMagnifier = SimpleMagnifier;
