import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component that handles scrolling to hash fragments (e.g., #now-showing)
 * when the URL changes. This is necessary because React Router does not
 * handle hash scrolling by default.
 */
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // If there's no hash, scroll to top on page change
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    // Small timeout to ensure the element is rendered if it's dynamic
    const id = hash.replace("#", "");
    const timer = setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, hash, key]); // Re-run when path, hash, or location key changes

  return null;
}
