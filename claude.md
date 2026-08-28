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

## Tone of voice
[Not yet defined for this brand — ask before writing user-facing copy with a
specific register/personality in mind, rather than assuming one.]

## Before pushing
- Confirm the pinx-ui version in package.json/package-lock actually matches
  what you intended to build against.
- If you touched any spacing/color classes, confirm those token names still
  exist in the currently-installed pinx-ui version.
