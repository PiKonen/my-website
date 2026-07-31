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
        <h1 className="font-display text-display-l text-body">Hello world</h1>

        <p className="font-body text-body-s text-body">
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
