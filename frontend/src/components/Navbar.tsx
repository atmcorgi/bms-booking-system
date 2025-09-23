import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="main-nav">
      <a href="#" data-page="gifts">
        SHOP QUÀ TẶNG
      </a>
      <Link to="/" data-page="home">
        PHIM
      </Link>
      <Link to="/theaters/nearby" data-page="theaters">
        RẠP GẦN BẠN
      </Link>
      <a href="#" data-page="news">
        TIN MỚI & ƯU ĐÃI
      </a>
      <a href="#" data-page="contact">
        LIÊN HỆ
      </a>
    </nav>
  );
}
