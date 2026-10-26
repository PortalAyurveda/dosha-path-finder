# Project Rules

- On narrow mobile headers below 390px, hide the cart shortcut before allowing navigation controls to overlap; the cart remains available through the store flow.

- Keep the classical library pages independently lazy-loaded and share verse rendering and RPC access through dedicated modules, so each address loads only its own view.

- Keep Meu Dosha signed-in sections in dedicated v2 components using the existing CMS RPCs; preserve the independent visitor tabs to avoid changing the public test preview.
- Keep the therapist panel independently lazy-loaded, its views in dedicated therapy components and all RPC access in the therapy module; reuse the server-side therapist identity check for both avatar visibility and route entry to prevent inconsistent access.
- Keep patient records independently lazy-loaded beside the therapist panel, with patient views in dedicated therapy components and data contracts in the patient module; use existing therapy RPCs and permission-gated on-demand requests to avoid leaking private content.
- Keep therapist invitations independently lazy-loaded beside therapist routes and share the existing authentication form with /entrar; embedded authentication suppresses default navigation while preserving email functions, messages and external-browser return destinations.

- Keep therapy assessments and their print route independently lazy-loaded next to patient routes, with core sectors, optional additions and photo annotations in dedicated assessment components; preserve the single JSON draft and existing RPCs, and calculate birth charts locally to isolate editing and private content from other portal views.
