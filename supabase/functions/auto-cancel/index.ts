// Auto-cancel pending orders older than 24 hours
// Deploy: supabase functions deploy auto-cancel
// Schedule: set up a cron trigger via Supabase Dashboard or pg_cron

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Find expired pending orders
  const { data: expired } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', cutoff)

  if (!expired || expired.length === 0) {
    return new Response(JSON.stringify({ cancelled: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let cancelled = 0

  for (const order of expired) {
    // Restore stock
    if (order.items) {
      for (const item of order.items) {
        const { data: cur } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single()
        if (cur) {
          await supabase
            .from('products')
            .update({ stock: cur.stock + item.quantity })
            .eq('id', item.product_id)
        }
      }
    }

    // Cancel order
    await supabase
      .from('orders')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', order.id)

    cancelled++
  }

  return new Response(JSON.stringify({ cancelled }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
