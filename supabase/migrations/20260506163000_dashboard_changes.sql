-- ==========================================
-- ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."imports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."problems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."solutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select role from public.users where id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION "public"."get_my_tenant_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select tenant_id from public.users where id = auth.uid();
$$;

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Users
CREATE POLICY "Admins and Super Admins can view users" ON "public"."users" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['SUPER_ADMIN'::"text", 'ADMIN'::"text"])));
CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));
CREATE POLICY "users_insert_self" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));

-- Imports
CREATE POLICY "imports_full_access" ON "public"."imports" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Problems
CREATE POLICY "problems_full_access" ON "public"."problems" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Scores
CREATE POLICY "scores_full_access" ON "public"."scores" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Solutions
CREATE POLICY "solutions_full_access" ON "public"."solutions" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

-- Tenants
CREATE POLICY "tenants_public_read" ON "public"."tenants" FOR SELECT USING (("is_active" = true));
CREATE POLICY "tenants_admin_write" ON "public"."tenants" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['ADMIN'::"text", 'SUPER_ADMIN'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['ADMIN'::"text", 'SUPER_ADMIN'::"text"]))))));

-- ==========================================
-- TENANT USERS COUNT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION handle_tenant_users_count()
RETURNS TRIGGER AS $$
DECLARE
  v_max_users INT;
  v_current_users INT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.role = 'EMPLOYEE' AND NEW.tenant_id IS NOT NULL THEN
      SELECT current_users, max_users INTO v_current_users, v_max_users FROM public.tenants WHERE id = NEW.tenant_id FOR UPDATE;
      IF v_current_users >= v_max_users THEN
        RAISE EXCEPTION 'User limit reached for this organization (Max: %)', v_max_users;
      END IF;
      UPDATE public.tenants SET current_users = current_users + 1 WHERE id = NEW.tenant_id;
    END IF;
    RETURN NEW;
  END IF;

  IF (TG_OP = 'DELETE') THEN
    IF OLD.role = 'EMPLOYEE' AND OLD.tenant_id IS NOT NULL THEN
      UPDATE public.tenants SET current_users = GREATEST(current_users - 1, 0) WHERE id = OLD.tenant_id;
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF OLD.role = 'EMPLOYEE' AND (NEW.role != 'EMPLOYEE' OR NEW.tenant_id IS NULL OR NEW.tenant_id != OLD.tenant_id) THEN
      UPDATE public.tenants SET current_users = GREATEST(current_users - 1, 0) WHERE id = OLD.tenant_id;
    END IF;
    IF NEW.role = 'EMPLOYEE' AND (OLD.role != 'EMPLOYEE' OR OLD.tenant_id IS NULL OR NEW.tenant_id != OLD.tenant_id) THEN
      UPDATE public.tenants SET current_users = current_users + 1 WHERE id = NEW.tenant_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_tenant_users_count_trigger
AFTER INSERT OR DELETE OR UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION handle_tenant_users_count();

-- ==========================================
-- REMOVE FAULTY CUSTOM JWT HOOK
-- ==========================================
-- We actively remove this to ensure the database doesn't crash from 'EMPLOYEE role does not exist'
DROP FUNCTION IF EXISTS "public"."custom_access_token_hook";
