import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      const isAdmin = data?.some((r) => r.role === "admin");
      setRole(isAdmin ? "admin" : "user");
      setLoading(false);
    });
  }, [user]);

  return { role, isAdmin: role === "admin", loading };
};
