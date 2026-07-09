// Supabase Edge Function — crear preferencia Mercado Pago
// Despliega con: supabase functions deploy crear-preferencia

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, payer, external_reference, back_urls } = await req.json();

    const ACCESS_TOKEN = Deno.env.get("mp") || Deno.env.get("MP_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) throw new Error("Access token no configurado");

    // Construir preferencia para Checkout Pro
    const preferencia = {
      items: items.map((item: any) => ({
        id:          String(item.id),
        title:       item.name,
        quantity:    item.qty,
        unit_price:  item.price,
        currency_id: "COP",
      })),
      payer: {
        name:  payer.nombre,
        surname: payer.apellido,
        email: payer.email,
        phone: { number: payer.telefono },
        address: {
          street_name: payer.direccion,
          city:        payer.ciudad,
        },
      },
      back_urls: {
        success: back_urls?.success || "https://juanjog11.github.io/ajbrotechs/checkout.html?status=success",
        failure: back_urls?.failure || "https://juanjog11.github.io/ajbrotechs/checkout.html?status=failure",
        pending: back_urls?.pending || "https://juanjog11.github.io/ajbrotechs/checkout.html?status=pending",
      },
      auto_return:        "approved",
      external_reference: external_reference || "",
      statement_descriptor: "AJ BROTECHS",
      expires:           false,
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferencia),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error creando preferencia MP");
    }

    return new Response(JSON.stringify({
      id:        data.id,
      init_point: data.init_point,        // URL producción
      sandbox_init_point: data.sandbox_init_point, // URL pruebas
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status:  500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
