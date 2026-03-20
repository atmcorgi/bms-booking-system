import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        @keyframes pulseBeam {
          0%, 100% { filter: drop-shadow(0 0 2px #fff7e6) url(#glow); }
          50% { filter: drop-shadow(0 0 4px #fff7e6) url(#glow); }
        }
        .animated-beam {
          animation: pulseBeam 4s ease-in-out infinite;
        }
        
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
      {/* Projector Icon - Positioned inline so it cannot be clipped by negative absolute positioning */}
      <div style={{ marginLeft: "20px" }}>
        <svg width="150" height="60" viewBox="0 0 300 120" className="header-projector">
          <defs>
            <linearGradient 
              id="beamGradient" 
              x1="0%" y1="0%" x2="100%" y2="50%" 
              spreadMethod="repeat"
              gradientTransform={`translate(${(scrollY % 100) / 100}, 0)`}
            >
              <stop offset="0%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#e74c3c" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#e74c3c" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#fff7e6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff7e6" stopOpacity="0.9" />
            </linearGradient>
            {/* Mask to fade out the beam at the end */}
            <linearGradient id="beamMask" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="fadeMask">
              <rect x="0" y="0" width="300" height="120" fill="url(#beamMask)" />
            </mask>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Light Beam with Stripes shifting based on Scroll */}
          <polygon 
            points="95,45 280,10 280,110 95,75" 
            fill="url(#beamGradient)" 
            mask="url(#fadeMask)"
            className="animated-beam"
            style={{ 
              filter: 'url(#glow)',
              transformOrigin: '95px 60px'
            }}
          />

          {/* Main Body */}
          <rect x="25" y="45" width="55" height="40" fill="#222" />
          
          {/* Side Vent Details */}
          <rect x="35" y="60" width="35" height="3" fill="#444" />
          <rect x="35" y="68" width="35" height="3" fill="#444" />

          {/* Lens (Trapezoid) */}
          <path d="M 80 50 L 105 40 L 105 90 L 80 80 Z" fill="#222" />

          {/* Top Deck / Spool Holders */}
          <rect x="30" y="35" width="45" height="10" fill="#222" />
          <circle cx="35" cy="40" r="10" fill="#222" />
          <circle cx="65" cy="40" r="10" fill="#222" />

          {/* Tripod Base */}
          <line x1="40" y1="85" x2="30" y2="120" stroke="#222" strokeWidth="4" />
          <line x1="52" y1="85" x2="52" y2="120" stroke="#222" strokeWidth="4" />
          <line x1="65" y1="85" x2="75" y2="120" stroke="#222" strokeWidth="4" />
          <rect x="42" y="85" width="20" height="8" fill="#222" />

          {/* Red/Blue Details */}
          <circle cx="72" cy="52" r="3" fill="#e74c3c" />
          <rect x="40" y="55" width="8" height="8" fill="#3498db" />

          {/* Back Reel (Smaller) */}
          <g style={{ transform: `rotate(${scrollY * 0.8}deg)`, transformOrigin: '35px 25px' }}>
            <circle cx="35" cy="25" r="16" fill="#fff" />
            <circle cx="35" cy="25" r="16" fill="none" stroke="#222" strokeWidth="2" />
            <circle cx="35" cy="25" r="4" fill="#222" />
            {/* Reel Holes */}
            {[0, 45, 90, 135].map((deg, i) => (
              <circle key={`back-hole-${i}`} cx="35" cy="14" r="3" fill="#222" transform={`rotate(${deg} 35 25)`} />
            ))}
            {[0, 60, 120].map((deg, i) => (
              <line key={`back-spoke-${i}`} x1="35" y1="9" x2="35" y2="41" stroke="#222" strokeWidth="2" transform={`rotate(${deg} 35 25)`} />
            ))}
          </g>

          {/* Front Reel (Larger) */}
          <g style={{ transform: `rotate(${scrollY * 0.8}deg)`, transformOrigin: '70px 20px' }}>
            <circle cx="70" cy="20" r="20" fill="#fff" />
            <circle cx="70" cy="20" r="20" fill="none" stroke="#222" strokeWidth="2" />
            <circle cx="70" cy="20" r="4" fill="#222" />
            {/* Reel Holes */}
            {[0, 45, 90, 135].map((deg, i) => (
              <circle key={`front-hole-${i}`} cx="70" cy="6" r="4" fill="#222" transform={`rotate(${deg} 70 20)`} />
            ))}
            {[0, 60, 120].map((deg, i) => (
              <line key={`front-spoke-${i}`} x1="70" y1="0" x2="70" y2="40" stroke="#222" strokeWidth="2" transform={`rotate(${deg} 70 20)`} />
            ))}
          </g>
        </svg>
      </div>

      <nav className="main-nav" style={{ display: "flex", alignItems: "center", gap: "20px", margin: "0 auto", paddingRight: "75px" }} role="navigation" aria-label="Main navigation">
        <a href="#" data-page="gifts" aria-label="Shop quà tặng">
          SHOP QUÀ TẶNG
        </a>
        <Link to="/" data-page="home" aria-label="Trang chủ - Danh sách phim">
          PHIM
        </Link>
        <Link to="/theaters/nearby" data-page="theaters" aria-label="Tìm rạp gần bạn">
          RẠP GẦN BẠN
        </Link>
        <a href="#" data-page="news" aria-label="Tin mới và ưu đãi">
          TIN MỚI & ƯU ĐÃI
        </a>
        <a href="#" data-page="contact" aria-label="Liên hệ">
          LIÊN HỆ
        </a>
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
        <a href="#" onClick={closeMenu}>
          SHOP QUÀ TẶNG
        </a>
        <a href="#" onClick={closeMenu}>
          TIN MỚI & ƯU ĐÃI
        </a>
        <a href="#" onClick={closeMenu}>
          LIÊN HỆ
        </a>
      </div>
    </div>
  );
}
