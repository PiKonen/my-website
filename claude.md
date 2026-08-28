# CLAUDE.md

This site consumes the pinx-ui design system as an npm dependency — it doesn't
define components, only uses them. If a component doesn't exist yet in pinx-ui,
that's a design-system change (starts in Figma), not something to build ad hoc
here.

## Using pinx-ui components
Never write a raw HTML element (`<button>`, etc.) where a pinx-ui component
already exists for it — use the real component (`Button`, `Nav`, `Card`, etc.),
even if hand-writing one would look identical. This has gone wrong before.

Before using or adding any pinx-ui component, check whether a contract exists at:

    node_modules/pinx-ui/contracts/<ComponentName>.contract.json

If one exists:
- Only use props/variants/sizes it documents.
- Never hardcode a value for a token it lists — let the component's own styles
  resolve it.
- If you need something the contract doesn't cover, stop and say so rather than
  improvising — that's a change to raise with the design system.

If no contract exists yet, use the component based on its actual TypeScript
prop types (check the installed `.d.ts`), not guesswork.

Most pinx-ui components take no `className`. If one needs to not stretch inside
a flex column (e.g. a button that shouldn't fill the container), wrap it:
`<div className="w-fit">` or `self-start`.

## Layout & responsive widths
- One breakpoint seam: `md:`. The Figma designs provide a mobile frame (~390px)
  and a desktop frame (~1280px) — build to those two states, not additional
  breakpoints, unless a real design exists for a size in between.
- Page content container: `max-w-5xl`, `mx-auto` — must match Nav's own internal
  width so the header and content column line up.
- Spacing tokens: check `node_modules/pinx-ui/dist/theme.css` for the current
  scale before using any spacing class — token names have been renamed before
  (values, not just names, so don't assume a name-similar match is correct).

## Composition rules
When multiple buttons (or other interactive components) appear together as a
group — a form's actions, a CTA row, a toolbar — they must:
- Share the same `size` prop. Don't mix `large` and `small` within one group
  unless the design explicitly shows a size hierarchy.
- Sit inside a single flex/grid wrapper with one consistent gap token
  (`gap-s`, `gap-m`, etc.) — not individually-margined elements.
- Have one clear alignment (start / end / centered / space-between) rather
  than each element positioned independently.

Example pattern for a button group:
    <div className="flex items-center gap-s">
      <Button label="Cancel" variant="secondary" onClick={...} />
      <Button label="Save" onClick={...} />
    </div>

Before finishing any page with more than one button (or similar repeated
component) visually near each other, check: same size, one shared gap, one
alignment. If they're not grouped this way, fix it before considering the
page done.

## Tone of Voice
Write in a professional, clear, and structured manner. Use precise language, concise explanations, and neutral wording. Prioritize clarity, credibility, and consistency over personality.

## Before pushing
- Confirm the pinx-ui version in package.json/package-lock actually matches
  what you intended to build against.
- If you touched any spacing/color classes, confirm those token names still
  exist in the currently-installed pinx-ui version.
