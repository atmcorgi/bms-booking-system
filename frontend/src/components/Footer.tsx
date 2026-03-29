import { Link } from "react-router-dom";

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
              <Link to="/contact" className="footer-link">
                Liên Hệ & Hỗ Trợ
              </Link>
              <Link to="/gifts" className="footer-link">
                Shop Quà Tặng
              </Link>
              <Link to="/news" className="footer-link">
                Tin Tức & Ưu Đãi
              </Link>
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
