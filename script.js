/* ============================================================
   RADHEKRISHNA ENTERPRISES — SHARED JAVASCRIPT
   - Theme toggle (dark/light) with localStorage
   - Mobile menu
   - Scroll reveal (IntersectionObserver)
   - Sticky header shadow on scroll
   - Animated counters
   - Active nav link per page
   - Smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     01. THEME TOGGLE
  ---------------------------------------------------------- */
  const THEME_KEY = 'rke-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update toggle button aria-label
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(function (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme  = stored || getSystemTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
  }

  // Apply theme immediately to avoid flash
  initTheme();

  /* ----------------------------------------------------------
     02. DOM READY
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {

    /* --------------------------------------------------------
       03. THEME TOGGLE BUTTONS
    -------------------------------------------------------- */
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', function (e) {
        if (!getStoredTheme()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });

    /* --------------------------------------------------------
       04. MOBILE MENU
    -------------------------------------------------------- */
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const mobileMenu   = document.querySelector('.mobile-menu');

    if (mobileToggle && mobileMenu) {
      function openMenu() {
        mobileToggle.classList.add('open');
        mobileMenu.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        mobileToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      mobileToggle.addEventListener('click', function () {
        const isOpen = mobileMenu.classList.contains('open');
        isOpen ? closeMenu() : openMenu();
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          closeMenu();
          mobileToggle.focus();
        }
      });
    }

    /* --------------------------------------------------------
       05. STICKY HEADER SHADOW
    -------------------------------------------------------- */
    const header = document.querySelector('.site-header');

    if (header) {
      function handleHeaderScroll() {
        if (window.scrollY > 10) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      window.addEventListener('scroll', handleHeaderScroll, { passive: true });
      handleHeaderScroll();
    }

    /* --------------------------------------------------------
       06. ACTIVE NAV LINK
    -------------------------------------------------------- */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === currentPath ||
         (currentPath === '' && href === 'index.html') ||
         (currentPath === 'index.html' && href === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
    });

    /* --------------------------------------------------------
       07. SCROLL REVEAL
    -------------------------------------------------------- */
    const revealSelectors = [
      '.reveal',
      '.reveal-left',
      '.reveal-right',
      '.reveal-scale'
    ];

    const revealElements = document.querySelectorAll(
      revealSelectors.join(', ')
    );

    if ('IntersectionObserver' in window && revealElements.length) {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      // Fallback — show all immediately
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
    }

    /* --------------------------------------------------------
       08. ANIMATED COUNTERS
    -------------------------------------------------------- */
    const counters = document.querySelectorAll('[data-counter]');

    if (counters.length && 'IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }

    function animateCounter(el) {
      const target   = parseFloat(el.getAttribute('data-counter'));
      const duration = 2000;
      const decimals = (el.getAttribute('data-decimals') || 0);
      const start    = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = eased * target;

        el.textContent = current.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toFixed(decimals);
        }
      }

      requestAnimationFrame(update);
    }

    /* --------------------------------------------------------
       09. SMOOTH SCROLL FOR ANCHOR LINKS
    -------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const navHeight = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height'),
          10
        ) || 72;

        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    /* --------------------------------------------------------
       10. FORM — WHATSAPP + MAILTO HANDLER
    -------------------------------------------------------- */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name    = (contactForm.querySelector('[name="name"]')?.value    || '').trim();
        const phone   = (contactForm.querySelector('[name="phone"]')?.value   || '').trim();
        const email   = (contactForm.querySelector('[name="email"]')?.value   || '').trim();
        const company = (contactForm.querySelector('[name="company"]')?.value || '').trim();
        const product = (contactForm.querySelector('[name="product"]')?.value || '').trim();
        const message = (contactForm.querySelector('[name="message"]')?.value || '').trim();

        // Build WhatsApp message
        const waLines = [
          '👋 *New Enquiry — Radhekrishna Enterprises*',
          '',
          '*Name:* '    + (name    || 'Not provided'),
          '*Phone:* '   + (phone   || 'Not provided'),
          '*Email:* '   + (email   || 'Not provided'),
          '*Company:* ' + (company || 'Not provided'),
          '*Product:* ' + (product || 'Not specified'),
          '',
          '*Message:*',
          message || 'No message provided.'
        ];

        const waText = encodeURIComponent(waLines.join('\n'));
        const waNumber = '919849426939'; // India country code + number
        const waURL  = 'https://wa.me/' + waNumber + '?text=' + waText;

        // Open WhatsApp
        window.open(waURL, '_blank', 'noopener,noreferrer');

        // Show success state
        showFormSuccess(contactForm);
      });
    }

    function showFormSuccess(form) {
      const btn = form.querySelector('[type="submit"]');
      if (!btn) return;

      const original = btn.textContent;
      btn.textContent = '✓ Sent via WhatsApp';
      btn.disabled    = true;
      btn.style.background = 'linear-gradient(135deg, #25d366, #1da851)';

      setTimeout(function () {
        btn.textContent      = original;
        btn.disabled         = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    }

    /* --------------------------------------------------------
       11. LAZY LOAD IMAGES
    -------------------------------------------------------- */
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported — nothing extra needed
    } else if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(function (img) {
        imageObserver.observe(img);
      });
    }

  }); // end DOMContentLoaded

}());
