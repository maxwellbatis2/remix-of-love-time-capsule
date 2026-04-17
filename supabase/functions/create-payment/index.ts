import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caktoClientId = Deno.env.get("CAKTO_CLIENT_ID");
    const caktoClientSecret = Deno.env.get("CAKTO_CLIENT_SECRET");

    if (!caktoClientId || !caktoClientSecret) {
      throw new Error("Cakto credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { page_id, plan } = await req.json();
    if (!page_id || !plan) {
      return new Response(JSON.stringify({ error: "Missing page_id or plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = plan === "lifetime" ? 19.99 : 29.99;

    // Create payment record
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        page_id,
        plan,
        amount,
        status: "pending",
      })
      .select()
      .single();

    if (payError) throw payError;

    // Cakto checkout links — configure these in Cakto dashboard and set as secrets
    // (CAKTO_CHECKOUT_LIFETIME and CAKTO_CHECKOUT_MONTHLY) OR fall back to defaults below
    const checkoutLifetime = Deno.env.get("CAKTO_CHECKOUT_LIFETIME") || "";
    const checkoutMonthly = Deno.env.get("CAKTO_CHECKOUT_MONTHLY") || "";
    const baseCheckout = plan === "lifetime" ? checkoutLifetime : checkoutMonthly;

    let checkoutUrl = "";
    let caktoData: any = null;

    if (baseCheckout) {
      // Use pre-configured Cakto checkout link with external reference for webhook tracking
      const u = new URL(baseCheckout);
      u.searchParams.set("external_id", payment.id);
      u.searchParams.set("email", user.email || "");
      u.searchParams.set("name", user.user_metadata?.full_name || user.email || "");
      checkoutUrl = u.toString();
    } else {
      // Try Cakto API as fallback (may not be available depending on account type)
      try {
        const caktoResponse = await fetch("https://api.cakto.com.br/v1/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${btoa(`${caktoClientId}:${caktoClientSecret}`)}`,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            description: `My Love You - Plano ${plan === "lifetime" ? "Vitalício" : "Premium Mensal"}`,
            external_id: payment.id,
            customer: { email: user.email, name: user.user_metadata?.full_name || user.email },
          }),
        });

        const text = await caktoResponse.text();
        const contentType = caktoResponse.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
          return new Response(JSON.stringify({
            error: "Cakto não retornou JSON. Configure os links de checkout (CAKTO_CHECKOUT_LIFETIME / CAKTO_CHECKOUT_MONTHLY) no painel.",
            status: caktoResponse.status,
            preview: text.slice(0, 200),
          }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        caktoData = JSON.parse(text);
        if (!caktoResponse.ok) {
          await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
          return new Response(JSON.stringify({ error: "Cakto error", details: caktoData }), {
            status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        checkoutUrl = caktoData.checkout_url || caktoData.url || "";
        await supabase.from("payments")
          .update({ cakto_payment_id: caktoData.id || caktoData.payment_id })
          .eq("id", payment.id);
      } catch (e: any) {
        await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
        return new Response(JSON.stringify({
          error: "Falha ao contatar Cakto. Configure CAKTO_CHECKOUT_LIFETIME e CAKTO_CHECKOUT_MONTHLY com os links do painel Cakto.",
          details: e?.message,
        }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({
      payment_id: payment.id,
      checkout_url: checkoutUrl,
      cakto_data: caktoData,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
