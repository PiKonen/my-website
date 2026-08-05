import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ImageCard } from "pinx-ui";
import "./styles.css";

// Figma: my-website › Landing page (node 13:21) and mobile-landing-page (22:136).
// The two frames are the same page at two widths, so this is one component with
// md: as the seam — below md it follows the 390-wide mobile frame, at md and up
// the 1280-wide desktop frame.
//
// Every type style, colour and radius here is a design system token. The design's
// SPACING is not on the design system's scale (small 8 · medium 16 · large 32 ·
// extra-large 48), so each value is snapped to its nearest step, ties rounding
// up. That is a deliberate trade: the rhythm is tokenised, and drifts from Figma
// by up to 22px in places.
//
//   design    token          used for
//   8, 10     small          footer bottom padding, desktop section gaps (10)
//   12        medium         mobile nav gap (h1 → menu)
//   16, 20    medium         tile gaps (mobile 16 exact, desktop 20)
//   21        medium         desktop menu item gaps
//   24, 27    large          mobile gutters + menu gaps, desktop top inset
//   32        large          mobile section gaps (exact)
//   40        extra-large    nav vertical padding, mobile page vertical padding
//   70, 90    extra-large    desktop footer top padding, desktop gutters
//
// The column is max-w-5xl (1024px) against the design's 1100px, reusing the
// design system's own container width (see its Nav) rather than inventing one.

const MENU = [
  { label: "Work", href: "#" },
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
];

// Desktop mosaic placement, in the design's stacking order. Node ids are the
// Image Card instances in Figma. The placement is md:-only: below md the frame
// stacks every tile full-width, which is the flex column's default.
const TILES = [
  { node: "19:150", place: "md:col-start-1 md:col-span-2 md:row-start-1 md:row-span-2" },
  { node: "19:56", place: "md:col-start-3 md:row-start-1" },
  { node: "19:154", place: "md:col-start-4 md:row-start-1 md:row-span-2" },
  { node: "19:166", place: "md:col-start-3 md:row-start-2" },
  { node: "19:178", place: "md:col-start-1 md:row-start-3" },
  { node: "19:162", place: "md:col-start-2 md:col-span-2 md:row-start-3" },
  { node: "19:158", place: "md:col-start-4 md:row-start-3 md:row-span-2" },
  { node: "19:174", place: "md:col-start-1 md:row-start-4" },
  { node: "19:182", place: "md:col-start-2 md:row-start-4" },
  { node: "19:170", place: "md:col-start-3 md:row-start-4" },
];

// Placeholder content: every Image Card instance in the design carries the
// component's default photo, so all ten tiles are the same image and share one
// alt string. Swap in a per-tile src/alt — and title/description, which surface
// the card's hover caption — once there is real work to show.
const TILE_IMAGE = "/assets/portfolio-tile.jpg";
const TILE_ALT = "A lioness resting on open gravel";

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body text-body">
      <div className="mx-auto flex max-w-5xl flex-col gap-large px-large py-extra-large md:gap-small md:px-extra-large md:py-large">
        <header className="flex flex-col gap-medium md:flex-row md:items-center md:justify-between md:py-extra-large">
          {/* text/display/md on mobile, text/display/l on desktop — the weight
              and tracking of each step ride along with the token. */}
          <h1 className="font-display text-display-md md:text-display-l">Portfolio</h1>

          <nav aria-label="Main" className="flex gap-large text-body-md md:gap-medium">
            {MENU.map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        {/* Mobile: one full-width tile per row, each at the Image Card's own
            540/418 ratio — which is exactly what the mobile frame draws.
            Desktop: the 4 × 4 mosaic. Tiles span two rows or two columns, so the
            rows need a definite height to divide; the grid takes the design
            grid's own proportion (1100 × 856) and min-h-0 stops it growing to
            content instead (it is a flex item, so its min-height would otherwise
            be auto). */}
        <main className="flex flex-col gap-medium md:grid md:aspect-[1100/856] md:min-h-0 md:grid-cols-4 md:grid-rows-4">
          {TILES.map((tile) => (
            // The wrapper carries the grid placement — ImageCard takes no
            // className of its own — and size-full on the card makes both axes
            // definite, which overrides its 540/418 ratio so it fills a cell of
            // any shape. Height alone is not enough: the ratio would then derive
            // the width from it and overflow the column. Mobile leaves the ratio
            // be, since there the stack wants exactly 540/418.
            <div key={tile.node} className={`${tile.place} md:[&>*]:size-full`}>
              <ImageCard src={TILE_IMAGE} alt={TILE_ALT} />
            </div>
          ))}
        </main>

        {/* text/body/s on mobile, text/body/md on desktop, both in
            color/text/disabled. */}
        <footer className="flex flex-col gap-small pt-large pb-small text-body-s text-body-disabled md:flex-row md:items-end md:justify-between md:pt-extra-large md:text-body-md">
          <p>copyright 2026</p>
          <p>UX · UI · Visual design · Copy</p>
        </footer>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
