import React from "react";
import "../styles/promo-banner.css";

const PromoBanner: React.FC = () => {
    const promos = [
        "/promos/457f6a375b814b81871ef4f6468a7b40.jpg",
        "/promos/e82257ea7d14466f934cb90de5d22ab3.jpg"
    ];

    return (
        <section className="promo-banner-section">
            <div className="promo-banner-container">
                <div className="promo-header">
                    <h2 className="promo-title">ƯU ĐÃI & SỰ KIỆN</h2>
                    <div className="promo-divider"></div>
                </div>
                <div className="promo-banner-grid">
                    {promos.map((promo, index) => (
                        <div key={index} className="promo-item">
                            <span className="promo-tag">Đặc biệt</span>
                            <img src={promo} alt={`Promotion ${index + 1}`} />
                            <div className="promo-overlay" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;
