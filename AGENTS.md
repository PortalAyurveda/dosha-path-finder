# Project Rules

- Keep the therapist's complete-test table, historical-response sheet and scoring-display helpers in dedicated therapy modules; use only server-returned historical points and match the record before combining test data to avoid mixing different tests.

- Keep admin students orchestration in its page and the original Formation workflow isolated from the RPC-only general student views; load release configuration once per page so every dialog uses the same server-defined options.

- On narrow mobile headers below 390px, hide the cart shortcut before allowing navigation controls to overlap; the cart remains available through the store flow.

- Keep the classical library pages independently lazy-loaded and share verse rendering and RPC access through dedicated modules, so each address loads only its own view.

- Keep Meu Dosha signed-in sections in dedicated v2 components using the existing CMS RPCs; preserve the independent visitor tabs to avoid changing the public test preview.
- Keep the Meu Dosha month chart as HTML returned by the bank RPC and shown through the shared Html component inside the same card, so the drawing lives only in the database and the identical card appears in the patient's evolution tab.
- Keep the therapist panel independently lazy-loaded, its views in dedicated therapy components and all RPC access in the therapy module; reuse the server-side therapist identity check for both avatar visibility and route entry to prevent inconsistent access.
- Keep patient records independently lazy-loaded beside the therapist panel, with patient views in dedicated therapy components and data contracts in the patient module; use existing therapy RPCs and permission-gated on-demand requests to avoid leaking private content.
- Keep therapist invitations independently lazy-loaded beside therapist routes and share the existing authentication form with /entrar; embedded authentication suppresses default navigation while preserving email functions, messages and external-browser return destinations.

- Keep therapy assessments and their print route independently lazy-loaded next to patient routes, with core sectors, optional additions and photo annotations in dedicated assessment components; preserve the single JSON draft and existing RPCs, and calculate birth charts locally to isolate editing and private content from other portal views.
- Keep therapy indications and their print route independently lazy-loaded and bare inside the shared therapist workspace; isolate patient context, source catalog and sheet editing in dedicated indication components, load assessments by the sheet reference or latest patient assessment, and serialize existing RPC saves so sending and printing read the latest single draft.
- Keep global indication search in the therapy RPC module, share dosha-grouped complaint rendering across therapy views, and scope action hierarchy to therapy containers with explicit main-action markers; this preserves source metadata and unrelated site styles.

- Keep therapist collection editing and item display in dedicated collection components with a lazy item route; keep teaching boards independently lazy-loaded with canvas strokes and source metadata in their own module, reuse assessment marking, and delete Storage files using the paths returned by existing RPCs. This isolates the private editor and preserves resumable boards without altering other portal views.
- Keep therapist online presence, the global 2-minute ping and the "Consulta agora" corner alert in one provider mounted by Layout, and the public consultation card lazy-loaded inside the therapist profile; this lets the avatar switch and requests work on any page without loading therapy views elsewhere.
- Keep public booking steps and directory rules in dedicated public-therapy modules, reuse the patient birth form, and generate invitation metadata from the public preview RPC; this isolates booking from private therapist views and keeps crawler previews consistent.
- Keep the patient-side therapist views (Meu terapeuta in /meu-perfil, the shared Do seu terapeuta sheet block also shown atop /minha-rotina) lazy-loaded in src/components/terapia/meu with RPC access in src/lib/terapiaMeu.ts; the block prints itself via a body class and print CSS so patients never reach therapist routes.

- Keep consultation rooms independently lazy-loaded and room RPC/video access in consultaSala; reuse the assessment editor and board with explicit in-memory training mode so practice never writes patient records and live rooms do not load other portal views.
- Share Jitsi quality configuration across every room and isolate browser-only tab/microphone recording and its clock from the assessment; retain the recorder while board framing changes so no recording restarts or media uploads occur.
- Keep therapist administration in dedicated admin/terapeutas views with RPC contracts and CMS value helpers in terapiaAdmin; retain the original registration editor separately and build CMS fields recursively from public values so new keys require no hardcoded form.
- Keep weekly slot operations, photo requests, indication templates and consultation follow-up in dedicated therapy modules and views; reuse existing private upload and serialized indication saves, and cancel day appointments sequentially after one confirmation to preserve errors and avoid duplicate writes.

- Keep patient and therapist messaging in shared dedicated chat views with RPC-only access; coordinate message and consultation title alerts through a single owner to avoid competing title timers.

- Fit the teaching-board canvas to both available dimensions before applying zoom, and scale long source cards independently of normalized drawing coordinates; this keeps all content visible without changing saved strokes.
- Keep the training Jitsi iframe mounted while participant events switch its CSS framing between a local-camera inset and the large call area; this avoids reconnecting when someone joins or leaves.

- Keep Meu acompanhamento a single lazy-loaded page of blocks (legacy ?aba= values scroll to block ids via blocoDaAba) with patient-only RPC contracts; reuse the existing chat, sheet and photo views in dialogs, explain technical terms with explicarTermo, and require explicit server-side assessment sharing.
- Scope the full-width therapist portal and public-profile presentation to their own CSS classes, with shared deterministic patient avatars; this preserves unrelated site pages and keeps identity presentation consistent.
- Therapy sheets use one-click accordions with page-lifetime state: the therapist folha sections (Secao.tsx, titles via tituloSecaoFechada), the patient Do seu terapeuta sections (progress via progressoSecao, mobile opens only the time-of-day section from secoesDaHora), and the evaluation's per-system symptoms and dhatus cards (container query at 560px); print routes always render everything open, and adding/dragging into a closed section opens it and scrolls to the new item.
- The patient Resumo tab renders the server-computed resumo_areas from acomp_ficha through src/components/terapia/ResumoAreas.tsx (resumoAreas.css) only when the test is shared and present; otherwise the legacy cards stay.
- The indication sheet is a fixed-height three-part skeleton (situation, the 5 moments, next visit) whose moment keys and legacy-key adapter live in terapiaIndicacoes; the patient "Seu dia" and the print route read the same moments, so old sheets never lose items.
- The assessment editor (mesa and room) separates the read-only patient file from "Minha avaliação" and groups sectors into three steps plus "Aprofundar" via the step map in terapiaAvaliacao; new assessments start empty and test symptoms are only suggestions, so the therapist's marks are never mixed with what the patient reported.
- Keep the therapist menu, Meu perfil sub-tabs, legacy ?aba= mapping, the person page's single main-action rule and per-consultation grouping in src/lib/terapiaPessoa.ts, with the person views in Pessoa* components; this keeps old links working and one main action per screen.
