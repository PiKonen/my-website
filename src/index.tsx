import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, ImageCard, Nav } from "pinx-ui";
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
//   16, 20    medium         tile gaps (mobile 16 exact, desktop 20)
//   24, 27    large          mobile gutters
//   32        large          mobile section gaps (exact)
//   40        extra-large    mobile page vertical padding
//   70, 90    extra-large    desktop footer top padding, desktop gutters
//
// The header is the design system's Nav, so its spacing is the component's own
// and is not snapped here. The page column is max-w-5xl (1024px) against the
// design's 1100px, which is the width Nav lays its own bar out to — the two line
// up rather than the page inventing a width of its own.

// The page's user-facing copy lives in public/assets/content.json, not in this
// file, so it can be edited and reloaded without a rebuild. The cost of that: it
// is fetched rather than bundled, so it arrives after first paint and the page
// has nothing to render until it lands.
//
// Keys are the content file's own, dotted and verbatim. Listing them as a union
// rather than reaching into a Record<string, string> is what makes a typo here a
// type error instead of an "undefined" on the page.
const CONTENT_URL = "/assets/content.json";

type ContentKey =
  | "label.SiteName"
  | "label.Navi_1"
  | "label.Navi_2"
  | "label.Navi_3";

type Content = Record<ContentKey, string>;

// Labels come from the content file; hrefs are routing, so they stay in code.
// Nav wants { label, href }, so the key is resolved to its copy at render time.
const MENU: { key: ContentKey; href: string }[] = [
  { key: "label.Navi_1", href: "#" },
  { key: "label.Navi_2", href: "#" },
  { key: "label.Navi_3", href: "#" },
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
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    // StrictMode runs this twice in dev, so the second response can land first;
    // the flag drops whichever result belongs to the torn-down effect.
    let cancelled = false;

    fetch(CONTENT_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${CONTENT_URL} responded ${response.status}`);
        }
        // Unchecked: the file is ours and ships alongside the page, so a missing
        // key is a build-time mistake to catch in review, not a runtime branch.
        return response.json() as Promise<Content>;
      })
      .then((loaded) => {
        if (!cancelled) setContent(loaded);
      })
      .catch((error: unknown) => {
        console.error("Could not load site content", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Nothing on the page is meaningful without its copy, so the whole page waits
  // rather than painting a header with holes in it. If the fetch fails this stays
  // blank by design — the error is on the console.
  if (!content) return null;

  return (
    <div className="min-h-screen bg-white font-body text-body">

      {/* Nav renders the whole header — site name and links — as one sticky,
          full-bleed bar with its own bottom rule, so it sits outside the page
          column and takes no className. What the design's own header had and
          this does not: the display-type h1 (Nav sets the site name as a span at
          text/body/md/em) and the mobile stack, since Nav is one row at every
          width. */}
     <Nav
        siteName={content["label.SiteName"]}
        links={MENU.map((item) => ({ label: content[item.key], href: item.href }))}
      />
      
      <div className="mx-auto flex max-w-5xl flex-col gap-large px-large py-extra-large ...">
        {/* Primary button at the top of the page */}
        <button className="w-fit rounded-md bg-[var(--color-primary)] px-6 py-3 ...">
        Test me
        </button>

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
