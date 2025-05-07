// TimeDisplay Class
class TimeDisplay {
    constructor() {
      this.timeElem = document.getElementById("currentTime");
      this.dateElem = document.getElementById("currentDate");
    }
  
    updateTime() {
      const now = new Date();
      this.timeElem.textContent = now.toLocaleTimeString();
      this.dateElem.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  
    start() {
      setInterval(() => this.updateTime(), 1000);
      this.updateTime(); // Initial update
    }
  }
  
  // PageRouter Class
  class PageRouter {
    constructor(pages) {
      this.pages = pages;
    }
  
    navigate(pageId) {
      this.pages.forEach(page => {
        page.style.display = page.id === pageId ? "block" : "none";
      });
    }
  }
  
  // SearchBox Class
  class SearchBox {
    constructor(inputElement, buttonElement, posts) {
      this.inputElement = inputElement;
      this.buttonElement = buttonElement;
      this.posts = posts;
    }
  
    search() {
      const searchTerm = this.inputElement.value.toLowerCase();
      this.posts.forEach(post => {
        const postTitle = post.querySelector("h2").textContent.toLowerCase();
        post.style.display = postTitle.includes(searchTerm) ? "block" : "none";
      });
    }
  
    bindEvents() {
      this.buttonElement.addEventListener("click", () => this.search());
    }
  }
  
  // ScrollToTop Function
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  
  // Scroll Event
  window.onscroll = function () {
    document.getElementById("topBtn").style.display = window.scrollY > 100 ? "block" : "none";
  };
  
  // Initialize Classes
  const timeDisplay = new TimeDisplay();
  timeDisplay.start();
  
  const pages = document.querySelectorAll(".page, .posts");
  const pageRouter = new PageRouter(pages);
  
  const searchBox = new SearchBox(
    document.getElementById("searchBox"),
    document.getElementById("searchBtn"),
    document.querySelectorAll(".post")
  );
  searchBox.bindEvents();
  
  // Page routing based on hashchange event
  window.addEventListener("hashchange", () => {
    const route = location.hash.substring(1) || "home";
    pageRouter.navigate(route);
  });
  
  // Load page based on current hash
  document.addEventListener("DOMContentLoaded", () => {
    const route = location.hash.substring(1) || "home";
    pageRouter.navigate(route);
  });
  
  // Update current year
  document.getElementById("currentYear").textContent = new Date().getFullYear();
  