ALTER VIEW samkhya.v_estoque_ingredientes SET (security_invoker = on);
ALTER VIEW samkhya.v_necessidade_ingredientes SET (security_invoker = on);
GRANT SELECT ON samkhya.v_estoque_ingredientes TO authenticated, anon;
GRANT SELECT ON samkhya.v_necessidade_ingredientes TO authenticated, anon;
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';