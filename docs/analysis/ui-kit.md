# UI kit conventions (slice 3)

- shadcn components live in `src/ui/` and are plain JSX. Add more with `npx shadcn@latest add <name>`, then fix the generated `cn`
  import to `@/lib/utils` and delete `"use client"` lines and any `next-themes` use (see `src/ui/sonner.jsx`).
- Every Tailwind class carries the `tw:` prefix (components.json `prefix`). Never write unprefixed utilities.
- A screen opts in by importing `@/ui/ui.css` (once, from the shell) and rendering inside an element with class `ui`.
  The landing page never does. No preflight: `ui.css` has its own small reset inside `@layer base`.
- Tokens: shadcn variables map to the landing tokens (bone, ink, rose, gold) on `.ui`. Buttons and labels are mono uppercase;
  buttons are pills.
