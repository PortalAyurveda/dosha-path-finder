Plan: update src/contexts/UserContext.tsx only, with two surgical changes.

1. Update `UserContextType` interface:
   - Change `claimTest: (idPublico: string) => Promise<boolean>;` to `claimTest: (idPublico?: string | null) => Promise<boolean>;`

2. Replace `claimTest` implementation:
   - Remove the current no-op function.
   - Add implementation that calls Supabase RPC `claim_dosha_test` with optional `p_id_publico` parameter.
   - Return `(data as any)?.ok === true` on success, log errors/exceptions and return false on failure.

3. Update the `SIGNED_IN` branch inside `onAuthStateChange`:
   - Always call `claimTest` on login.
   - Resolve the id to claim in this priority:
     1. `pendingClaimIdPublico` from localStorage
     2. `?id=` from URL search params
     3. `activeDoshaId` from localStorage
     4. `null`
   - Keep the existing `visitorId` update block unchanged.
   - Clean up `pendingClaimIdPublico` only if it was used.

No other functions, hooks, or files will be touched.