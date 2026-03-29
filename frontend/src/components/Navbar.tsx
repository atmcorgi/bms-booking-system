import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
      <style>{`
        /* Hamburger menu button */
        .hamburger-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          z-index: 1001;
        }
        .hamburger-btn span {
          display: block;
          width: 24px;
          height: 2px;
          background: #333;
          margin: 3px 0;
          transition: all 0.3s ease;
        }
        .hamburger-btn.active span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .hamburger-btn.active span:nth-child(2) {
          opacity: 0;
        }
        .hamburger-btn.active span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }
        
        /* Mobile menu overlay */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .mobile-menu-overlay.active {
          opacity: 1;
        }
        
        /* Mobile nav */
        .main-nav-mobile {
          display: none;
          position: fixed;
          top: 0;
          right: -280px;
          width: 280px;
          height: 100vh;
          background: #fff;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          padding: 80px 20px 20px;
          transition: right 0.3s ease;
          overflow-y: auto;
        }
        .main-nav-mobile.active {
          right: 0;
        }
        .main-nav-mobile a {
          display: block;
          padding: 14px 16px;
          color: #333;
          text-decoration: none;
          font-size: 15px;
          font-weight: 500;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s, color 0.2s;
        }
        .main-nav-mobile a:hover {
          background: #f5f5f5;
          color: #8b7355;
        }
        
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex;
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
          }
          .mobile-menu-overlay {
            display: block;
          }
          .main-nav {
            display: none !important;
          }
          .main-nav-mobile {
            display: block;
          }
          .header-projector {
            display: none;
          }
          .main-header .container {
            position: relative;
          }
        }
      `}</style>

      {/* Film Reel Icon - Premium design */}
      <div style={{ marginLeft: "20px", display: "flex", alignItems: "center" }} className="header-projector">
        <style>{`
          .film-reel-icon {
            width: 44px;
            height: 44px;
            border: 3px solid #8b7355;
            border-radius: 50%;
            position: relative;
            animation: spinReel 10s linear infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(139, 115, 85, 0.05);
            box-shadow: 0 0 10px rgba(139, 115, 85, 0.2);
          }
          .film-reel-icon::before {
            content: '';
            position: absolute;
            width: 14px;
            height: 14px;
            border: 3px solid #8b7355;
            border-radius: 50%;
            background: transparent;
            z-index: 2;
          }
          .film-spoke {
            position: absolute;
            width: 100%;
            height: 3px;
            background: #8b7355;
            z-index: 1;
          }
          .film-spoke:nth-child(2) { transform: rotate(60deg); }
          .film-spoke:nth-child(3) { transform: rotate(120deg); }
          @keyframes spinReel {
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="film-reel-icon" title="BMS Cinema">
          <div className="film-spoke" />
          <div className="film-spoke" />
          <div className="film-spoke" />
        </div>
      </div>

      <nav className="main-nav" style={{ display: "flex", alignItems: "center", gap: "20px", margin: "0 auto", paddingRight: "75px" }} role="navigation" aria-label="Main navigation">
        <Link to="/gifts" data-page="gifts" aria-label="Shop quà tặng">
          SHOP QUÀ TẶNG
        </Link>
        <Link to="/" data-page="home" aria-label="Trang chủ - Danh sách phim">
          PHIM
        </Link>
        <Link to="/theaters/nearby" data-page="theaters" aria-label="Tìm rạp gần bạn">
          RẠP GẦN BẠN
        </Link>
        <Link to="/news" data-page="news" aria-label="Tin mới và ưu đãi">
          TIN MỚI & ƯU ĐÃI
        </Link>
        <Link to="/contact" data-page="contact" aria-label="Liên hệ">
          LIÊN HỆ
        </Link>
      </nav>

      {/* Hamburger Button */}
      <button 
        className={`hamburger-btn ${mobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
      />

      {/* Mobile Navigation */}
      <div className={`main-nav-mobile ${mobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={closeMenu}>
          PHIM
        </Link>
        <Link to="/theaters/nearby" onClick={closeMenu}>
          RẠP GẦN BẠN
        </Link>
        <Link to="/gifts" onClick={closeMenu}>
          SHOP QUÀ TẶNG
        </Link>
        <Link to="/news" onClick={closeMenu}>
          TIN MỚI & ƯU ĐÃI
        </Link>
        <Link to="/contact" onClick={closeMenu}>
          LIÊN HỆ
        </Link>
      </div>
    </div>
  );
}
