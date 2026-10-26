# Project Rules

- On narrow mobile headers below 390px, hide the cart shortcut before allowing navigation controls to overlap; the cart remains available through the store flow.

- Keep the classical library pages independently lazy-loaded and share verse rendering and RPC access through dedicated modules, so each address loads only its own view.

- Keep Meu Dosha signed-in sections in dedicated v2 components using the existing CMS RPCs; preserve the independent visitor tabs to avoid changing the public test preview.
- Keep the therapist panel independently lazy-loaded, its views in dedicated therapy components and all RPC access in the therapy module; reuse the server-side therapist identity check for both avatar visibility and route entry to prevent inconsistent access.
- Keep patient records independently lazy-loaded beside the therapist panel, with patient views in dedicated therapy components and data contracts in the patient module; use existing therapy RPCs and permission-gated on-demand requests to avoid leaking private content.
- Keep therapist invitations independently lazy-loaded beside therapist routes and share the existing authentication form with /entrar; embedded authentication suppresses default navigation while preserving email functions, messages and external-browser return destinations.

- Keep therapy assessments and their print route independently lazy-loaded next to patient routes, with core sectors, optional additions and photo annotations in dedicated assessment components; preserve the single JSON draft and existing RPCs, and calculate birth charts locally to isolate editing and private content from other portal views.
- Keep therapy indications and their print route independently lazy-loaded beside patient routes, with source catalog and section editing in dedicated components and contracts in the indications module; serialize saves through existing therapy RPCs so sending and printing use the latest single JSON draft.

- Keep therapist collection editing and item display in dedicated collection components with a lazy item route; keep teaching boards independently lazy-loaded with canvas strokes and source metadata in their own module, reuse assessment marking, and delete Storage files using the paths returned by existing RPCs. This isolates the private editor and preserves resumable boards without altering other portal views.
- Keep therapist online presence, the global 2-minute ping and the "Consulta agora" corner alert in one provider mounted by Layout, and the public consultation card lazy-loaded inside the therapist profile; this lets the avatar switch and requests work on any page without loading therapy views elsewhere.
- Keep public booking steps and directory rules in dedicated public-therapy modules, reuse the patient birth form, and generate invitation metadata from the public preview RPC; this isolates booking from private therapist views and keeps crawler previews consistent.
- Keep the patient-side therapist views (Meu terapeuta in /meu-perfil, the shared Do seu terapeuta sheet block also shown atop /minha-rotina) lazy-loaded in src/components/terapia/meu with RPC access in src/lib/terapiaMeu.ts; the block prints itself via a body class and print CSS so patients never reach therapist routes.

- Keep consultation rooms independently lazy-loaded and room RPC/video access in consultaSala; reuse the assessment editor and board with explicit in-memory training mode so practice never writes patient records and live rooms do not load other portal views.
- Keep therapist administration in dedicated admin/terapeutas views with RPC contracts and CMS value helpers in terapiaAdmin; retain the original registration editor separately and build CMS fields recursively from public values so new keys require no hardcoded form.
