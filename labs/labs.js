
  class CleanGrid {
    constructor() {
      this.isPopupOpen = false;
      this.scrollPosition = 0;
      this.animatedCard = null;
      this.animatedVisual = null;
      this.originalVisual = null;
      this.isClosing = false;
      this.currentCardIndex = 0;
      this.isTransitioning = false;
      this.init();
    }
    
    init() {
      this.setup();
    }
    
    setup() {
      this.grid = document.querySelector('.lab-card_grid');
      this.cards = document.querySelectorAll('.lab-card_wrap');
      this.container = this.grid?.parentElement || document.body;
      if (!this.grid || !this.cards.length) return;
      
      this.setupMouseMovement();
      this.setupHoverEffects();
      this.setupInitialAnimation();
      this.setupClickHandlers();
    }
    
    setupMouseMovement() {
      document.addEventListener('mousemove', (e) => {
        if (this.isPopupOpen || window.innerWidth < 922) return;
        const windowWidth = window.innerWidth;
        const normalizedX = (e.clientX / windowWidth) * 2 - 1;
        const translateX = normalizedX * -200;
        gsap.to(this.grid, {
          x: translateX,
          duration: 1.2,
          ease: "power2.out"
        });
      });
      
      document.addEventListener('mouseleave', () => {
        if (this.isPopupOpen || window.innerWidth < 922) return;
        gsap.to(this.grid, { x: 0, duration: 1.5, ease: "power2.out" });
      });
    }
    
    setupHoverEffects() {
      this.cards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          if (this.isPopupOpen) return;
          gsap.set(card, { opacity: 1 });
          gsap.to(card, { scale: 1.05, duration: 0.4, ease: "power2.out" });
          this.cards.forEach((otherCard) => {
            if (otherCard !== card) {
              gsap.to(otherCard, { opacity: 0.5, duration: 0.3, ease: "power2.out" });
            }
          });
        });
        
        card.addEventListener('mouseleave', () => {
          if (this.isPopupOpen) return;
          gsap.to(card, { scale: 1, duration: 0.4, ease: "power2.out" });
        });
      });
      
      this.container.addEventListener('mouseleave', () => {
        if (this.isPopupOpen) return;
        gsap.to(this.cards, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
      });
    }
    
    setupInitialAnimation() {
      gsap.set(this.cards, { y: 30, opacity: 0, scale: 0.95 });
      gsap.to(this.cards, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
        stagger: { amount: 0.6, from: "start" }
      });
    }
    
    setupClickHandlers() {
      this.popup = document.querySelector('.lab-card_popup_wrap');
      if (!this.popup) return;
      
      this.setupCloseHandlers();
      
      this.cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
          if (this.isPopupOpen || this.isClosing) return;
          e.preventDefault();
          e.stopPropagation();
          
          this.currentCardIndex = index;
          this.isPopupOpen = true;
          this.animatedCard = card;
          
          // Animate visual from grid position to center
          this.animateVisualToCenter(card, () => {
            this.showPopup();
          });
        });
      });
    }
    
    setupCloseHandlers() {
      this.popup.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.lab-card_popup_close-wrap, [data-btn="lab-close-btn"]');
        if (closeBtn && !this.isClosing) {
          e.preventDefault();
          e.stopPropagation();
          this.hidePopup();
          return;
        }
        
        if (e.target === this.popup && !this.isClosing) {
          this.hidePopup();
        }
      });
      
      document.addEventListener('keydown', (e) => {
        if (!this.isPopupOpen) return;
        
        if (e.key === 'Escape' && !this.isClosing) {
          this.hidePopup();
        } else if (e.key === 'ArrowDown' && !this.isTransitioning && !this.isClosing) {
          e.preventDefault();
          this.navigateToCard(this.currentCardIndex + 1);
        } else if (e.key === 'ArrowUp' && !this.isTransitioning && !this.isClosing) {
          e.preventDefault();
          this.navigateToCard(this.currentCardIndex - 1);
        }
      });
    }
    
    disableScrollAndSetupNavigation() {
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
      
      let scrollTimeout;
      let accumulatedDelta = 0;
      const SCROLL_THRESHOLD = 50;
      
      this.wheelHandler = (e) => {
        // Block navigation during transitions and close animations
        if (!this.isPopupOpen || this.isTransitioning || this.isClosing) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        accumulatedDelta += e.deltaY;
        
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        scrollTimeout = setTimeout(() => {
          accumulatedDelta = 0;
        }, 100);
        
        if (Math.abs(accumulatedDelta) >= SCROLL_THRESHOLD && !this.isTransitioning && !this.isClosing) {
          if (accumulatedDelta > 0) {
            this.navigateToCard(this.currentCardIndex + 1);
          } else {
            this.navigateToCard(this.currentCardIndex - 1);
          }
          accumulatedDelta = 0;
        }
        
        return false;
      };
      
      document.addEventListener('wheel', this.wheelHandler, { passive: false });
    }
    
    // Navigate between cards when popup is already open (scroll/arrows)
    navigateToCard(newIndex) {
      if (newIndex < 0 || newIndex >= this.cards.length || this.isTransitioning) return;
      
      this.isTransitioning = true;
      const newCard = this.cards[newIndex];
      const direction = newIndex > this.currentCardIndex ? 1 : -1;
      
      const popupContent = this.popup.querySelector('.lab-card_popup_content');
      if (popupContent) {
        gsap.to(popupContent, {
          opacity: 0,
          y: direction * -30,
          duration: 0.3,
          ease: "power2.in"
        });
      }
      
      // Fade out current visual (stays in center, no grid animation)
      if (this.animatedVisual) {
        gsap.to(this.animatedVisual, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            this.unmountEmbed();
            if (this.animatedVisual) {
              this.animatedVisual.remove();
              this.animatedVisual = null;
            }
            if (this.originalVisual) {
              this.originalVisual.style.opacity = '';
              this.originalVisual = null;
            }

            this.currentCardIndex = newIndex;
            this.animatedCard = newCard;
            
            // Create new visual directly in center (no grid animation)
            this.createVisualInCenter(newCard, () => {
              const cardPopupContent = newCard.querySelector('.lab-card_popup_wrap .lab-card_popup_content');
              if (cardPopupContent && popupContent) {
                popupContent.innerHTML = cardPopupContent.innerHTML;
              }
              
              gsap.set(popupContent, {
                opacity: 0,
                y: direction * 30
              });
              
              gsap.to(popupContent, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
                onComplete: () => {
                  this.isTransitioning = false;
                }
              });
            });
          }
        });
      }
    }
    
    // Create visual directly in center for navigation (no grid animation)
    createVisualInCenter(card, callback) {
      const cardVisual = card.querySelector('.lab-card_visual_wrap');
      if (!cardVisual) {
        if (callback) callback();
        return;
      }

      const embedSrc = this.getEmbedSrc(card);
      if (embedSrc) {
        this.createEmbedInStage(card, cardVisual, embedSrc, callback);
        return;
      }
      delete this.popup.dataset.labLayout;

      // Capture video state before cloning
      const originalVideo = cardVisual.querySelector('video');
      let videoCurrentTime = 0;
      let videoWasPlaying = false;
      
      if (originalVideo) {
        videoCurrentTime = originalVideo.currentTime;
        videoWasPlaying = !originalVideo.paused;
      }
      
      const visualClone = cardVisual.cloneNode(true);
      visualClone.classList.add('animated-visual-clone');
      
      const originalRect = cardVisual.getBoundingClientRect();
      
      let scale;
      if (window.innerWidth >= 1024) {
        scale = 3;
      } else if (window.innerWidth >= 768) {
        scale = 2;
      } else {
        scale = 1.5;
      }
      
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      
      // Position directly in center
      visualClone.style.position = 'fixed';
      visualClone.style.left = `${viewportCenterX}px`;
      visualClone.style.top = `${viewportCenterY}px`;
      visualClone.style.width = `${originalRect.width}px`;
      visualClone.style.height = `${originalRect.height}px`;
      visualClone.style.transform = `translate(-50%, -50%) scale(${scale})`;
      visualClone.style.zIndex = '10000000000000000000000000';
      visualClone.style.pointerEvents = 'none';
      visualClone.style.opacity = '0';
      
      document.body.appendChild(visualClone);
      cardVisual.style.opacity = '0';
      
      // Sync video time and playback state
      const clonedVideo = visualClone.querySelector('video');
      if (clonedVideo && originalVideo) {
        clonedVideo.currentTime = videoCurrentTime;
        if (videoWasPlaying) {
          setTimeout(() => {
            clonedVideo.play().catch(() => {});
          }, 50);
        }
      }
      
      this.animatedVisual = visualClone;
      this.originalVisual = cardVisual;
      
      // Fade in
      gsap.to(visualClone, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          if (callback) callback();
        }
      });
      
      // Update popup layout
      const popupLayout = this.popup.querySelector('.lab-card_popup_layout');
      if (popupLayout) {
        const cardPopupLayout = card.querySelector('.lab-card_popup_wrap .lab-card_popup_layout');
        if (cardPopupLayout) {
          popupLayout.innerHTML = cardPopupLayout.innerHTML;
        }
      }
    }
    
    // Live lab: card has data-lab-embed with the URL of a standalone HTML page
    getEmbedSrc(card) {
      const el = card.matches('[data-lab-embed]') ? card : card.querySelector('[data-lab-embed]');
      const src = el?.getAttribute('data-lab-embed')?.trim();
      return src || null;
    }

    // Stage is the popup visual marked data-lab-stage, sized by CSS
    getStageRect() {
      const stage = this.popup.querySelector('[data-lab-stage]');
      if (stage) {
        const rect = stage.getBoundingClientRect();
        if (rect.width && rect.height) return rect;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDesktop = vw >= 768;
      const width = isDesktop ? Math.min(vw * 0.8, vh * 0.7 * (16 / 9)) : vw * 0.92;
      const height = isDesktop ? width * (9 / 16) : vh * 0.6;
      return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
    }

    createEmbedClone(card, cardVisual) {
      const visualClone = cardVisual.cloneNode(true);
      visualClone.classList.add('animated-visual-clone', 'is-embed');
      visualClone.style.position = 'fixed';
      visualClone.style.zIndex = '2147483647';
      visualClone.style.pointerEvents = 'none';
      visualClone.style.overflow = 'hidden';
      document.body.appendChild(visualClone);
      cardVisual.style.opacity = '0';
      this.animatedVisual = visualClone;
      this.originalVisual = cardVisual;
      return visualClone;
    }

    mountEmbed(visualClone, src) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('allow', 'autoplay; fullscreen; accelerometer; gyroscope');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;opacity:0;';
      iframe.addEventListener('load', () => {
        gsap.to(iframe, { opacity: 1, duration: 0.4, ease: "power2.out" });
        // Embeds never own scroll: wheel + arrows inside the iframe drive popup next/prev like outside it
        try {
          const frameWindow = iframe.contentWindow;
          frameWindow.addEventListener('wheel', (e) => this.wheelHandler?.(e), { passive: false });
          frameWindow.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isClosing) {
              this.hidePopup();
            } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.isTransitioning && !this.isClosing) {
              e.preventDefault();
              this.navigateToCard(this.currentCardIndex + (e.key === 'ArrowDown' ? 1 : -1));
            }
          });
        } catch (error) {}
      });
      visualClone.appendChild(iframe);
      visualClone.style.pointerEvents = 'auto';
      this.embedFrame = iframe;

      // jsDelivr serves .html as text/plain, so fetch it and render via srcdoc
      fetch(src)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.text();
        })
        .then((html) => {
          if (this.embedFrame !== iframe) return;
          const base = `<base href="${new URL(src, location.href).href}">`;
          iframe.srcdoc = /<head[^>]*>/i.test(html)
            ? html.replace(/<head[^>]*>/i, (head) => head + base)
            : base + html;
        })
        .catch(() => {
          if (this.embedFrame === iframe) iframe.src = src;
        });
    }

    unmountEmbed() {
      if (!this.embedFrame) return;
      this.embedFrame.remove();
      this.embedFrame = null;
      if (this.animatedVisual) this.animatedVisual.style.pointerEvents = 'none';
    }

    animateEmbedToStage(card, cardVisual, src, callback) {
      const originalRect = cardVisual.getBoundingClientRect();
      const visualClone = this.createEmbedClone(card, cardVisual);
      visualClone.style.left = `${originalRect.left}px`;
      visualClone.style.top = `${originalRect.top}px`;
      visualClone.style.width = `${originalRect.width}px`;
      visualClone.style.height = `${originalRect.height}px`;

      this.placePopup();
      const stage = this.getStageRect();

      gsap.to(visualClone, {
        left: stage.left,
        top: stage.top,
        width: stage.width,
        height: stage.height,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          this.mountEmbed(visualClone, src);
          if (callback) callback();
        }
      });

      // Fade out other cards (no scale change)
      this.cards.forEach((otherCard) => {
        if (otherCard !== card) {
          gsap.to(otherCard, { opacity: 0.3, duration: 0.6, ease: "power2.out" });
        }
      });
    }

    createEmbedInStage(card, cardVisual, src, callback) {
      const popupLayout = this.popup.querySelector('.lab-card_popup_layout');
      const cardPopupLayout = card.querySelector('.lab-card_popup_wrap .lab-card_popup_layout');
      if (popupLayout && cardPopupLayout) {
        popupLayout.innerHTML = cardPopupLayout.innerHTML;
      }
      this.popup.dataset.labLayout = 'embed';

      const visualClone = this.createEmbedClone(card, cardVisual);
      const stage = this.getStageRect();
      visualClone.style.left = `${stage.left}px`;
      visualClone.style.top = `${stage.top}px`;
      visualClone.style.width = `${stage.width}px`;
      visualClone.style.height = `${stage.height}px`;
      visualClone.style.opacity = '0';

      gsap.to(visualClone, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          this.mountEmbed(visualClone, src);
          if (callback) callback();
        }
      });
    }

// Animate visual from grid position to center on initial open
    animateVisualToCenter(card, callback) {
      const cardVisual = card.querySelector('.lab-card_visual_wrap');
      if (!cardVisual) return;

      const embedSrc = this.getEmbedSrc(card);
      if (embedSrc) {
        this.animateEmbedToStage(card, cardVisual, embedSrc, callback);
        return;
      }

      // Capture video state before cloning
      const originalVideo = cardVisual.querySelector('video');
      let videoCurrentTime = 0;
      let videoWasPlaying = false;
      
      if (originalVideo) {
        videoCurrentTime = originalVideo.currentTime;
        videoWasPlaying = !originalVideo.paused;
      }
      
      const visualClone = cardVisual.cloneNode(true);
      visualClone.classList.add('animated-visual-clone');
      
      const originalRect = cardVisual.getBoundingClientRect();
      
      // Start at original grid position
      visualClone.style.position = 'fixed';
      visualClone.style.left = `${originalRect.left}px`;
      visualClone.style.top = `${originalRect.top}px`;
      visualClone.style.width = `${originalRect.width}px`;
      visualClone.style.height = `${originalRect.height}px`;
      visualClone.style.zIndex = '10000000000000000000000000';
      visualClone.style.pointerEvents = 'none';
      visualClone.style.opacity = '1';
      
      document.body.appendChild(visualClone);
      
      const clonedVideo = visualClone.querySelector('video');
      if (clonedVideo && originalVideo) {
        clonedVideo.currentTime = videoCurrentTime;
        
        // Wait for video to start playing before hiding original (prevents flicker)
        const startAnimation = () => {
          cardVisual.style.opacity = '0';
          
          this.animatedVisual = visualClone;
          this.originalVisual = cardVisual;
          
          let scale;
          if (window.innerWidth >= 1024) {
            scale = 3;
          } else if (window.innerWidth >= 768) {
            scale = 2;
          } else {
            scale = 1.5;
          }
          
          const viewportCenterX = window.innerWidth / 2;
          const viewportCenterY = window.innerHeight / 2;
          
          // Animate to center
          gsap.to(visualClone, {
            left: `${viewportCenterX}px`,
            top: `${viewportCenterY}px`,
            xPercent: -50,
            yPercent: -50,
            scale: scale,
            duration: 0.8,
            ease: "power3.out",
            onComplete: () => {
              if (callback) callback();
            }
          });
          
          // Fade out other cards (no scale change)
          this.cards.forEach((otherCard) => {
            if (otherCard !== card) {
              gsap.to(otherCard, {
                opacity: 0.3,
                duration: 0.6,
                ease: "power2.out"
              });
            }
          });
        };
        
        if (videoWasPlaying) {
          clonedVideo.play().then(() => {
            startAnimation();
          }).catch(() => {
            startAnimation();
          });
        } else {
          startAnimation();
        }
      } else {
        // For images
        cardVisual.style.opacity = '0';
        
        this.animatedVisual = visualClone;
        this.originalVisual = cardVisual;
        
        let scale;
        if (window.innerWidth >= 1024) {
          scale = 3;
        } else if (window.innerWidth >= 768) {
          scale = 2;
        } else {
          scale = 1.5;
        }
        
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        gsap.to(visualClone, {
          left: `${viewportCenterX}px`,
          top: `${viewportCenterY}px`,
          xPercent: -50,
          yPercent: -50,
          scale: scale,
          duration: 0.8,
          ease: "power3.out",
          onComplete: () => {
            if (callback) callback();
          }
        });
        
        // Fade out other cards (no scale change)
        this.cards.forEach((otherCard) => {
          if (otherCard !== card) {
            gsap.to(otherCard, {
              opacity: 0.3,
              duration: 0.6,
              ease: "power2.out"
            });
          }
        });
      }
    }
    
    animateVisualBack(callback) {
      if (!this.animatedVisual || !this.originalVisual) {
        if (callback) callback();
        return;
      }
      
      const originalRect = this.originalVisual.getBoundingClientRect();
      
      gsap.to(this.animatedVisual, {
        left: `${originalRect.left}px`,
        top: `${originalRect.top}px`,
        width: `${originalRect.width}px`,
        height: `${originalRect.height}px`,
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          if (this.originalVisual) {
            this.originalVisual.style.opacity = '';
          }
          if (this.animatedVisual) {
            this.animatedVisual.remove();
            this.animatedVisual = null;
          }
          this.originalVisual = null;
          if (callback) callback();
        }
      });
      
      gsap.to(this.cards, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    }
    
    enableScroll() {
      if (this.wheelHandler) {
        document.removeEventListener('wheel', this.wheelHandler);
      }
      
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      window.scrollTo(0, this.scrollPosition);
    }
    
    showPopup() {
      this.disableScrollAndSetupNavigation();
      
      const nav = document.querySelector('.nav_wrap');
      if (nav) {
        nav.style.pointerEvents = 'none';
        nav.style.opacity = '0';
      }

      this.placePopup();

      const popupContent = this.popup.querySelector('.lab-card_popup_content');
      if (popupContent) {
        gsap.set(popupContent, { y: 40, opacity: 0 });
      }

      const interactiveElements = this.popup.querySelectorAll('button, a, [class*="btn"], [class*="link"], [class*="close"]');
      interactiveElements.forEach((element) => {
        element.style.position = 'relative';
        element.style.zIndex = '200';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.pointerEvents = 'auto';
      });

      gsap.to(this.popup, { opacity: 1, duration: 0.3, ease: "power2.out" });

      if (popupContent) {
        gsap.to(popupContent, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out"
        });
      }
    }

    // Popup shell + layout; embed cards call it before tweening so the stage can be measured
    placePopup() {
      if (this.animatedCard && this.getEmbedSrc(this.animatedCard)) {
        this.popup.dataset.labLayout = 'embed';
      } else {
        delete this.popup.dataset.labLayout;
      }

      if (this.popup.parentElement !== document.body) {
        document.body.appendChild(this.popup);
      }
      
      this.popup.style.position = 'fixed';
      this.popup.style.top = '0';
      this.popup.style.left = '0';
      this.popup.style.width = '100vw';
      this.popup.style.height = '100vh';
      this.popup.style.zIndex = '100';
      this.popup.style.transform = 'none';
      this.popup.style.margin = '0';
      this.popup.style.padding = '0';
      this.popup.style.opacity = '0';
      this.popup.style.visibility = 'visible';
      this.popup.style.display = 'flex';
      this.popup.style.alignItems = 'center';
      this.popup.style.justifyContent = 'center';
      this.popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      
      const popupLayout = this.popup.querySelector('.lab-card_popup_layout');
      if (popupLayout && this.animatedCard) {
        const cardPopupLayout = this.animatedCard.querySelector('.lab-card_popup_wrap .lab-card_popup_layout');
        if (cardPopupLayout) {
          popupLayout.innerHTML = cardPopupLayout.innerHTML;
        }
      }
    }

    hidePopup() {
      if (this.isClosing) return;
      this.isClosing = true;

      this.unmountEmbed();

      const popupContent = this.popup.querySelector('.lab-card_popup_content');
      if (popupContent) {
        gsap.to(popupContent, {
          y: 40,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in"
        });
      }
      
      gsap.to(this.popup, {
        opacity: 0,
        duration: 0.3,
        delay: 0.3,
        ease: "power2.in",
        onComplete: () => {
          this.animateVisualBack(() => {
            this.completeCloseSequence();
          });
        }
      });
    }
    
    completeCloseSequence() {
      // Cleanup any lingering clones
      const lingering = document.querySelectorAll('.animated-visual-clone');
      lingering.forEach(clone => clone.remove());
      
      this.isPopupOpen = false;
      this.isClosing = false;
      
      if (this.animatedCard) {
        this.animatedCard = null;
      }
      
      const nav = document.querySelector('.nav_wrap');
      if (nav) {
        nav.style.pointerEvents = '';
        nav.style.opacity = '';
      }
      
      this.enableScroll();
      
      setTimeout(() => {
        this.popup.style.display = 'none';
        this.popup.style.visibility = 'hidden';
      }, 10);
    }
  }
  
  function initCleanGrid() {
    if (window.cleanGrid) {
      window.cleanGrid = null;
    }
    setTimeout(() => {
      try {
        if (!window.cleanGrid) {
          window.cleanGrid = new CleanGrid();
        }
      } catch (error) {
        console.error('Error creating CleanGrid:', error);
      }
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCleanGrid);
  } else {
    initCleanGrid();
  }
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!window.cleanGrid) {
        initCleanGrid();
      }
    }, 500);
  });
  
  setTimeout(() => {
    if (!window.cleanGrid) {
      initCleanGrid();
    }
  }, 2000);
