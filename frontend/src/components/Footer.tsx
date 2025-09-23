export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <div className="footer-logo-circle">M</div>
              <span className="footer-logo-text">MY CINEMA</span>
            </div>

            <div className="footer-links">
              <a href="#" className="footer-link">
                Chính Sách Khách Hàng Thường Xuyên
              </a>
              <a href="#" className="footer-link">
                Chính Sách Bảo Mật Thông Tin
              </a>
              <a href="#" className="footer-link">
                Điều Khoản Sử Dụng
              </a>
            </div>

            <div className="footer-info">
              <p>
                <strong>CÔNG TY TNHH MY CINEMA VIỆT NAM</strong>
              </p>
              <p>
                Giấy CNĐKDN: 0302575928, đăng ký lần đầu ngày 02/05/2008, đăng
                ký thay đổi lần thứ 10 ngày 30/03/2018, cấp bởi Sở KHĐT Thành
                phố Hồ Chí Minh
              </p>
              <p>
                Địa chỉ: Tầng 3, TTTM My Cinema, số 469 đường Nguyễn Hữu Thọ,
                Phường Tân Hưng, Quận 7, TPHCM, Việt Nam
              </p>
              <p>Hotline: (028) 3775 2524</p>
            </div>

            <div className="footer-copyright">
              COPYRIGHT © MYCINEMAVN.COM - ALL RIGHTS RESERVED.
            </div>
          </div>

          <div className="footer-right">
            <button
              className="top-button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              TOP <span className="top-arrow">▲</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
