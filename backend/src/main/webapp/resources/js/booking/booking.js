// Booking flow: Chọn phim trước, sau đó chọn rạp (Copy toàn bộ từ booking-theater.js)
const selected = {
  location: null,
  district: null,
  theater: null,
  movie: null,
  showtime: null,
  seats: [],
  unitPrices: {},
};

function setActive(containerSelector, btnElem) {
  document
    .querySelectorAll(containerSelector + " .step-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
}

// Get movie ID from URL parameters or path
function getMovieIdFromUrl() {
  // Try URL parameters first
  const params = new URLSearchParams(window.location.search);
  let movieId = params.get("movieId");

  // If not found in params, try to extract from URL path
  if (!movieId) {
    const pathMatch = window.location.pathname.match(/\/movies\/(\d+)/);
    if (pathMatch) {
      movieId = pathMatch[1];
    }
  }

  return movieId;
}

// Get current movie ID
function currentMovieId() {
  if (window.movieId && !isNaN(window.movieId)) return parseInt(window.movieId);
  const mid = getMovieIdFromUrl();
  if (mid && (!window.movieId || isNaN(window.movieId))) window.movieId = mid;
  return window.movieId || null;
}

// Initialize booking button functionality
function initBookingButton() {
  const bookingBtn = document.getElementById("btn-open-booking");
  const bookingSection = document.getElementById("booking-section");

  if (!bookingBtn || !bookingSection) return;

  bookingBtn.addEventListener("click", function () {
    // Show booking section
    bookingSection.style.display = "block";

    // Scroll to booking section with offset for header
    setTimeout(() => {
      const headerHeight = document.querySelector("header")?.offsetHeight || 80;
      const bookingSectionTop = bookingSection.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: bookingSectionTop,
        behavior: "smooth",
      });
    }, 100);

    // Initialize booking flow if not already done
    if (bookingSection.querySelector("#content-location .loading")) {
      initBookingFlow();
    }
  });
}

// Initialize booking flow
function initBookingFlow() {
  const locationDiv = document.getElementById("content-location");
  if (!locationDiv) return;

  // Truyền movieId vào API locations nếu có
  const mid0 = currentMovieId();
  const url = mid0
    ? `/booking/api/locations?movieId=${mid0}`
    : `/booking/api/locations`;

  locationDiv.innerHTML = "<b>Chọn tỉnh/thành phố:</b><br/>";
  fetch(url)
    .then((r) => r.json())
    .then((provinces) => {
      if (!provinces?.length) {
        locationDiv.innerHTML +=
          "<p>Không có tỉnh nào có suất chiếu cho phim này.</p>";
        return;
      }
      provinces.forEach((p) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = p.name;
        btn.onclick = () => selectLocation(p, btn);
        locationDiv.appendChild(btn);
      });
    })
    .catch((e) => {
      locationDiv.innerHTML += "<p>Lỗi tải tỉnh.</p>";
    });
}

function selectLocation(province, btn) {
  selected.location = province;
  selected.district =
    selected.theater =
    selected.movie =
    selected.showtime =
      null;
  selected.seats = [];
  selected.unitPrices = {};
  setActive("#content-location", btn);
  document.getElementById("content-district").style.display = "";
  document.getElementById("content-theater").style.display = "none";
  document.getElementById("content-showtime").style.display = "none";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  // Truyền movieId vào API districts nếu có
  const mid1 = currentMovieId();
  const url = mid1
    ? `/booking/api/districts?provinceId=${province.id}&movieId=${mid1}`
    : `/booking/api/districts?provinceId=${province.id}`;

  fetch(url)
    .then((r) => r.json())
    .then((districts) => {
      const div = document.getElementById("content-district");
      div.innerHTML = "<b>Chọn quận/huyện:</b><br/>";
      if (!districts?.length) {
        div.innerHTML += "<p>Không có quận nào có suất chiếu cho phim này.</p>";
        return;
      }
      districts.forEach((d) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = d.name;
        btn.onclick = () => selectDistrict(d, btn);
        div.appendChild(btn);
      });
    })
    .catch((e) => {
      const div = document.getElementById("content-district");
      div.innerHTML = "<p>Lỗi tải quận.</p>";
    });
}

function selectDistrict(district, btn) {
  selected.district = district;
  selected.theater = selected.movie = selected.showtime = null;
  selected.seats = [];
  selected.unitPrices = {};
  setActive("#content-district", btn);
  document.getElementById("content-theater").style.display = "";
  document.getElementById("content-showtime").style.display = "none";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  // Truyền movieId vào API theaters nếu có
  const mid2 = currentMovieId();
  const url = mid2
    ? `/booking/api/theaters?provinceId=${selected.location.id}&districtId=${district.id}&movieId=${mid2}`
    : `/booking/api/theaters?provinceId=${selected.location.id}&districtId=${district.id}`;

  fetch(url)
    .then((r) => r.json())
    .then((theaters) => {
      const div = document.getElementById("content-theater");
      div.innerHTML = "<b>Chọn rạp:</b><br/>";
      if (!theaters?.length) {
        div.innerHTML += "<p>Không có rạp nào có suất chiếu cho phim này.</p>";
        return;
      }
      theaters.forEach((t) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = `${t.name} - ${t.address || ""}`;
        btn.onclick = () => selectTheater(t, btn);
        div.appendChild(btn);
      });
    })
    .catch((e) => {
      const div = document.getElementById("content-theater");
      div.innerHTML = "<p>Lỗi tải rạp.</p>";
    });
}

function selectTheater(theater, btn) {
  selected.theater = theater;
  selected.movie = selected.showtime = null;
  selected.seats = [];
  selected.unitPrices = {};
  setActive("#content-theater", btn);
  document.getElementById("content-showtime").style.display = "";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  // Load showtimes for this theater and movie
  loadShowtimeWithDateNav(null);
}

function loadShowtimeWithDateNav(selectedDate) {
  const mid3 = currentMovieId();
  const url = mid3
    ? `/booking/api/showdates?theaterId=${selected.theater.id}&movieId=${mid3}`
    : `/booking/api/showdates?theaterId=${selected.theater.id}`;

  fetch(url)
    .then((r) => r.json())
    .then((dates) => {
      const div = document.getElementById("content-showtime");
      div.innerHTML = "<b>Chọn suất chiếu:</b>";

      if (!dates?.length) {
        div.innerHTML += "<p>Không có suất chiếu nào cho phim này.</p>";
        return;
      }

      // Tạo navigation bar cho ngày
      const dateNav = document.createElement("div");
      dateNav.className = "date-navigation";
      dateNav.innerHTML = "<div class='date-nav-label'>Chọn ngày:</div>";

      const dateGrid = document.createElement("div");
      dateGrid.className = "date-nav-grid";

      // Xác định ngày mặc định (hôm nay hoặc ngày đầu tiên)
      const today = new Date().toISOString().split("T")[0];
      const defaultDate =
        selectedDate || (dates.includes(today) ? today : dates[0]);

      dates.forEach((date) => {
        const btn = document.createElement("button");
        btn.className = "step-btn date-nav-btn";

        // Format ngày hiển thị
        const dateObj = new Date(date);
        const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        const dayName = dayNames[dateObj.getDay()];
        const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

        btn.innerHTML = `<span class="st-date">${dayName} ${formattedDate}</span>`;
        btn.onclick = () => {
          // Cập nhật active state
          document
            .querySelectorAll(".date-nav-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          loadShowtimesForDate(date);
        };

        // Active state cho ngày được chọn
        if (date === defaultDate) {
          btn.classList.add("active");
        }

        dateGrid.appendChild(btn);
      });

      dateNav.appendChild(dateGrid);
      div.appendChild(dateNav);

      // Load showtime cho ngày mặc định
      loadShowtimesForDate(defaultDate);
    })
    .catch((e) => {
      const div = document.getElementById("content-showtime");
      div.innerHTML = "<p>Lỗi tải ngày chiếu.</p>";
    });
}

function loadShowtimesForDate(showDate) {
  const mid4 = currentMovieId();
  const url = mid4
    ? `/booking/api/showtimes?theaterId=${selected.theater.id}&movieId=${mid4}&showDate=${showDate}`
    : `/booking/api/showtimes?theaterId=${selected.theater.id}&showDate=${showDate}`;

  fetch(url)
    .then((r) => r.json())
    .then((showtimes) => {
      // Tìm container showtime (sau navigation)
      const div = document.getElementById("content-showtime");
      const existingShowtime = div.querySelector(".showtime-content");
      if (existingShowtime) {
        existingShowtime.remove();
      }

      const showtimeContent = document.createElement("div");
      showtimeContent.className = "showtime-content";

      if (!showtimes?.length) {
        showtimeContent.innerHTML =
          "<p>Không có suất chiếu nào cho ngày này.</p>";
        div.appendChild(showtimeContent);
        return;
      }

      // group by time-of-day
      const parseTime = (str) => {
        const [h, m] = (str || "").split(":").map((n) => parseInt(n, 10) || 0);
        return h * 60 + (m || 0);
      };
      const groups = { morning: [], afternoon: [], evening: [] };
      showtimes.forEach((st) => {
        const t = parseTime(st.showTime);
        if (t < 12 * 60) groups.morning.push(st);
        else if (t < 18 * 60) groups.afternoon.push(st);
        else groups.evening.push(st);
      });
      Object.values(groups).forEach((arr) =>
        arr.sort((a, b) => parseTime(a.showTime) - parseTime(b.showTime))
      );

      function renderGroup(title, items) {
        if (!items?.length) return;
        const group = document.createElement("div");
        group.className = "showtime-group";
        const heading = document.createElement("div");
        heading.className = "showtime-group-title";
        heading.textContent = title;
        const grid = document.createElement("div");
        grid.className = "showtime-grid";
        items.forEach((st) => {
          const btn = document.createElement("button");
          btn.className = "step-btn showtime-btn";
          btn.innerHTML = `<span class="st-time">${st.showTime}</span>`;
          btn.onclick = () => selectShowtime(st, btn);
          grid.appendChild(btn);
        });
        group.appendChild(heading);
        group.appendChild(grid);
        showtimeContent.appendChild(group);
      }

      renderGroup("Buổi sáng", groups.morning);
      renderGroup("Buổi chiều", groups.afternoon);
      renderGroup("Buổi tối", groups.evening);

      div.appendChild(showtimeContent);
    })
    .catch((e) => {
      const div = document.getElementById("content-showtime");
      const existingShowtime = div.querySelector(".showtime-content");
      if (existingShowtime) {
        existingShowtime.remove();
      }
      const showtimeContent = document.createElement("div");
      showtimeContent.className = "showtime-content";
      showtimeContent.innerHTML = "<p>Lỗi tải suất chiếu.</p>";
      div.appendChild(showtimeContent);
    });
}

function selectShowtime(st, btn) {
  selected.showtime = st;
  selected.seats = [];
  selected.unitPrices = {};
  setActive("#content-showtime", btn);
  document.getElementById("content-seat").style.display = "";
  document.getElementById("content-pay").style.display = "none";
  loadSeats();
}

function loadSeats() {
  fetch(
    `/booking/api/seats?theaterId=${selected.theater.id}&showtimeId=${selected.showtime.id}`
  )
    .then((r) => r.json())
    .then((seats) => {
      const div = document.getElementById("content-seat");
      div.innerHTML = `
        <div class="seat-layout">
          <div class="seat-screen">Màn hình</div>
          <div class="seat-rows" id="seat-rows"></div>
          <div class="seat-legend">
            <div class="legend-item"><span class="legend-box legend-standard"></span>Ghế thường</div>
            <div class="legend-item"><span class="legend-box legend-vip"></span>Ghế VIP</div>
            <div class="legend-item"><span class="legend-box legend-selected"></span>Ghế đang chọn</div>
            <div class="legend-item"><span class="legend-box legend-booked"></span>Ghế đã mua</div>
          </div>
        </div>
      `;

      function parseSeatNumber(sn) {
        const m = (sn || "").match(/^([A-Za-z]+)(\d+)$/);
        if (!m) return { rowLabel: sn || "?", number: 0 };
        return {
          rowLabel: m[1].toUpperCase(),
          number: parseInt(m[2], 10) || 0,
        };
      }

      const rowsMap = new Map();
      seats.forEach((s) => {
        const { rowLabel, number } = parseSeatNumber(s.seatNumber);
        const ext = { ...s, rowLabel, number };
        if (!rowsMap.has(rowLabel)) rowsMap.set(rowLabel, []);
        rowsMap.get(rowLabel).push(ext);
        if (typeof s.unitPrice === "number")
          selected.unitPrices[s.id] = s.unitPrice;
      });

      const rowLabels = Array.from(rowsMap.keys()).sort((a, b) =>
        a.localeCompare(b)
      );
      let maxCols = 0;
      rowLabels.forEach((r) => {
        const arr = rowsMap.get(r).sort((a, b) => a.number - b.number);
        rowsMap.set(r, arr);
        if (arr.length > maxCols) maxCols = arr.length;
      });

      const rowsContainer = div.querySelector("#seat-rows");
      rowsContainer.style.setProperty("--seat-cols", String(maxCols));

      rowLabels.forEach((rowLabel) => {
        const rowEl = document.createElement("div");
        rowEl.className = "seat-row";

        const labelEl = document.createElement("div");
        labelEl.className = "seat-row-label";
        labelEl.textContent = rowLabel;
        rowEl.appendChild(labelEl);

        const seatsWrap = document.createElement("div");
        seatsWrap.className = "seat-row-seats";
        const arr = rowsMap.get(rowLabel);
        const total = arr.length;
        const leftCols = Math.min(2, total);
        const rightCols = Math.min(2, Math.max(0, total - leftCols));
        const centerCols = Math.max(0, total - leftCols - rightCols);
        let colsTmpl = "";
        if (leftCols > 0) colsTmpl += `repeat(${leftCols}, var(--seat-size))`;
        if (leftCols > 0 && centerCols > 0) colsTmpl += ` var(--aisle-size) `;
        if (centerCols > 0)
          colsTmpl += `repeat(${centerCols}, var(--seat-size))`;
        if (centerCols > 0 && rightCols > 0) colsTmpl += ` var(--aisle-size) `;
        if (rightCols > 0) colsTmpl += `repeat(${rightCols}, var(--seat-size))`;
        seatsWrap.style.gridTemplateColumns = colsTmpl;

        arr.forEach((seat, colIdx) => {
          if (
            (leftCols > 0 && centerCols > 0 && colIdx === leftCols) ||
            (centerCols > 0 &&
              rightCols > 0 &&
              colIdx === leftCols + centerCols)
          ) {
            const aisle = document.createElement("div");
            aisle.className = "seat-aisle";
            seatsWrap.appendChild(aisle);
          }
          const label = document.createElement("label");
          const type = ((seat.seatType || "STANDARD") + "").toLowerCase();
          label.className = `seat-btn seat-type-${type}`;
          const input = document.createElement("input");
          input.type = "checkbox";
          input.value = seat.id;
          input.disabled = seat.booked === true;
          input.onchange = () => toggleSeat(seat, input);
          const span = document.createElement("span");
          span.textContent = seat.seatNumber;
          if (seat.booked === true) {
            label.classList.add("booked");
            span.title = "Ghế đã được đặt";
          }
          label.appendChild(input);
          label.appendChild(span);
          seatsWrap.appendChild(label);
        });

        rowEl.appendChild(seatsWrap);
        rowsContainer.appendChild(rowEl);
      });

      renderSummary();
    })
    .catch((e) => {
      const div = document.getElementById("content-seat");
      div.innerHTML = "<p>Lỗi tải ghế.</p>";
    });
}

function toggleSeat(seat, input) {
  const showtimeId = selected.showtime?.id;
  if (!showtimeId) {
    // fallback: only local toggle
    if (input.checked) {
      if (!selected.seats.find((s) => s.id === seat.id))
        selected.seats.push(seat);
    } else {
      selected.seats = selected.seats.filter((s) => s.id !== seat.id);
    }
    renderSummary();
    return;
  }

  if (input.checked) {
    fetch(`/booking/api/shows/${showtimeId}/holds?seatId=${seat.id}`, {
      method: "POST",
    })
      .then((r) => r.json())
      .then((resp) => {
        if (resp && resp.success) {
          if (!selected.seats.find((s) => s.id === seat.id))
            selected.seats.push(seat);
          renderSummary();
        } else {
          input.checked = false;
          alert(resp.message || "Ghế vừa được người khác giữ.");
        }
      })
      .catch(() => {
        input.checked = false;
        alert("Không thể giữ ghế. Vui lòng thử lại.");
      });
  } else {
    fetch(`/booking/api/shows/${showtimeId}/holds?seatId=${seat.id}`, {
      method: "DELETE",
    })
      .then((r) => r.json())
      .then(() => {
        selected.seats = selected.seats.filter((s) => s.id !== seat.id);
        renderSummary();
      })
      .catch(() => {
        // even if release fails, remove locally to avoid stuck UI
        selected.seats = selected.seats.filter((s) => s.id !== seat.id);
        renderSummary();
      });
  }
}

function renderSummary() {
  const container = document.getElementById("content-pay");
  // Build summary like booking.js whenever seats change
  const seats = selected.seats.map((s) => s.seatNumber);
  let total = 0;
  selected.seats.forEach((s) => (total += selected.unitPrices[s.id] || 0));
  if (!selected.seats.length) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }
  container.style.display = "";
  const priceRows = selected.seats
    .map(
      (s) =>
        `<div class="price-row">${s.seatNumber} (${
          s.seatType || "STANDARD"
        }): ${(selected.unitPrices[s.id] || 0).toLocaleString(
          "vi-VN"
        )} VND</div>`
    )
    .join("");
  container.innerHTML = `
    <div class="booking-summary">
      <h3>Thông tin đặt vé</h3>
      <p><strong>Phim:</strong> ${
        document.querySelector("h1")?.textContent || ""
      }</p>
      <p><strong>Rạp:</strong> ${selected.theater?.name || ""}</p>
      <p><strong>Suất chiếu:</strong> ${selected.showtime?.showDate || ""} ${
    selected.showtime?.showTime || ""
  }</p>
      <p><strong>Ghế đã chọn:</strong> ${seats.join(", ")}</p>
      <p><strong>Số lượng vé:</strong> ${selected.seats.length}</p>
      <div>${priceRows}</div>
      <p><strong>Tổng tiền:</strong> ${total.toLocaleString("vi-VN")} VND</p>
    </div>
    <form id="pay-form" method="post" action="/vnpay/pay">
      <input type="text" name="customerName" placeholder="Tên của bạn" required>
      <input type="text" name="customerPhone" placeholder="Số điện thoại" required>
      <input type="hidden" name="showtimeId" value="${
        selected.showtime?.id || ""
      }">
      ${selected.seats
        .map((s) => `<input type="hidden" name="seatIds" value="${s.id}">`)
        .join("")}
      <button class="fd-btn" type="submit">Thanh toán ${
        selected.seats.length
      } vé qua VNPAY</button>
    </form>
  `;
}

// Initialize when DOM is loaded
window.addEventListener("DOMContentLoaded", function () {
  initBookingButton();

  // Auto-show booking section if autoBook parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  const autoBook = urlParams.get("autoBook");

  if (autoBook === "true") {
    setTimeout(function () {
      const bookingBtn = document.getElementById("btn-open-booking");
      if (bookingBtn) {
        bookingBtn.click();
      }
    }, 500);
  }
});
