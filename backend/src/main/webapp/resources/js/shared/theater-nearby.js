// Nearby Theaters Functionality
class NearbyTheaters {
  constructor() {
    this.userLocation = null;
    this.currentRadius = 10;
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateRadiusDisplay();
    this.autoDetectLocation();
  }

  bindEvents() {
    // Location detection button
    document.getElementById("detect-location").addEventListener("click", () => {
      this.detectLocation();
    });

    // Refresh location button
    document
      .getElementById("refresh-location")
      .addEventListener("click", () => {
        this.detectLocation();
      });

    // Radius change
    document.getElementById("radius-select").addEventListener("change", (e) => {
      this.currentRadius = parseInt(e.target.value);
      this.updateRadiusDisplay();
      if (this.userLocation) {
        this.loadNearbyTheaters();
      }
    });

    // Expand search button
    document.getElementById("expand-search").addEventListener("click", () => {
      this.currentRadius = Math.min(this.currentRadius * 2, 50);
      document.getElementById("radius-select").value = this.currentRadius;
      this.updateRadiusDisplay();
      this.loadNearbyTheaters();
    });
  }

  updateRadiusDisplay() {
    document.getElementById("current-radius").textContent = this.currentRadius;
  }

  async autoDetectLocation() {
    // Try to get location from localStorage first
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        this.userLocation = JSON.parse(savedLocation);
        this.showLocationSuccess();
        this.loadNearbyTheaters();
        return;
      } catch (e) {}
    }

    // Auto detect on page load
    this.detectLocation();
  }

  async detectLocation() {
    this.showLocationLoading();

    if (!navigator.geolocation) {
      this.showLocationError("Trình duyệt của bạn không hỗ trợ định vị");
      return;
    }

    try {
      const position = await this.getCurrentPosition();
      this.userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Save to localStorage
      localStorage.setItem("userLocation", JSON.stringify(this.userLocation));

      this.showLocationSuccess();
      this.loadNearbyTheaters();
    } catch (error) {
      console.error("Location detection error:", error);
      this.handleLocationError(error);
    }
  }

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });
    });
  }

  showLocationLoading() {
    const statusEl = document.getElementById("location-status");
    statusEl.innerHTML = `
            <div class="location-loading">
                <span class="loading-spinner"></span>
                <span>Đang xác định vị trí của bạn...</span>
            </div>
        `;

    document.getElementById("detect-location").style.display = "none";
    document.getElementById("refresh-location").style.display = "inline-flex";
  }

  showLocationSuccess() {
    const statusEl = document.getElementById("location-status");
    statusEl.innerHTML = `
            <div class="location-success">
                <span class="icon">✅</span>
                <span>Đã xác định vị trí của bạn</span>
            </div>
        `;

    document.getElementById("detect-location").style.display = "none";
    document.getElementById("refresh-location").style.display = "inline-flex";
  }

  showLocationError(message) {
    const statusEl = document.getElementById("location-status");
    statusEl.innerHTML = `
            <div class="location-error">
                <span class="icon">❌</span>
                <span>${message}</span>
            </div>
        `;

    document.getElementById("detect-location").style.display = "inline-flex";
    document.getElementById("refresh-location").style.display = "none";
  }

  handleLocationError(error) {
    let message = "Không thể xác định vị trí";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message =
          "Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Thông tin vị trí không khả dụng";
        break;
      case error.TIMEOUT:
        message = "Hết thời gian xác định vị trí";
        break;
    }

    this.showLocationError(message);
  }

  async loadNearbyTheaters() {
    if (!this.userLocation) {
      return;
    }

    try {
      const response = await fetch(
        `/theaters/api/nearby?latitude=${this.userLocation.latitude}&longitude=${this.userLocation.longitude}&radiusKm=${this.currentRadius}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch theaters");
      }

      const theaters = await response.json();
      this.displayTheaters(theaters);
    } catch (error) {
      console.error("Error loading theaters:", error);
      this.showTheatersError("Không thể tải danh sách rạp");
    }
  }

  displayTheaters(theaters) {
    const theatersList = document.getElementById("theaters-list");
    const noTheaters = document.getElementById("no-theaters");

    if (theaters.length === 0) {
      theatersList.style.display = "none";
      noTheaters.style.display = "block";
      return;
    }

    theatersList.style.display = "grid";
    noTheaters.style.display = "none";

    theatersList.innerHTML = theaters
      .map((theater) => this.createTheaterCard(theater))
      .join("");
  }

  createTheaterCard(theater) {
    const distance = this.calculateDistance(
      this.userLocation.latitude,
      this.userLocation.longitude,
      theater.latitude,
      theater.longitude
    );

    return `
            <div class="theater-card">
                <div class="theater-header">
                    <div>
                        <div class="theater-name">${theater.name}</div>
                        <div class="theater-address">${theater.address}</div>
                    </div>
                    <div class="theater-distance">${distance.toFixed(
                      1
                    )} km</div>
                </div>
                
                <div class="theater-info">
                    ${
                      theater.phone
                        ? `
                        <div class="theater-info-item">
                            <span class="icon">📞</span>
                            <span>${theater.phone}</span>
                        </div>
                    `
                        : ""
                    }
                    ${
                      theater.district
                        ? `
                        <div class="theater-info-item">
                            <span class="icon">📍</span>
                            <span>${theater.district.name}</span>
                        </div>
                    `
                        : ""
                    }
                </div>
                
                <div class="theater-actions">
                    <a href="/booking/theater?theaterId=${
                      theater.id
                    }" class="theater-btn primary">
                        <span class="icon">🎬</span>
                        Đặt vé
                    </a>
                    <a href="#" class="theater-btn" onclick="event.stopPropagation(); showTheaterDetails(${
                      theater.id
                    })">
                        <span class="icon">ℹ️</span>
                        Chi tiết
                    </a>
                </div>
            </div>
        `;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  showTheatersError(message) {
    const theatersList = document.getElementById("theaters-list");
    theatersList.innerHTML = `
            <div class="location-error" style="text-align: center; padding: 40px;">
                <span class="icon">❌</span>
                <span>${message}</span>
            </div>
        `;
  }
}

// Global function for theater details
function showTheaterDetails(theaterId) {
  alert(`Chi tiết rạp ID: ${theaterId}`);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  new NearbyTheaters();
});
