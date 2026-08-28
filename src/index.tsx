import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LandingPage } from "./LandingPage";
import { LoginPage } from "./LoginPage";
import "./styles.css";

// The site is two pages now, so it needs some way to pick between them. This is
// a hash router rather than a real one: the project has no routing dependency
// and this adds none, and the hash is the only thing that works on a static
// build with no server rewrites behind it.
//
// The cost is what a hash route always costs — the path is #/login rather than
// /login, and it is invisible to crawlers. If the site grows past a handful of
// pages, or ever wants real URLs, this is the seam to replace with a router.

const LOGIN_ROUTE = "#/login";

function useHashRoute(): string {
  // Read straight from location on first render so a deep link lands on the
  // right page immediately, rather than painting the landing page first.
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener("hashchange", onHashChange);
    // The hash can have changed between the initial render and this effect
    // running, so re-read once rather than trusting the first value.
    onHashChange();
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return hash;
}

function App() {
  const hash = useHashRoute();
  // Anything that is not the login route is the landing page, including the
  // bare "#" the placeholder nav links set.
  return hash === LOGIN_ROUTE ? <LoginPage /> : <LandingPage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
