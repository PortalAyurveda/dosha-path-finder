# Project Rules

- On narrow mobile headers below 390px, hide the cart shortcut before allowing navigation controls to overlap; the cart remains available through the store flow.
- Render database-managed sections through SecoesSlot using existing RPCs and the shared sanitizer; this keeps content and section availability authoritative in the existing database.
- Keep section administration behind AdminRoute and use existing tables without schema changes; database policies remain authoritative for writes.