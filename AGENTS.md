# Project Rules

- On narrow mobile headers below 390px, hide the cart shortcut before allowing navigation controls to overlap; the cart remains available through the store flow.

- Keep the classical library pages independently lazy-loaded and share verse rendering and RPC access through dedicated modules, so each address loads only its own view.

- Keep Meu Dosha signed-in sections in dedicated v2 components using the existing CMS RPCs; preserve the independent visitor tabs to avoid changing the public test preview.
- Keep the therapist panel independently lazy-loaded, its views in dedicated therapy components and all RPC access in the therapy module; reuse the server-side therapist identity check for both avatar visibility and route entry to prevent inconsistent access.
- Keep therapist invitations independently lazy-loaded beside therapist routes and share the existing authentication form with /entrar; embedded authentication suppresses default navigation while preserving email functions, messages and external-browser return destinations.
