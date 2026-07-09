// Supabase Edge Function — crear preferencia Mercado Pago
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, payer, external_reference, back_urls, shipping, discount } = await req.json();

    const ACCESS_TOKEN = (globalThis as any).Deno.env.get("MP_ACCESS_TOKEN")
                      || (globalThis as any).Deno.env.get("mp");
    if (!ACCESS_TOKEN) throw new Error("Access token no configurado");

    // Items base
    const mpItems: any[] = items.map((item: any) => ({
      id:          String(item.id),
      title:       item.name,
      quantity:    item.qty,
      unit_price:  Number(item.price),
      currency_id: "COP",
    }));

    // Agregar envío como item si aplica
    if (shipping && Number(shipping) > 0) {
      mpItems.push({
        id:          "envio",
        title:       "Envío a domicilio",
        quantity:    1,
        unit_price:  Number(shipping),
        currency_id: "COP",
      });
    }

    // Agregar descuento como item negativo si aplica
    if (discount && Number(discount) > 0) {
      mpItems.push({
        id:          "descuento",
        title:       "Descuento especial",
        quantity:    1,
        unit_price:  -Number(discount),
        currency_id: "COP",
      });
    }

    const preferencia = {
      items: mpItems,
      payer: {
        name:    payer.nombre,
        surname: payer.apellido,
        email:   payer.email,
        phone:   { number: payer.telefono },
        address: { street_name: payer.direccion, city: payer.ciudad },
      },
      back_urls: {
        success: back_urls?.success || "https://juanjog11.github.io/ajbrotechs/index.html?status=success",
        failure: back_urls?.failure || "https://juanjog11.github.io/ajbrotechs/index.html?status=failure",
        pending: back_urls?.pending || "https://juanjog11.github.io/ajbrotechs/index.html?status=pending",
      },
      auto_return:          "approved",
      external_reference:   external_reference || "",
      statement_descriptor: "AJ BROTECHS",
      expires:              false,
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
    if (!res.ok) throw new Error(data.message || "Error creando preferencia MP");

    return new Response(JSON.stringify({
      id:                 data.id,
      init_point:         data.init_point,
      sandbox_init_point: data.sandbox_init_point,
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
