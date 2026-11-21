// Step 2 of a Pi payment: the client signed the blockchain transaction -> complete it and mark the order paid.
import { context, cors, json, pi } from '../_shared/pi.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { paymentId, txid, orderId } = await req.json()
    const { admin, user } = await context(req)
    if (!user) return json({ error: 'Not signed in' }, 401)

    // Find the order (by id, or by payment id when finishing an interrupted payment).
    let q = admin.from('orders').select('*')
    q = orderId ? q.eq('id', orderId) : q.eq('payment_id', paymentId)
    const { data: order } = await q.maybeSingle()
    if (!order || order.user_id !== user.id) return json({ error: 'Order not found' }, 404)

    const payment = await pi(`/payments/${paymentId}`)
    if (Number(payment.amount) !== Number(order.amount_pi)) return json({ error: 'Amount does not match the order' }, 400)

    if (!payment.status?.developer_completed) await pi(`/payments/${paymentId}/complete`, 'POST', { txid })
    await admin.from('orders')
      .update({ payment_id: paymentId, txid, status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', order.id)
    return json({ ok: true })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
