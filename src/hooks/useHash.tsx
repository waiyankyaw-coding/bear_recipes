import { useEffect, useState } from "react";

const read = () =>
  decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));

// Returns the current hash without "#/", e.g. "mojito" or "admin/edit/mojito"
export function useHash() {
  const [hash, setHash] = useState(read);
  useEffect(() => {
    const onChange = () => setHash(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}