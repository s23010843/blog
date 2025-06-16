
class TechBlog {
  constructor() {
    this.posts = document.querySelectorAll(".post");
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.isOnline = navigator.onLine;
    this.searchIndex = [];
    this.cacheName = 'tech-blog-v1';
    
    this.init();
  }

  init() {
    this.initializeTheme();
    this.updateDateTime();
    this.setupEventListeners();
    this.buildSearchIndex();
    this.initServiceWorker();
    this.hideLoadingScreen();
    this.initOfflineDetection();
    this.initLazyLoading();
    this.initAccessibility();
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 1000);
  }

  initializeTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeToggle();
  }

  updateThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', 
        `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} theme`);
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    this.updateThemeToggle();
    
    // Add transition effect
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Navigation
    window.addEventListener("hashchange", () => this.handleRouting());
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(() => this.filterPosts(), 300));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch();
        }
      });
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterByCategory());
    }

    // Back to top button
    window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 100));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    
    // Form submissions
    this.setupFormHandlers();
  }

  setupFormHandlers() {
    // Contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => this.handleNewsletter(e));
    }
  }

  handleRouting() {
    const route = location.hash.substring(1) || "home";
    this.showPage(route);
    this.updateActiveNav(route);
    
    // Smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update page title
    this.updatePageTitle(route);
    
    // Analytics tracking (placeholder)
    this.trackPageView(route);
  }

  showPage(pageId) {
    const pages = document.querySelectorAll(".page, .posts");
    
    pages.forEach(page => {
      if (page.id === pageId) {
        page.style.display = "block";
        page.setAttribute('aria-hidden', 'false');
        // Add entrance animation
        page.style.animation = 'fadeInUp 0.6s ease';
      } else {
        page.style.display = "none";
        page.setAttribute('aria-hidden', 'true');
      }
    });

    // Special handling for blog page
    if (pageId === 'blog') {
      this.resetFilters();
    }
  }

  updateActiveNav(route) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      if (href === route) {
        link.setAttribute('aria-current', 'page');
        link.style.background = 'rgba(255, 255, 255, 0.2)';
      } else {
        link.removeAttribute('aria-current');
        link.style.background = '';
      }
    });
  }

  updatePageTitle(route) {
    const titles = {
      home: 'Official Tech Blog - Technology Insights & Tutorials',
      about: 'About Us - Official Tech Blog',
      blog: 'Latest Articles - Official Tech Blog',
      contact: 'Contact Us - Official Tech Blog'
    };
    
    document.title = titles[route] || titles.home;
  }

  updateDateTime() {
    const dateElem = document.getElementById("currentDate");
    const timeElem = document.getElementById("currentTime");
    const yearElem = document.getElementById("currentYear");

    if (dateElem) {
      dateElem.textContent = new Date().toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    if (yearElem) {
      yearElem.textContent = new Date().getFullYear();
    }

    if (timeElem) {
      setInterval(() => {
        const now = new Date();
        timeElem.textContent = now.toLocaleTimeString();
      }, 1000);
    }
  }

  buildSearchIndex() {
    this.posts.forEach(post => {
      const title = post.querySelector("h3")?.textContent || '';
      const content = post.querySelector("p")?.textContent || '';
      const category = post.getAttribute('data-category') || '';
      const tags = Array.from(post.querySelectorAll('.tag')).map(tag => tag.textContent);
      
      this.searchIndex.push({
        element: post,
        title: title.toLowerCase(),
        content: content.toLowerCase(),
        category: category.toLowerCase(),
        tags: tags.map(tag => tag.toLowerCase()),
        searchText: `${title} ${content} ${category} ${tags.join(' ')}`.toLowerCase()
      });
    });
  }

  filterPosts() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase().trim();
    const categoryFilter = document.getElementById("categoryFilter").value;
    
    let visibleCount = 0;
    
    this.searchIndex.forEach(item => {
      let showPost = true;
      
      // Apply search filter
      if (searchTerm && !item.searchText.includes(searchTerm)) {
        showPost = false;
      }
      
      // Apply category filter
      if (categoryFilter && item.category !== categoryFilter) {
        showPost = false;
      }
      
      item.element.style.display = showPost ? "block" : "none";
      if (showPost) visibleCount++;
    });
    
    this.updateSearchResults(visibleCount, searchTerm);
  }

  filterByCategory() {
    this.filterPosts();
  }

  updateSearchResults(count, searchTerm) {
    // Remove existing results message
    const existingMessage = document.querySelector('.search-results-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    if (searchTerm || document.getElementById("categoryFilter").value) {
      const blogSection = document.getElementById('blog');
      const message = document.createElement('div');
      message.className = 'search-results-message';
      message.style.textAlign = 'center';
      message.style.padding = '1rem';
      message.style.marginBottom = '2rem';
      message.style.background = 'var(--surface-variant)';
      message.style.borderRadius = 'var(--radius)';
      
      if (count === 0) {
        message.innerHTML = `<p>No articles found. Try adjusting your search terms.</p>`;
      } else {
        message.innerHTML = `<p>Found ${count} article${count !== 1 ? 's' : ''}</p>`;
      }
      
      blogSection.insertBefore(message, blogSection.querySelector('.post'));
    }
  }

  resetFilters() {
    document.getElementById("searchInput").value = '';
    document.getElementById("categoryFilter").value = '';
    this.filterPosts();
  }

  performSearch() {
    const searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm) {
      // Switch to blog page if not already there
      if (location.hash !== '#blog') {
        location.hash = '#blog';
      }
      this.filterPosts();
      
      // Track search (placeholder)
      this.trackSearch(searchTerm);
    }
  }

  handleScroll() {
    const topBtn = document.getElementById('topBtn');
    const scrollProgress = this.updateScrollProgress();
    
    if (topBtn) {
      if (window.pageYOffset > 300) {
        topBtn.style.display = 'block';
        topBtn.style.opacity = Math.min(scrollProgress, 1);
      } else {
        topBtn.style.display = 'none';
      }
    }
    
    // Animate elements on scroll
    this.animateOnScroll();
  }

  updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return winScroll / height;
  }

  animateOnScroll() {
    const elements = document.querySelectorAll('.post, .expertise-item, .stat-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  handleKeyboardNavigation(e) {
    // Escape key to close modals or reset search
    if (e.key === 'Escape') {
      if (document.getElementById("searchInput").value) {
        this.resetFilters();
        document.getElementById("searchInput").focus();
      }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById("searchInput").focus();
    }
  }

  handleContactForm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
    e.target.reset();
    
    // Track form submission (placeholder)
    this.trackEvent('contact_form_submit');
  }

  handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    if (this.validateEmail(email)) {
      this.showNotification('Successfully subscribed to our newsletter!', 'success');
      e.target.reset();
      this.trackEvent('newsletter_subscribe');
    } else {
      this.showNotification('Please enter a valid email address.', 'error');
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'});
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-elevation);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          this.checkForUpdates(registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }

  checkForUpdates(registration) {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateNotification();
        }
      });
    });
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary);
      color: white;
      padding: 1rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-elevation);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 1rem;
    `;
    
    notification.innerHTML = `
      <span>New version available!</span>
      <button onclick="window.location.reload()" style="
        background: var(--secondary);
        border: none;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
      ">Update</button>
    `;
    
    document.body.appendChild(notification);
  }

  initOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.hideOfflineMessage();
      this.showNotification('You\'re back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineMessage();
    });
    
    if (!this.isOnline) {
      this.showOfflineMessage();
    }
  }

  showOfflineMessage() {
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
      offlineMessage.style.display = 'flex';
    }
  }

  hideOfflineMessage() {
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
      offlineMessage.style.display = 'none';
    }
  }

  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  initAccessibility() {
    // Add focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('main-content').focus();
      });
    }
  }

  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Analytics placeholders
  trackPageView(page) {
    // Google Analytics or other analytics tracking
    console.log(`Page view: ${page}`);
  }

  trackEvent(eventName, data = {}) {
    // Event tracking
    console.log(`Event: ${eventName}`, data);
  }

  trackSearch(searchTerm) {
    this.trackEvent('search', { query: searchTerm });
  }
}

// Global functions for HTML event handlers
function filterPosts() {
  window.blog?.filterPosts();
}

function filterByCategory() {
  window.blog?.filterByCategory();
}

function performSearch() {
  window.blog?.performSearch();
}

function scrollToTop() {
  window.blog?.scrollToTop();
}

function hideOfflineMessage() {
  window.blog?.hideOfflineMessage();
}

function handleContactForm(e) {
  window.blog?.handleContactForm(e);
}

function handleNewsletter(e) {
  window.blog?.handleNewsletter(e);
}

// Initialize the blog when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.blog = new TechBlog();
  
  // Initial routing
  const route = location.hash.substring(1) || "home";
  window.blog.showPage(route);
  window.blog.updateActiveNav(route);
  
  // Add CSS for keyboard navigation
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-navigation *:focus {
      outline: 2px solid var(--accent) !important;
      outline-offset: 2px !important;
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
});

// PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Install App';
  installButton.className = 'btn btn-accent';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 1000;
  `;
  
  installButton.addEventListener('click', () => {
    e.prompt();
    e.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        installButton.remove();
      }
    });
  });
  
  document.body.appendChild(installButton);
  
  setTimeout(() => {
    if (installButton.parentNode) {
      installButton.remove();
    }
  }, 10000);
});
