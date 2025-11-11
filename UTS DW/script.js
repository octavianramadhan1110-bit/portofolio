document.addEventListener("DOMContentLoaded", () => {
  /* ------------------ Mobile menu ------------------ */
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (menuBtn && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    };

    menuBtn.addEventListener("click", () => {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("active")) return;
      const target = e.target;
      if (!navLinks.contains(target) && target !== menuBtn) {
        closeMenu();
      }
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Reset on resize to desktop
    const resizeHandler = () => {
      if (window.innerWidth > 768) closeMenu();
    };
    window.addEventListener("resize", resizeHandler);
  }

  /* ------------------ Smooth scroll for anchor links ------------------ */
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return; // safety
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      // close mobile menu if open
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ------------------ Contact form (simulasi) ------------------ */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // small UX: show loading then success
      status.textContent = "Mengirim...";
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        status.textContent = "Pesan berhasil dikirim (simulasi).";
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => (status.textContent = ""), 4000);
      }, 900);
    });
  }

  /* ------------------ Scroll to top button ------------------ */
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      // use class for fade-in via CSS if desired
      if (window.scrollY > 200) {
        scrollTopBtn.style.display = "block";
      } else {
        scrollTopBtn.style.display = "none";
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------ Header: shadow on scroll ------------------ */
  const headerEl = document.querySelector("header");
  const setHeaderShadow = () => {
    if (!headerEl) return;
    if (window.scrollY > 8) {
      document.body.classList.add("is-scrolled");
      headerEl.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
    } else {
      document.body.classList.remove("is-scrolled");
      headerEl.style.boxShadow = "none";
    }
  };
  window.addEventListener("scroll", setHeaderShadow);
  setHeaderShadow();

  /* ------------------ Theme (Dark Mode) ------------------ */
  const themeToggle = document.getElementById("themeToggle");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  // init theme: check localStorage > system preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.textContent = "☀️";
      themeToggle.setAttribute("aria-pressed", "true");
    }
  } else {
    if (themeToggle) {
      themeToggle.textContent = "🌙";
      themeToggle.setAttribute("aria-pressed", "false");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  /* ------------------ About: Read More toggle ------------------ */
  const aboutToggle = document.getElementById("aboutToggle");
  const moreText = document.getElementById("moreText");
  if (aboutToggle && moreText) {
    aboutToggle.addEventListener("click", () => {
      const expanded = aboutToggle.getAttribute("aria-expanded") === "true";
      aboutToggle.setAttribute("aria-expanded", String(!expanded));
      if (expanded) {
        moreText.hidden = true;
      } else {
        moreText.hidden = false;
      }
      // smooth scroll to keep context
      moreText.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ------------------ Reviews Carousel (Swipeable) ------------------ */
  const reviewsCarousel = document.getElementById("reviewsCarousel");
  const reviewCards = document.querySelectorAll(".review-card");
  const reviewPrevBtn = document.querySelector(".review-nav-btn.prev");
  const reviewNextBtn = document.querySelector(".review-nav-btn.next");
  const reviewDotsContainer = document.getElementById("reviewDots");
  
  let currentReviewIndex = 0;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let reviewAutoplay = null;
  const totalReviews = reviewCards.length || 0;

  // Calculate how many cards are visible
  function getCardsPerView() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  // Build dots
  if (reviewDotsContainer && totalReviews > 0) {
    const cardsPerView = getCardsPerView();
    const totalDots = Math.ceil(totalReviews / cardsPerView);
    
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "review-dot" + (i === 0 ? " active" : "");
      dot.dataset.index = String(i);
      dot.setAttribute("aria-label", `Lihat review ${i + 1}`);
      dot.addEventListener("click", () => {
        const cardsPerView = getCardsPerView();
        goToReview(i * cardsPerView);
        restartReviewAutoplay();
      });
      reviewDotsContainer.appendChild(dot);
    }
  }

  function updateReviewDots() {
    const dots = document.querySelectorAll(".review-dot");
    const cardsPerView = getCardsPerView();
    const currentDot = Math.floor(currentReviewIndex / cardsPerView);
    dots.forEach((d, idx) =>
      d.classList.toggle("active", idx === currentDot)
    );
  }

  function updateNavButtons() {
    if (!reviewPrevBtn || !reviewNextBtn) return;
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalReviews - cardsPerView);
    
    reviewPrevBtn.disabled = currentReviewIndex === 0;
    reviewNextBtn.disabled = currentReviewIndex >= maxIndex;
  }

  function goToReview(index) {
    if (!reviewsCarousel || totalReviews === 0) return;
    
    const cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalReviews - cardsPerView);
    currentReviewIndex = Math.max(0, Math.min(index, maxIndex));
    
    const cardWidth = reviewCards[0]?.offsetWidth || 0;
    const gap = 16; // 1rem gap
    const scrollPosition = currentReviewIndex * (cardWidth + gap);
    
    reviewsCarousel.scrollTo({
      left: scrollPosition,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    
    updateReviewDots();
    updateNavButtons();
  }

  // Navigation buttons
  if (reviewPrevBtn) {
    reviewPrevBtn.addEventListener("click", () => {
      const cardsPerView = getCardsPerView();
      goToReview(currentReviewIndex - cardsPerView);
      restartReviewAutoplay();
    });
  }

  if (reviewNextBtn) {
    reviewNextBtn.addEventListener("click", () => {
      const cardsPerView = getCardsPerView();
      goToReview(currentReviewIndex + cardsPerView);
      restartReviewAutoplay();
    });
  }

  // Touch/Swipe events
  if (reviewsCarousel) {
    // Mouse drag support
    reviewsCarousel.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.pageX - reviewsCarousel.offsetLeft;
      scrollLeft = reviewsCarousel.scrollLeft;
      reviewsCarousel.style.cursor = "grabbing";
      reviewsCarousel.style.scrollBehavior = "auto";
    });

    reviewsCarousel.addEventListener("mouseleave", () => {
      isDragging = false;
      reviewsCarousel.style.cursor = "grab";
      reviewsCarousel.style.scrollBehavior = "smooth";
    });

    reviewsCarousel.addEventListener("mouseup", () => {
      isDragging = false;
      reviewsCarousel.style.cursor = "grab";
      reviewsCarousel.style.scrollBehavior = "smooth";
      updateCurrentIndex();
    });

    reviewsCarousel.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - reviewsCarousel.offsetLeft;
      const walk = (x - startX) * 2;
      reviewsCarousel.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let isTouching = false;

    reviewsCarousel.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartScrollLeft = reviewsCarousel.scrollLeft;
      isTouching = true;
      reviewsCarousel.style.scrollBehavior = "auto";
      restartReviewAutoplay(); // Pause autoplay on touch
    }, { passive: true });

    reviewsCarousel.addEventListener("touchmove", (e) => {
      if (!isTouching) return;
      // Allow native scrolling, we'll handle snap on touchend
    }, { passive: true });

    reviewsCarousel.addEventListener("touchend", (e) => {
      if (!isTouching) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const scrollDiff = touchStartScrollLeft - reviewsCarousel.scrollLeft;
      
      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, totalReviews - cardsPerView);
        
        if (diffX > 0) {
          // Swipe left - next
          const nextIndex = Math.min(currentReviewIndex + cardsPerView, maxIndex);
          goToReview(nextIndex);
        } else {
          // Swipe right - prev
          const prevIndex = Math.max(currentReviewIndex - cardsPerView, 0);
          goToReview(prevIndex);
        }
        restartReviewAutoplay();
      } else if (Math.abs(scrollDiff) > 20) {
        // User scrolled manually, snap to nearest card
        setTimeout(() => {
          updateCurrentIndex();
          goToReview(currentReviewIndex);
        }, 100);
      } else {
        // Small movement, snap to current
        updateCurrentIndex();
        goToReview(currentReviewIndex);
      }
      
      reviewsCarousel.style.scrollBehavior = "smooth";
      touchStartX = 0;
      touchStartY = 0;
      touchStartScrollLeft = 0;
      isTouching = false;
    }, { passive: true });

    // Update index on scroll
    function updateCurrentIndex() {
      if (!reviewsCarousel || reviewCards.length === 0) return;
      
      const cardWidth = reviewCards[0].offsetWidth;
      const gap = 16;
      const scrollPos = reviewsCarousel.scrollLeft;
      const cardsPerView = getCardsPerView();
      
      // Calculate which card is most visible
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i <= totalReviews - cardsPerView; i++) {
        const cardPosition = i * (cardWidth + gap);
        const distance = Math.abs(scrollPos - cardPosition);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      const maxIndex = Math.max(0, totalReviews - cardsPerView);
      const newIndex = Math.max(0, Math.min(closestIndex, maxIndex));
      
      if (newIndex !== currentReviewIndex) {
        currentReviewIndex = newIndex;
        updateReviewDots();
        updateNavButtons();
      }
    }

    // Throttle scroll event for better performance
    let scrollTimeout;
    reviewsCarousel.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateCurrentIndex, 100);
    });
    
    reviewsCarousel.style.cursor = "grab";
  }

  // Autoplay
  function startReviewAutoplay() {
    if (reviewAutoplay) clearInterval(reviewAutoplay);
    if (!prefersReducedMotion && totalReviews > getCardsPerView()) {
      reviewAutoplay = setInterval(() => {
        const cardsPerView = getCardsPerView();
        const maxIndex = Math.max(0, totalReviews - cardsPerView);
        if (currentReviewIndex >= maxIndex) {
          goToReview(0);
        } else {
          goToReview(currentReviewIndex + cardsPerView);
        }
      }, 5000);
    }
  }

  function restartReviewAutoplay() {
    startReviewAutoplay();
  }

  if (totalReviews > 0) {
    updateNavButtons();
    startReviewAutoplay();
  }

  // Recalculate on resize
  window.addEventListener("resize", () => {
    if (reviewsCarousel && totalReviews > 0) {
      goToReview(currentReviewIndex);
      // Rebuild dots if needed
      const cardsPerView = getCardsPerView();
      const totalDots = Math.ceil(totalReviews / cardsPerView);
      const currentDots = reviewDotsContainer?.children.length || 0;
      if (totalDots !== currentDots && reviewDotsContainer) {
        reviewDotsContainer.innerHTML = "";
        for (let i = 0; i < totalDots; i++) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "review-dot" + (i === 0 ? " active" : "");
          dot.dataset.index = String(i);
          dot.setAttribute("aria-label", `Lihat review ${i + 1}`);
          dot.addEventListener("click", () => {
            goToReview(i * cardsPerView);
            restartReviewAutoplay();
          });
          reviewDotsContainer.appendChild(dot);
        }
      }
      updateReviewDots();
    }
  });

  /* ------------------ Simple reveal on scroll for .fade-in elements ------------------ */
  const fadeEls = document.querySelectorAll(".fade-in");
  const revealOnScroll = () => {
    fadeEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) el.classList.add("visible");
    });
  };
  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
});
