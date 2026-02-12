import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PromoBanner from "../components/PromoBanner";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 100;
      if (window.scrollY > offset) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Header isSticky={isSticky} />
      {isSticky && <div className="header-placeholder" />}
      <main>{children}</main>
      <PromoBanner />
      <Footer />
    </>
  );
}
