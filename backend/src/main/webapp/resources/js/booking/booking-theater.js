// Booking flow: Chọn rạp trước, sau đó chọn phim (UI mới)
const thSelected = {
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

// Get theater ID from URL parameters
function getTheaterIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("theaterId");
}

// Pre-select theater if theaterId is provided in URL
async function preSelectTheater(theaterId) {
  if (!theaterId) return false;

  try {
    // Fetch theater with location and district info
    const response = await fetch(`/theaters/api/${theaterId}/with-location`);
    if (!response.ok) return false;

    const data = await response.json();
    const theater = data.theater;
    const province = data.province;
    const district = data.district;

    if (!theater || !province || !district) {
      console.error("Missing theater, province, or district data");
      return false;
    }

    // Pre-select location, district, and theater
    thSelected.location = province;
    thSelected.district = district;
    thSelected.theater = theater;

    // Show theater step directly
    document.getElementById("content-location").style.display = "none";
    document.getElementById("content-district").style.display = "none";
    document.getElementById("content-theater").style.display = "";
    document.getElementById("content-movie").style.display = "";
    document.getElementById("content-showtime").style.display = "none";
    document.getElementById("content-seat").style.display = "none";
    document.getElementById("content-pay").style.display = "none";

    // Load movies for this theater
    thLoadMoviesForTheater(theater);
    return true;
  } catch (error) {
    console.error("Error pre-selecting theater:", error);
    return false;
  }
}

// Load movies for a specific theater
function thLoadMoviesForTheater(theater) {
  fetch(`/booking/api/movies?theaterId=${theater.id}`)
    .then((r) => r.json())
    .then((movies) => {
      const div = document.getElementById("content-movie");
      div.innerHTML = "<b>Chọn phim:</b>";
      if (!movies?.length) {
        div.innerHTML += "<p>Không có phim.</p>";
        return;
      }
      const grid = document.createElement("div");
      grid.className = "lotte-movie-grid";
      movies.forEach((m) => {
        const card = document.createElement("div");
        card.className = "lotte-movie-card th-movie-card";
        const poster = document.createElement("div");
        poster.className = "lotte-movie-poster";
        const img = document.createElement("img");
        img.alt = m.title || "poster";
        img.src = m.posterUrl || "";
        poster.appendChild(img);
        const overlay = document.createElement("div");
        overlay.className = "lotte-movie-overlay";
        const btnWrap = document.createElement("div");
        btnWrap.className = "lotte-movie-buttons";
        const pickBtn = document.createElement("a");
        pickBtn.className = "lotte-btn-book";
        pickBtn.textContent = "Đặt vé";
        pickBtn.href = "javascript:void(0)";
        pickBtn.onclick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          thSelectMovie(m, card);
        };
        btnWrap.appendChild(pickBtn);
        overlay.appendChild(btnWrap);
        const info = document.createElement("div");
        info.className = "lotte-movie-info";
        const title = document.createElement("div");
        title.className = "lotte-movie-title";
        title.textContent = m.title || "";
        const meta = document.createElement("div");
        meta.className = "lotte-movie-meta";
        meta.textContent = `${m.genres ? m.genres.map(g => g.name).join(", ") : "" || ""}`;
        info.appendChild(title);
        info.appendChild(meta);
        card.appendChild(poster);
        card.appendChild(overlay);
        card.appendChild(info);
        card.onclick = () => thSelectMovie(m, card);
        grid.appendChild(card);
      });
      div.appendChild(grid);
    })
    .catch((e) => {
      const div = document.getElementById("content-movie");
      div.innerHTML = "<p>Lỗi tải phim.</p>";
    });
}

window.addEventListener("DOMContentLoaded", async () => {
  const theaterId = getTheaterIdFromUrl();

  if (theaterId) {
    // Try to pre-select theater
    const success = await preSelectTheater(theaterId);
    if (success) {
      return; // Theater pre-selected, skip normal flow
    }
  }

  // Normal flow - load locations
  const locationDiv = document.getElementById("content-location");
  if (!locationDiv) return;
  locationDiv.innerHTML = "<b>Chọn tỉnh/thành phố: </b>";
  fetch("/booking/api/locations")
    .then((r) => r.json())
    .then((provinces) => {
      if (!provinces?.length) {
        locationDiv.innerHTML += "<p>Không có tỉnh nào.</p>";
        return;
      }
      provinces.forEach((p) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = p.name;
        btn.onclick = () => thSelectLocation(p, btn);
        locationDiv.appendChild(btn);
      });
    })
    .catch((e) => {
      locationDiv.innerHTML += "<p>Lỗi tải tỉnh.</p>";
    });
});

function thSelectLocation(province, btn) {
  thSelected.location = province;
  thSelected.district =
    thSelected.theater =
    thSelected.movie =
    thSelected.showtime =
      null;
  thSelected.seats = [];
  thSelected.unitPrices = {};
  setActive("#content-location", btn);
  document.getElementById("content-district").style.display = "";
  document.getElementById("content-theater").style.display = "none";
  document.getElementById("content-movie").style.display = "none";
  document.getElementById("content-showtime").style.display = "none";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  fetch(`/booking/api/districts?provinceId=${province.id}`)
    .then((r) => r.json())
    .then((districts) => {
      const div = document.getElementById("content-district");
      div.innerHTML = "<b>Chọn quận/huyện: </b>";
      if (!districts?.length) {
        div.innerHTML += "<p>Không có quận.</p>";
        return;
      }
      districts.forEach((d) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = d.name;
        btn.onclick = () => thSelectDistrict(d, btn);
        div.appendChild(btn);
      });
    })
    .catch((e) => {
      const div = document.getElementById("content-district");
      div.innerHTML = "<p>Lỗi tải quận.</p>";
    });
}

function thSelectDistrict(district, btn) {
  thSelected.district = district;
  thSelected.theater = thSelected.movie = thSelected.showtime = null;
  thSelected.seats = [];
  thSelected.unitPrices = {};
  setActive("#content-district", btn);
  document.getElementById("content-theater").style.display = "";
  document.getElementById("content-movie").style.display = "none";
  document.getElementById("content-showtime").style.display = "none";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  fetch(
    `/booking/api/theaters?provinceId=${thSelected.location.id}&districtId=${district.id}`
  )
    .then((r) => r.json())
    .then((theaters) => {
      const div = document.getElementById("content-theater");
      div.innerHTML = "<b>Chọn rạp: </b>";
      if (!theaters?.length) {
        div.innerHTML += "<p>Không có rạp.</p>";
        return;
      }
      theaters.forEach((t) => {
        const btn = document.createElement("button");
        btn.className = "step-btn";
        btn.textContent = `${t.name} - ${t.address || ""}`;
        btn.onclick = () => thSelectTheater(t, btn);
        div.appendChild(btn);
      });
    })
    .catch((e) => {
      const div = document.getElementById("content-theater");
      div.innerHTML = "<p>Lỗi tải rạp.</p>";
    });
}

function thSelectTheater(theater, btn) {
  thSelected.theater = theater;
  thSelected.movie = thSelected.showtime = null;
  thSelected.seats = [];
  thSelected.unitPrices = {};
  setActive("#content-theater", btn);
  document.getElementById("content-movie").style.display = "";
  document.getElementById("content-showtime").style.display = "none";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  fetch(`/booking/api/movies?theaterId=${theater.id}`)
    .then((r) => r.json())
    .then((movies) => {
      const div = document.getElementById("content-movie");
      div.innerHTML = "<b>Chọn phim:</b>";
      if (!movies?.length) {
        div.innerHTML += "<p>Không có phim.</p>";
        return;
      }
      const grid = document.createElement("div");
      grid.className = "lotte-movie-grid";
      movies.forEach((m) => {
        const card = document.createElement("div");
        card.className = "lotte-movie-card th-movie-card";
        const poster = document.createElement("div");
        poster.className = "lotte-movie-poster";
        const img = document.createElement("img");
        img.alt = m.title || "poster";
        img.src = m.posterUrl || "";
        poster.appendChild(img);
        const overlay = document.createElement("div");
        overlay.className = "lotte-movie-overlay";
        const btnWrap = document.createElement("div");
        btnWrap.className = "lotte-movie-buttons";
        const pickBtn = document.createElement("a");
        pickBtn.className = "lotte-btn-book";
        pickBtn.textContent = "Đặt vé";
        pickBtn.href = "javascript:void(0)";
        pickBtn.onclick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          thSelectMovie(m, card);
        };
        btnWrap.appendChild(pickBtn);
        overlay.appendChild(btnWrap);
        const info = document.createElement("div");
        info.className = "lotte-movie-info";
        const title = document.createElement("div");
        title.className = "lotte-movie-title";
        title.textContent = m.title || "";
        const meta = document.createElement("div");
        meta.className = "lotte-movie-meta";
        meta.textContent = `${m.genres ? m.genres.map(g => g.name).join(", ") : "" || ""}`;
        info.appendChild(title);
        info.appendChild(meta);
        card.appendChild(poster);
        card.appendChild(overlay);
        card.appendChild(info);
        card.onclick = () => thSelectMovie(m, card);
        grid.appendChild(card);
      });
      div.appendChild(grid);
    })
    .catch((e) => {
      const div = document.getElementById("content-movie");
      div.innerHTML = "<p>Lỗi tải phim.</p>";
    });
}

function thSelectMovie(movie, btn) {
  thSelected.movie = movie;
  thSelected.showtime = null;
  thSelected.seats = [];
  thSelected.unitPrices = {};
  setActive("#content-movie", btn);
  document.getElementById("content-showtime").style.display = "";
  document.getElementById("content-seat").style.display = "none";
  document.getElementById("content-pay").style.display = "none";

  // Lấy danh sách ngày có suất chiếu và hiển thị mặc định hôm nay
  thLoadShowtimeWithDateNav(movie, null);
}

function thLoadShowtimeWithDateNav(movie, selectedDate) {
  // Lấy danh sách ngày có suất chiếu
  fetch(
    `/booking/api/showdates?theaterId=${thSelected.theater.id}&movieId=${movie.id}`
  )
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
          thLoadShowtimesForDate(date);
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
      thLoadShowtimesForDate(defaultDate);
    })
    .catch((e) => {
      const div = document.getElementById("content-showtime");
      div.innerHTML = "<p>Lỗi tải ngày chiếu.</p>";
    });
}

function thLoadShowtimesForDate(showDate) {
  fetch(
    `/booking/api/showtimes?theaterId=${thSelected.theater.id}&movieId=${thSelected.movie.id}&showDate=${showDate}`
  )
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
          btn.onclick = () => thSelectShowtime(st, btn);
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

function thSelectShowtime(st, btn) {
  thSelected.showtime = st;
  thSelected.seats = [];
  thSelected.unitPrices = {};
  setActive("#content-showtime", btn);
  document.getElementById("content-seat").style.display = "";
  document.getElementById("content-pay").style.display = "none";
  thLoadSeats();
}

function thLoadSeats() {
  fetch(
    `/booking/api/seats?theaterId=${thSelected.theater.id}&showtimeId=${thSelected.showtime.id}`
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
          thSelected.unitPrices[s.id] = s.unitPrice;
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
          input.onchange = () => thToggleSeat(seat, input);
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

      thRenderSummary();
    })
    .catch((e) => {
      const div = document.getElementById("content-seat");
      div.innerHTML = "<p>Lỗi tải ghế.</p>";
    });
}

function thToggleSeat(seat, input) {
  if (input.checked) {
    if (!thSelected.seats.find((s) => s.id === seat.id))
      thSelected.seats.push(seat);
  } else {
    thSelected.seats = thSelected.seats.filter((s) => s.id !== seat.id);
  }
  thRenderSummary();
}

function thRenderSummary() {
  const container = document.getElementById("content-pay");
  // Build summary like booking.js whenever seats change
  const seats = thSelected.seats.map((s) => s.seatNumber);
  let total = 0;
  thSelected.seats.forEach((s) => (total += thSelected.unitPrices[s.id] || 0));
  if (!thSelected.seats.length) {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }
  container.style.display = "";
  const priceRows = thSelected.seats
    .map(
      (s) =>
        `<div class="price-row">${s.seatNumber} (${
          s.seatType || "STANDARD"
        }): ${(thSelected.unitPrices[s.id] || 0).toLocaleString(
          "vi-VN"
        )} VND</div>`
    )
    .join("");
  container.innerHTML = `
    <div class="booking-summary">
      <h3>Thông tin đặt vé</h3>
      <p><strong>Phim:</strong> ${thSelected.movie?.title || ""}</p>
      <p><strong>Rạp:</strong> ${thSelected.theater?.name || ""}</p>
      <p><strong>Suất chiếu:</strong> ${thSelected.showtime?.showDate || ""} ${
    thSelected.showtime?.showTime || ""
  }</p>
      <p><strong>Ghế đã chọn:</strong> ${seats.join(", ")}</p>
      <p><strong>Số lượng vé:</strong> ${thSelected.seats.length}</p>
      <div>${priceRows}</div>
      <p><strong>Tổng tiền:</strong> ${total.toLocaleString("vi-VN")} VND</p>
    </div>
    <form id="th-pay-form" method="post" action="/vnpay/pay">
      <input type="text" name="customerName" placeholder="Tên của bạn" required>
      <input type="text" name="customerPhone" placeholder="Số điện thoại" required>
      <input type="hidden" name="showtimeId" value="${
        thSelected.showtime?.id || ""
      }">
      ${thSelected.seats
        .map((s) => `<input type="hidden" name="seatIds" value="${s.id}">`)
        .join("")}
      <button class="fd-btn" type="submit">Thanh toán ${
        thSelected.seats.length
      } vé qua VNPAY</button>
    </form>
  `;
}

function thSubmit() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/vnpay/pay";
  const st = document.createElement("input");
  st.type = "hidden";
  st.name = "showtimeId";
  st.value = thSelected.showtime.id;
  form.appendChild(st);
  thSelected.seats.forEach((s) => {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = "seatIds";
    i.value = s.id;
    form.appendChild(i);
  });
  const name = document.createElement("input");
  name.type = "hidden";
  name.name = "customerName";
  name.value = document.querySelector(
    '#th-pay-form [name="customerName"]'
  ).value;
  form.appendChild(name);
  const phone = document.createElement("input");
  phone.type = "hidden";
  phone.name = "customerPhone";
  phone.value = document.querySelector(
    '#th-pay-form [name="customerPhone"]'
  ).value;
  form.appendChild(phone);
  document.body.appendChild(form);
  form.submit();
}
