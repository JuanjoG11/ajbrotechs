// Supabase Edge Function — Enviar Email de Confirmación con Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatCOP(n: number) {
  return '$' + Math.round(n).toLocaleString('es-CO');
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // La función se puede llamar directamente o por webhook de Supabase.
    // El webhook envía una carga útil con record (nueva fila) y opcionalmente old_record.
    const body = await req.json();
    
    // Extraer el ID del pedido
    const pedidoId = body.record?.id || body.id;
    if (!pedidoId) {
      throw new Error("No se proporcionó el ID del pedido");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://bwpvrgiejjatzjmmjrew.supabase.co";
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      throw new Error("La variable de entorno RESEND_API_KEY no está configurada");
    }

    // 1. Consultar el pedido completo de la base de datos (para asegurar datos reales)
    const pedidoRes = await fetch(`${SUPABASE_URL}/rest/v1/pedidos?id=eq.${pedidoId}&select=*`, {
      headers: {
        "apikey": SUPABASE_KEY!,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!pedidoRes.ok) {
      throw new Error(`Error obteniendo los detalles del pedido: ${await pedidoRes.text()}`);
    }
    const [pedido] = await pedidoRes.json();

    if (!pedido) {
      throw new Error("No se encontró el pedido en la base de datos");
    }

    // Solo enviar si el estado es 'confirmado' (evitar duplicados o cancelados)
    if (pedido.estado !== 'confirmado') {
      return new Response(JSON.stringify({ message: `El pedido está en estado '${pedido.estado}'. Email omitido.` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Consultar los items del pedido de la base de datos
    const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/pedido_items?pedido_id=eq.${pedido.id}&select=*`, {
      headers: {
        "apikey": SUPABASE_KEY!,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!itemsRes.ok) {
      throw new Error(`Error obteniendo los items del pedido: ${await itemsRes.text()}`);
    }
    const items = await itemsRes.json();

    // 2. Generar el HTML del correo (Template Responsive Premium)
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <div style="font-weight: bold; color: #111111; font-size: 14px;">${item.nombre}</div>
          <div style="color: #666666; font-size: 12px; margin-top: 4px;">Cantidad: ${item.cantidad}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #111111; font-size: 14px;">
          ${formatCOP(item.precio * item.cantidad)}
        </td>
      </tr>
    `).join('');

    const descuentoRow = pedido.descuento > 0 ? `
      <tr>
        <td style="padding: 8px 0; color: #00cc66;">Descuento Especial</td>
        <td style="padding: 8px 0; text-align: right; color: #00cc66; font-weight: bold;">-${formatCOP(pedido.descuento)}</td>
      </tr>
    ` : '';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #07070f 0%, #0d0d3a 100%); padding: 40px 20px; text-align: center; border-bottom: 3px solid #0066FF; }
        .logo-text { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: 1px; margin: 0; }
        .content { padding: 40px 30px; }
        .title { font-size: 22px; font-weight: 800; color: #111111; margin-bottom: 16px; text-align: center; }
        .subtitle { font-size: 15px; color: #555555; line-height: 1.6; text-align: center; margin-bottom: 32px; }
        .card { background-color: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
        .card-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #0066FF; letter-spacing: 0.5px; margin-bottom: 12px; }
        .table { width: 100%; border-collapse: collapse; }
        .total-row td { padding: 12px 0 0; font-size: 16px; font-weight: bold; color: #111111; border-top: 2px solid #e2e8f0; }
        .footer { text-align: center; padding: 30px 20px; background-color: #f8fafc; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; }
      </style>
    </head>
    <body>
      <div style="background-color: #f6f9fc; padding: 40px 10px;">
        <div class="container">
          <div class="header">
            <h1 class="logo-text">AJ BROTECH'S</h1>
            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Colombia</div>
          </div>
          
          <div class="content">
            <h2 class="title">¡Gracias por tu compra! 🎉</h2>
            <p class="subtitle">
              Hemos recibido tu pedido <strong>${pedido.numero}</strong> correctamente y ya está siendo procesado para su despacho. A continuación verás el resumen:
            </p>

            <div class="card">
              <div class="card-title">Resumen del Pedido</div>
              <table class="table">
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 12px 0 8px; color: #666666;">Subtotal</td>
                    <td style="padding: 12px 0 8px; text-align: right; font-weight: bold; color: #111111;">${formatCOP(pedido.subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666;">Envío</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111111;">${pedido.envio === 0 ? 'Gratis' : formatCOP(pedido.envio)}</td>
                  </tr>
                  ${descuentoRow}
                  <tr class="total-row">
                    <td>Total Pagado</td>
                    <td style="text-align: right; color: #0066FF;">${formatCOP(pedido.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="card">
              <div class="card-title">Información de Envío</div>
              <div style="font-size: 14px; line-height: 1.6; color: #333333;">
                <strong>Destinatario:</strong> ${pedido.nombre} ${pedido.apellido}<br>
                <strong>Teléfono:</strong> ${pedido.telefono}<br>
                <strong>Dirección:</strong> ${pedido.direccion}<br>
                <strong>Ciudad/Dpto:</strong> ${pedido.ciudad}, ${pedido.departamento}<br>
                <strong>Método de Pago:</strong> <span style="text-transform: uppercase; font-weight: bold;">${pedido.metodo_pago}</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://wa.me/573207507468?text=Hola! Quiero consultar sobre mi pedido ${pedido.numero}" style="background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(37,211,102,0.3);">
                💬 Consultar por WhatsApp
              </a>
            </div>
          </div>

          <div class="footer">
            <p>© 2025 AJ BROTECH'S. Todos los derechos reservados.</p>
            <p style="margin-top: 6px;">Este es un correo automático. Por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    // 3. Enviar a través de la API de Resend
    // Por defecto, si el cliente no ha verificado su dominio en Resend, debe usarse 'onboarding@resend.dev' como emisor
    // Pero si ya configuraron su dominio, usamos su email institucional. Usaremos una dirección genérica amigable para empezar.
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AJ BROTECH'S <pedidos@resend.dev>", // Cambiar a pedidos@ajbrotech.com.co si el dominio ya está verificado en Resend
        to: pedido.email,
        subject: `Confirmación de Pedido ${pedido.numero} - AJ BROTECH'S`,
        html: htmlContent,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      throw new Error(emailData.message || "Error al enviar correo con Resend");
    }

    return new Response(JSON.stringify({ success: true, message: "Email enviado con éxito", resendId: emailData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
