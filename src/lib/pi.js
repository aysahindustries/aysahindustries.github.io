// Pi Network payments (User-to-App). Real payments only work inside the Pi Browser.
import { api, MODE } from './api'

const SANDBOX = String(import.meta.env.VITE_PI_SANDBOX ?? 'true') === 'true'
let initDone = false
let authPromise = null

export const piAvailable = () => typeof window !== 'undefined' && !!window.Pi
export const looksLikePiBrowser = () => /PiBrowser/i.test(navigator.userAgent || '')

function init() {
  if (initDone || !piAvailable()) return
  window.Pi.init({ version: '2.0', sandbox: SANDBOX })
  initDone = true
}

function withTimeout(p, ms, msg) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))])
}

async function authenticate() {
  init()
  if (!authPromise) {
    authPromise = withTimeout(
      window.Pi.authenticate(['username', 'payments'], async (payment) => {
        // A payment from a previous visit was not finished: finish it now.
        if (payment?.transaction?.txid) {
          await api.piComplete({ paymentId: payment.identifier, txid: payment.transaction.txid, orderId: payment.metadata?.orderId })
        }
      }),
      20000,
      'PI_TIMEOUT',
    ).catch((e) => {
      authPromise = null
      throw e
    })
  }
  return authPromise
}

/**
 * Pay an order with Pi.
 * @param {{order: object, memo: string, onStatus: (s:string)=>void}} p
 * statuses: authenticating, waiting_approval, waiting_user, completing, paid, cancelled
 */
export async function payWithPi({ order, memo, onStatus }) {
  if (MODE === 'demo') {
    // Simulated flow so the website can be tried before Pi + Supabase are connected.
    onStatus('authenticating')
    await new Promise((r) => setTimeout(r, 600))
    const paymentId = 'demo_' + order.id
    onStatus('waiting_approval')
    await api.piApprove({ orderId: order.id, paymentId })
    onStatus('waiting_user')
    await new Promise((r) => setTimeout(r, 900))
    onStatus('completing')
    await api.piComplete({ orderId: order.id, paymentId, txid: 'demo_tx_' + Date.now().toString(36) })
    onStatus('paid')
    return
  }

  if (!piAvailable()) throw new Error('NOT_PI_BROWSER')
  onStatus('authenticating')
  try {
    await authenticate()
  } catch (e) {
    if (e.message === 'PI_TIMEOUT') throw new Error('NOT_PI_BROWSER')
    throw e
  }

  return new Promise((resolve, reject) => {
    window.Pi.createPayment(
      { amount: Number(order.amount_pi), memo: memo.slice(0, 100), metadata: { orderId: order.id } },
      {
        onReadyForServerApproval: async (paymentId) => {
          onStatus('waiting_approval')
          try {
            await api.piApprove({ paymentId, orderId: order.id })
            onStatus('waiting_user')
          } catch (e) {
            reject(e)
          }
        },
        onReadyForServerCompletion: async (paymentId, txid) => {
          onStatus('completing')
          try {
            await api.piComplete({ paymentId, txid, orderId: order.id })
            onStatus('paid')
            resolve()
          } catch (e) {
            reject(e)
          }
        },
        onCancel: () => {
          onStatus('cancelled')
          resolve('cancelled')
        },
        onError: (error) => reject(error instanceof Error ? error : new Error(String(error?.message || error))),
      },
    )
  })
}
