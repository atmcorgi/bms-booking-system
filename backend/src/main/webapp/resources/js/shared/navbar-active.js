// Navbar Tab System Helper
class NavbarActiveHelper {
  constructor() {
    this.init();
  }

  init() {
    this.setActiveNavItem();
    this.handleClickEvents();
  }

  isHomeLikePage() {
    return (
      !!document.querySelector(".movie-tabs-container") ||
      !!document.querySelector(".search-section")
    );
  }

  setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const dataPage = link.getAttribute("data-page");
      const href = link.getAttribute("href");

      if (this.shouldBeActive(currentPath, href, dataPage)) {
        link.classList.add("active");
      }
    });
  }

  shouldBeActive(currentPath, href, dataPage) {
    if (href === currentPath) return true;
    if (href === "/" && (currentPath === "/" || currentPath === "/home"))
      return true;
    if (dataPage === "theaters" && currentPath.startsWith("/theaters"))
      return true;
    if (
      dataPage === "home" &&
      (currentPath === "/" ||
        currentPath === "/home" ||
        currentPath.startsWith("/movies"))
    )
      return true;
    return false;
  }

  handleClickEvents() {
    const navLinks = document.querySelectorAll(".main-nav a");

    navLinks.forEach((link) => {
      // Ensure no duplicate listeners
      link.removeEventListener("click", this._clickHandler, false);

      this._clickHandler = (e) => {
        const dataPage = link.getAttribute("data-page");
        const href = link.getAttribute("href");

        // Remove active class from all links
        navLinks.forEach((l) => l.classList.remove("active"));

        // Add active class to clicked link immediately
        link.classList.add("active");

        // Persist
        if (dataPage) localStorage.setItem("activeNavPage", dataPage);

        if (href && href !== "#" && href !== "/") {
          e.preventDefault();
          setTimeout(() => {
            window.location.href = href;
          }, 80);
        } else if (href === "/") {
          e.preventDefault();
          if (this.isHomeLikePage()) {
            this.showTabContent("home");
          } else {
            // If not on home-like page, redirect to home
            setTimeout(() => {
              window.location.href = "/";
            }, 80);
          }
        } else {
          e.preventDefault();
          if (this.isHomeLikePage()) this.showTabContent(dataPage);
        }
      };

      link.addEventListener("click", this._clickHandler, false);
    });
  }

  showTabContent(tabName) {
    this.hideAllContent();
    switch (tabName) {
      case "home":
        this.showHomeContent();
        break;
      case "gifts":
        this.showGiftsContent();
        break;
      case "news":
        this.showNewsContent();
        break;
      case "contact":
        this.showContactContent();
        break;
      default:
        this.showHomeContent();
    }
  }

  hideAllContent() {
    document.querySelectorAll(".tab-content").forEach((section) => {
      section.style.display = "none";
    });
  }

  showHomeContent() {
    const movieTabs = document.querySelector(".movie-tabs-container");
    const searchSection = document.querySelector(".search-section");
    const quickBooking = document.querySelector(".fd-quick-booking-section");
    if (movieTabs) movieTabs.style.display = "block";
    if (searchSection) searchSection.style.display = "block";
    if (quickBooking) quickBooking.style.display = "block";
  }

  showGiftsContent() {
    this.createTabContent(
      "gifts",
      `
        <div class="tab-content gifts-content">
          <div class="container">
            <h2>Shop Quà Tặng</h2>
            <p>Nội dung shop quà tặng sẽ được hiển thị ở đây...</p>
          </div>
        </div>
      `
    );
  }

  showNewsContent() {
    this.createTabContent(
      "news",
      `
        <div class="tab-content news-content">
          <div class="container">
            <h2>Tin Mới & Ưu Đãi</h2>
            <p>Nội dung tin tức và ưu đãi sẽ được hiển thị ở đây...</p>
          </div>
        </div>
      `
    );
  }

  showContactContent() {
    this.createTabContent(
      "contact",
      `
        <div class="tab-content contact-content">
          <div class="container">
            <h2>Liên Hệ</h2>
            <p>Thông tin liên hệ sẽ được hiển thị ở đây...</p>
          </div>
        </div>
      `
    );
  }

  createTabContent(tabName, html) {
    const existingContent = document.querySelector(`.${tabName}-content`);
    if (existingContent) existingContent.remove();
    this.hideAllContent();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const content = tempDiv.firstElementChild;
    const searchSection = document.querySelector(".search-section");
    const main = document.querySelector("main");
    if (searchSection) {
      searchSection.parentNode.insertBefore(content, searchSection.nextSibling);
    } else if (main) {
      main.appendChild(content);
    }
  }

  setActiveByPage(pageName) {
    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("data-page") === pageName)
        link.classList.add("active");
    });
  }

  restoreActiveState() {
    const currentPath = window.location.pathname;
    const activePage = localStorage.getItem("activeNavPage");

    // On home-like paths, always default to 'home'
    if (
      currentPath === "/" ||
      currentPath === "/home" ||
      currentPath.startsWith("/movies")
    ) {
      this.setActiveByPage("home");
      if (this.isHomeLikePage()) this.showTabContent("home");
      // Clear mismatched stored state
      if (activePage && activePage !== "home") {
        localStorage.removeItem("activeNavPage");
      }
      return;
    }

    // Only restore if it matches the current section
    if (activePage === "theaters" && currentPath.startsWith("/theaters")) {
      this.setActiveByPage("theaters");
      return;
    }

    // Otherwise, do not override and clear stale state
    if (activePage) localStorage.removeItem("activeNavPage");
  }
}

// Bootstrap
document.addEventListener("DOMContentLoaded", function () {
  const helper = new NavbarActiveHelper();
  helper.restoreActiveState();
});

window.NavbarActiveHelper = NavbarActiveHelper;
