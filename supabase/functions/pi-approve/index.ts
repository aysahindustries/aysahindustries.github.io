// Step 1 of a Pi payment: check it matches the client's order, then approve it with Pi.
import { context, cors, json, pi } from '../_shared/pi.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { paymentId, orderId } = await req.json()
    const { admin, user } = await context(req)
    if (!user) return json({ error: 'Not signed in' }, 401)

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle()
    if (!order || order.user_id !== user.id) return json({ error: 'Order not found' }, 404)
    if (order.status !== 'pending') return json({ error: `Order is ${order.status}` }, 400)

    const payment = await pi(`/payments/${paymentId}`)
    if (Number(payment.amount) !== Number(order.amount_pi)) return json({ error: 'Amount does not match the order' }, 400)
    if (payment.metadata?.orderId !== orderId) return json({ error: 'Payment is for another order' }, 400)

    await pi(`/payments/${paymentId}/approve`, 'POST')
    await admin.from('orders').update({ payment_id: paymentId, status: 'approved' }).eq('id', orderId)
    return json({ ok: true })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
