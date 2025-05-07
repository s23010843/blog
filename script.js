class Blog {
  constructor() {
    this.posts = document.querySelectorAll(".post");
  }

  showPage(pageId) {
    const pages = document.querySelectorAll(".page, .posts");
    pages.forEach(page => {
      page.style.display = page.id === pageId ? "block" : "none";
    });
  }

  updateDateTime() {
    const dateElem = document.getElementById("currentDate");
    const timeElem = document.getElementById("currentTime");
    const yearElem = document.getElementById("currentYear");

    dateElem.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    yearElem.textContent = new Date().getFullYear();

    setInterval(() => {
      const now = new Date();
      timeElem.textContent = now.toLocaleTimeString();
    }, 1000);
  }

  filterPosts() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    this.posts.forEach(post => {
      const title = post.querySelector("h2").textContent.toLowerCase();
      post.style.display = title.includes(searchInput) ? "block" : "none";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const blog = new Blog();
  blog.updateDateTime();

  window.addEventListener("hashchange", () => {
    const route = location.hash.substring(1) || "home";
    blog.showPage(route);
  });

  const route = location.hash.substring(1) || "home";
  blog.showPage(route);
});
