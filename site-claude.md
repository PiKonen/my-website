# CLAUDE.md

This site consumes the pinx-ui design system as an npm dependency — it doesn't
define components, only uses them.

## Using pinx-ui components
Before using or adding any pinx-ui component (Button, Card, Nav, etc.), check
whether a contract exists at:

    node_modules/pinx-ui/contracts/<ComponentName>.contract.json

If one exists:
- Only use props/variants/sizes it documents — don't pass a prop or value
  that isn't listed there, even if it seems like it would work.
- If you need a variant or state the contract doesn't cover, stop and say so
  rather than improvising — that's a change to raise with the design system,
  not something to invent locally.
- Never hardcode a color, radius, or spacing value that the contract lists as
  a token — always use the component as-is and let its own styles resolve
  the token; don't reach for the literal value yourself.

If no contract exists for a component yet, use it based on its actual
TypeScript prop types (import { X } from "pinx-ui" and check the .d.ts) —
don't guess at props that aren't in the type signature.
