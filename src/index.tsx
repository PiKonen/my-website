import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Button, Nav } from "pinx-ui";
import "./styles.css";

function Page() {
  return (
    <div className="min-h-screen bg-surface">
      <Nav
        logo="my-website"
        links={[
          { label: "Home", href: "#" },
          { label: "About", href: "#" },
        ]}
      />

      <main className="max-w-5xl mx-auto px-6 py-extra-large flex flex-col items-start gap-large">
        {/* Figma text/display/l — Roboto Serif Light 40 / AUTO leading / -2% */}
        <h1 className="font-display font-light text-[40px] leading-[normal] tracking-[-0.8px] text-body">
          Hello world
        </h1>

        {/* Figma text/body/s — Work Sans Regular 14 / 125% */}
        <p className="font-body text-sm leading-[1.25] text-body">
          Built with the pinx-ui design system.
        </p>

        <Button label="Get started" onClick={() => undefined} />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
