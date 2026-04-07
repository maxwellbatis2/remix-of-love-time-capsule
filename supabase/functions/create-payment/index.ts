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

    // Call Cakto API to create payment
    // Note: Adjust the Cakto API endpoint/payload based on their actual docs
    const caktoResponse = await fetch("https://api.cakto.com.br/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${caktoClientId}:${caktoClientSecret}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // cents
        description: `My Love You - Plano ${plan === "lifetime" ? "Vitalício" : "Premium Mensal"}`,
        external_id: payment.id,
        customer: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
        },
      }),
    });

    const caktoData = await caktoResponse.json();

    if (!caktoResponse.ok) {
      console.error("Cakto error:", caktoData);
      await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      throw new Error(`Cakto payment failed: ${JSON.stringify(caktoData)}`);
    }

    // Update payment with Cakto ID
    await supabase
      .from("payments")
      .update({ cakto_payment_id: caktoData.id || caktoData.payment_id })
      .eq("id", payment.id);

    return new Response(JSON.stringify({
      payment_id: payment.id,
      checkout_url: caktoData.checkout_url || caktoData.url,
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
