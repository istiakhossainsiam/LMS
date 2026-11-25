import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Award,
  CheckCircle2,
  Download,
  Flame,
  Gift,
  Lock,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trophy,
} from 'lucide-react'
import { apiFetch } from '../lib/api'
import { useAppStore, bf } from '../stores/useAppStore'

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { lang, user, showToast } = useAppStore()
  const courseId = searchParams.get('course') ? Number(searchParams.get('course')) : undefined
  const bundleId = searchParams.get('bundle') ? Number(searchParams.get('bundle')) : undefined
  const variantId = searchParams.get('variant') ? Number(searchParams.get('variant')) : undefined
  const initialGift = searchParams.get('gift') === '1'

  const [gateway, setGateway] = useState<any>(null)
  const [itemInfo, setItemInfo] = useState<{ title: string; price: number } | null>(null)
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash')
  const [senderNumber, setSenderNumber] = useState('')
  const [trxId, setTrxId] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [discountPct, setDiscountPct] = useState(0)
  const [isGift, setIsGift] = useState(initialGift)
  const [giftEmail, setGiftEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiFetch('/billing/gateway-config').then(setGateway).catch(() => {})
    if (courseId) {
      apiFetch(`/public/courses/${courseId}`).then((c) => {
        const v = variantId ? (c.variants || []).find((x: any) => x.id === variantId) : null
        setItemInfo({
          title: v ? `${c.title} (${v.variant_type})` : c.title,
          price: v ? v.price : c.price,
        })
      })
    } else if (bundleId) {
      apiFetch('/public/home').then((h) => {
        const b = (h.bundles || []).find((x: any) => x.id === bundleId)
        if (b) setItemInfo({ title: `Bundle: ${b.title}`, price: b.price })
      })
    }
  }, [courseId, bundleId, variantId])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    try {
      const res = await apiFetch('/billing/promo/validate', {
        method: 'POST',
        body: JSON.stringify({ code: promoCode }),
      })
      setDiscountPct(res.discount_percentage)
      showToast(`Promo ${res.code} applied (${res.discount_percentage}% OFF)!`, 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      showToast('Please sign in to complete enrollment.', 'info')
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      const res = await apiFetch('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          bundle_id: bundleId,
          variant_id: variantId,
          method,
          sender_number: senderNumber,
          transaction_id: trxId,
          promo_code: promoCode,
          is_gift: isGift,
          gift_email: isGift ? giftEmail : undefined,
        }),
      })
      showToast(`Invoice ${res.invoice_number} submitted for verification!`, 'success')
      navigate('/dashboard')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const basePrice = itemInfo?.price || 2500
  const finalAmount = Math.round(basePrice * (1 - discountPct / 100))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <div className="aurora-card-raised rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44]">
        <div className="border-b border-[#E0D3AF] dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-[#F97316] dark:text-[#F97316] font-bold">
              Verified MFS & Gateway Checkout
            </span>
            <h1 className="font-display font-bold text-2xl text-[#0F2A44] dark:text-[#FFF7E8] mt-0.5">
              {itemInfo?.title || 'Course Enrollment Checkout'}
            </h1>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-2xl text-[#0F2A44] dark:text-[#FFF7E8]">৳{finalAmount.toLocaleString()}</div>
            {discountPct > 0 && (
              <div className="text-xs font-mono text-[#F97316] font-bold">{discountPct}% Promo Applied</div>
            )}
          </div>
        </div>

        {/* Dynamic Official Wallet Numbers from Database */}
        {gateway && (
          <div className="p-4 rounded-2xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 space-y-3">
            <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] leading-relaxed">
              {lang === 'bn' ? gateway.manual_instructions_bn : gateway.manual_instructions}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30">
                <div className="font-bold text-pink-600 dark:text-pink-400">bKash ({gateway.manual_bkash_type})</div>
                <div className="text-sm font-bold text-[#0F2A44] dark:text-[#FFF7E8] mt-0.5">
                  {gateway.manual_bkash_number}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div className="font-bold text-orange-600 dark:text-orange-400">Nagad ({gateway.manual_nagad_type})</div>
                <div className="text-sm font-bold text-[#0F2A44] dark:text-[#FFF7E8] mt-0.5">
                  {gateway.manual_nagad_number}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
                <div className="font-bold text-orange-600 dark:text-orange-400">Rocket Personal</div>
                <div className="text-sm font-bold text-[#0F2A44] dark:text-[#FFF7E8] mt-0.5">
                  {gateway.manual_rocket_number}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promo Code Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-[#6B7280] dark:text-[#D9CDB8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo Code (e.g. PUNDIT25)"
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 font-mono text-xs uppercase text-[#0F2A44] dark:text-[#FFF7E8]"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyPromo}
            className="min-h-[44px] px-5 rounded-xl aurora-btn-primary text-xs font-semibold cursor-pointer tactile-press"
          >
            Apply Promo
          </button>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`min-h-[44px] rounded-xl border font-semibold text-xs cursor-pointer transition-all ${
                  method === m
                    ? 'border-[#F97316] bg-[#F97316]/15 text-[#F97316] dark:border-[#FB923C] dark:bg-[#F97316]/15 dark:text-[#F97316] font-bold'
                    : 'border-[#E0D3AF] dark:border-slate-800 text-[#6B7280] dark:text-[#D9CDB8]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] dark:text-[#D9CDB8] mb-1 font-medium">Sender Wallet Number</label>
              <input
                type="tel"
                required
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-base font-mono text-[#0F2A44] dark:text-[#FFF7E8]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] dark:text-[#D9CDB8] mb-1 font-medium">Transaction ID (TrxID)</label>
              <input
                type="text"
                required
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="BKX984210LM"
                className="w-full min-h-[46px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-base font-mono uppercase text-[#0F2A44] dark:text-[#FFF7E8]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer pt-1 text-[#0F2A44] dark:text-[#FFF7E8]">
            <input
              type="checkbox"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="w-4 h-4 accent-[#F97316]"
            />
            <Gift className="w-4 h-4 text-amber-500" />
            <span>Buy this course as a Gift (Generates a redeemable Gift Code)</span>
          </label>

          {isGift && (
            <input
              type="email"
              required
              value={giftEmail}
              onChange={(e) => setGiftEmail(e.target.value)}
              placeholder="Recipient's Email Address (friend@example.com)"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-base text-[#0F2A44] dark:text-[#FFF7E8]"
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[50px] rounded-2xl aurora-btn-primary font-semibold text-sm sm:text-base tactile-press cursor-pointer shadow-sm"
          >
            {submitting ? 'Submitting Payment...' : `Submit Payment (৳${finalAmount.toLocaleString()})`}
          </button>
        </form>
      </div>
    </div>
  )
}

export const DigitalStorePage: React.FC = () => {
  const navigate = useNavigate()
  const { lang, user, showToast } = useAppStore()
  const [products, setProducts] = useState<any[]>([])
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [selectedProd, setSelectedProd] = useState<any>(null)
  const [sender, setSender] = useState('')
  const [trxId, setTrxId] = useState('')

  const loadStore = () => {
    apiFetch('/store/products').then(setProducts).catch(() => {})
    if (user) {
      apiFetch('/store/my-orders').then(setMyOrders).catch(() => {})
    }
  }

  useEffect(() => {
    loadStore()
  }, [user])

  const handleStoreCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      await apiFetch('/store/checkout', {
        method: 'POST',
        body: JSON.stringify({
          product_id: selectedProd.id,
          payment_method: 'bKash',
          sender_number: sender,
          transaction_id: trxId,
        }),
      })
      showToast(
        'Order submitted with status=Pending! Once verified by Admin, your Signed Media Vault link unlocks.',
        'success'
      )
      setSelectedProd(null)
      setSender('')
      setTrxId('')
      loadStore()
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-orange-500 font-semibold">
          Protected Digital Asset Vault
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 dark:text-white">
          {lang === 'bn' ? 'ইঞ্জিনিয়ারিং ই-বুক, সোর্স কোড ও ডিজাইন কিট' : 'Engineering Handbooks, SaaS Kits & Tokens'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Secured by Signed JWT Vault Tokens — Direct unauthenticated file access & fake payment bypasses are blocked.
        </p>
      </div>

      {/* My Purchased & Pending Store Orders */}
      {myOrders.length > 0 && (
        <div className="rounded-2xl border border-[#F97316]/30 bg-[#F97316]/5 p-5 space-y-3">
          <h2 className="font-display font-bold text-base text-[#0F2A44] dark:text-[#FFF7E8] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F97316]" />
            <span>{lang === 'bn' ? 'আপনার ডিজিটাল অর্ডার ও ডাউনলোড ভল্ট' : 'Your Digital Orders & Signed Vault Downloads'}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myOrders.map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-xl bg-[#FBF3DC] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-[#0F2A44] dark:text-[#FFF7E8]">
                    {o.product_title}
                  </div>
                  <div className="text-[11px] font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                    TrxID: {o.transaction_id} • Status: {o.status}
                  </div>
                </div>
                {o.is_paid && o.download_token ? (
                  <a
                    href={`/api/v1/vault/download/${o.download_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[38px] px-3.5 rounded-xl aurora-btn-primary text-xs font-bold flex items-center gap-1.5 tactile-press shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Vault Download</span>
                  </a>
                ) : (
                  <span className="px-2.5 py-1 rounded aurora-pill-accent font-mono text-xs font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pending Approval
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="aurora-card rounded-2xl overflow-hidden flex flex-col justify-between border border-[#E0D3AF] dark:border-slate-800 shadow-sm hover:border-[#F97316] dark:hover:border-[#FB923C] transition-all bg-[#FBF3DC] dark:bg-[#102A44]"
          >
            <div>
              <div className="aspect-video bg-[#0A1E33] relative">
                <img src={p.thumbnail_url} alt={bf(p, 'title', lang)} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#0A1E33]/90 text-[#FFF7E8] font-mono text-[11px] uppercase border border-slate-700/60">
                  {p.category}
                </span>
              </div>
              <div className="p-5 space-y-2.5">
                <h3 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8]">
                  {bf(p, 'title', lang)}
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] leading-relaxed">
                  {bf(p, 'short_description', lang)}
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 space-y-3">
              <div className="pt-3 border-t border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between">
                <span className="font-mono font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                  ৳{p.price.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">{p.sales_count} copies sold</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProd(p)}
                className="w-full min-h-[44px] rounded-xl aurora-btn-primary text-xs font-semibold flex items-center justify-center gap-1.5 tactile-press cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অর্ডার করুন' : 'Purchase Digital Asset'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProd && (
        <div className="fixed inset-0 z-50 bg-[#0A1E33]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleStoreCheckout}
            className="w-full max-w-md rounded-2xl aurora-card-raised border border-[#E0D3AF] dark:border-slate-800 p-6 space-y-4 shadow-md bg-[#FBF3DC] dark:bg-[#102A44]"
          >
            <h3 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8]">
              Verify Purchase: {bf(selectedProd, 'title', lang)}
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] font-mono">
              Amount: ৳{selectedProd.price} • Send Money to Official bKash 01711-223344
            </p>
            <input
              type="tel"
              required
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="Sender bKash Number (017XXXXXXXX)"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-base font-mono text-[#0F2A44] dark:text-[#FFF7E8]"
            />
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="Transaction ID (TrxID)"
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 text-base font-mono uppercase text-[#0F2A44] dark:text-[#FFF7E8]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProd(null)}
                className="min-h-[42px] px-4 rounded-xl aurora-btn-secondary text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl aurora-btn-primary text-xs font-semibold cursor-pointer shadow-md"
              >
                Submit for Verification
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { lang, showToast } = useAppStore()
  const [certId, setCertId] = useState(searchParams.get('id') || 'LWMA-2026A1')
  const [certData, setCertData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (idToLookup: string) => {
    if (!idToLookup.trim()) return
    setLoading(true)
    try {
      const res = await apiFetch(`/public/certificates/verify/${encodeURIComponent(idToLookup.trim())}`)
      setCertData(res)
    } catch (err: any) {
      setCertData(null)
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (certId) handleVerify(certId)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-accent font-mono text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Official Credential Registry
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#0F2A44] dark:text-[#FFF7E8]">
          {lang === 'bn' ? 'সার্টিফিকেট ভেরিফিকেশন পোর্টাল' : 'Instant Certificate & QR Verification'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8] max-w-lg mx-auto">
          Cryptographically registered serial keys verified against our tamper-proof student credential database.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleVerify(certId)
        }}
        className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
      >
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="Enter Certificate ID (e.g. LWMA-2026A1)"
          className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[#FBF3DC] dark:bg-[#16324F] border border-[#E0D3AF] dark:border-slate-800 font-mono text-base uppercase text-[#0F2A44] dark:text-[#FFF7E8] focus:outline-hidden focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-[48px] px-6 rounded-2xl aurora-btn-primary text-sm font-semibold flex items-center justify-center gap-2 tactile-press cursor-pointer shadow-md shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Verify Credential'}</span>
        </button>
      </form>

      {certData && (
        <div className="rounded-2xl border-2 border-[#F97316]/40 aurora-card-raised p-6 sm:p-10 shadow-md space-y-6 relative overflow-hidden bg-[#FBF3DC] dark:bg-[#102A44]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E0D3AF] dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-[#F97316] font-bold flex items-center gap-1">
                  AUTHENTICATED & VERIFIED CREDENTIAL
                </span>
                <h2 className="font-display font-bold text-xl text-[#0F2A44] dark:text-[#FFF7E8]">
                  {certData.verification_authority}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[42px] px-4 rounded-xl aurora-btn-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-[#0F2A44] dark:text-[#FFF7E8]" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <div className="text-center py-6 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#6B7280] dark:text-[#D9CDB8]">
              This is to certify that
            </p>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-[#0F2A44] dark:text-[#FFF7E8]">
              {certData.student_name}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-[#D9CDB8] max-w-lg mx-auto">
              has successfully completed all video lectures, server-verified assessments, and practical milestones for
            </p>
            <div className="font-display font-bold text-xl sm:text-2xl text-[#F97316] dark:text-[#F97316]">
              {bf(certData, 'course_name', lang)}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#E0D3AF] dark:border-slate-800 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F]/60 border border-[#E0D3AF] dark:border-slate-800">
              <span className="text-[#6B7280] dark:text-[#D9CDB8] block text-[11px]">Certificate ID</span>
              <span className="font-bold text-[#0F2A44] dark:text-[#FFF7E8]">{certData.certificate_id}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F]/60 border border-[#E0D3AF] dark:border-slate-800">
              <span className="text-[#6B7280] dark:text-[#D9CDB8] block text-[11px]">Assessment Score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{certData.grade_score}%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F]/60 border border-[#E0D3AF] dark:border-slate-800">
              <span className="text-[#6B7280] dark:text-[#D9CDB8] block text-[11px]">Lead Instructor</span>
              <span className="font-bold text-[#0F2A44] dark:text-[#FFF7E8]">{certData.instructor_name}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E9D9B4] dark:bg-[#16324F]/60 border border-[#E0D3AF] dark:border-slate-800">
              <span className="text-[#6B7280] dark:text-[#D9CDB8] block text-[11px]">Issue Date</span>
              <span className="font-bold text-[#0F2A44] dark:text-[#FFF7E8]">
                {new Date(certData.issued_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const LeaderboardPage: React.FC = () => {
  const { lang } = useAppStore()
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    apiFetch('/public/leaderboard').then(setEntries).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-accent font-mono text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Gamified Merit Ranking
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#0F2A44] dark:text-[#FFF7E8]">
          {lang === 'bn' ? 'টপ লার্নার লিডারবোর্ড' : 'Top Learners Leaderboard'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8]">
          Real-time student milestones, continuous learning streaks, and practical project XP scores.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E0D3AF] dark:divide-slate-800">
          {entries.map((item) => (
            <div key={item.user_id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#E9D9B4] dark:hover:bg-[#16324F]/40 transition-colors">
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-xl font-mono font-bold text-sm flex items-center justify-center shrink-0 ${
                    item.rank === 1
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : item.rank === 2
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-950 dark:text-white'
                      : item.rank === 3
                      ? 'bg-amber-700/60 text-white'
                      : 'bg-[#E9D9B4] dark:bg-[#16324F] text-[#6B7280] dark:text-[#D9CDB8] border border-[#E0D3AF] dark:border-slate-800'
                  }`}
                >
                  #{item.rank}
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base text-[#0F2A44] dark:text-[#FFF7E8]">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-[#D9CDB8]">{item.occupation}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Flame className="w-4 h-4" /> {item.streak}d
                </span>
                <span className="px-3 py-1 rounded-full aurora-pill-accent font-bold">
                  {item.total_xp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const BlogPage: React.FC = () => {
  const { lang } = useAppStore()
  const [posts, setPosts] = useState<any[]>([])
  const [selectedPost, setSelectedPost] = useState<any>(null)

  useEffect(() => {
    apiFetch('/blog/posts').then(setPosts).catch(() => {})
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill-accent font-mono text-xs font-semibold uppercase tracking-wider">
          Engineering & Security Journal
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-[#0F2A44] dark:text-[#FFF7E8]">
          {lang === 'bn' ? 'টেকনিক্যাল আর্টিকেল ও গাইডলাইন' : 'Architecture & Career Articles'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#D9CDB8]">
          Deep dives on full-stack architecture, DevOps, security, and career advancement from senior engineers.
        </p>
      </div>

      {selectedPost ? (
        <article className="rounded-2xl border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] p-6 sm:p-10 space-y-6 shadow-md">
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            className="text-xs font-mono text-[#F97316] dark:text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
          >
            ← Back to all articles
          </button>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0F2A44] dark:text-[#FFF7E8]">
            {bf(selectedPost, 'title', lang)}
          </h2>
          <div className="text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8] flex items-center gap-3">
            <span>By {selectedPost.author_name}</span>
            <span>•</span>
            <span>{selectedPost.read_time_minutes} min read</span>
          </div>
          <div
            className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-4 text-[#0F2A44] dark:text-[#D9CDB8]"
            dangerouslySetInnerHTML={{ __html: bf(selectedPost, 'content', lang) }}
          />
        </article>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((p) => (
            <article
              key={p.id}
              onClick={() => setSelectedPost(p)}
              className="aurora-card rounded-2xl border border-[#E0D3AF] dark:border-slate-800 bg-[#FBF3DC] dark:bg-[#102A44] overflow-hidden cursor-pointer hover:border-[#F97316] dark:hover:border-[#FB923C] transition-all group shadow-sm flex flex-col"
            >
              <div className="aspect-video bg-[#0A1E33] overflow-hidden">
                <img src={p.cover_image_url} alt={bf(p, 'title', lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[#F97316] dark:text-[#F97316] font-semibold mb-1">
                    {bf(p, 'category', lang)} • {p.read_time_minutes} min read
                  </div>
                  <h2 className="font-display font-bold text-lg text-[#0F2A44] dark:text-[#FFF7E8] group-hover:text-[#F97316] dark:group-hover:text-[#FB923C] transition-colors">
                    {bf(p, 'title', lang)}
                  </h2>
                  <p className="text-xs text-[#6B7280] dark:text-[#D9CDB8] line-clamp-2 mt-2 leading-relaxed">
                    {bf(p, 'excerpt', lang)}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E0D3AF] dark:border-slate-800 flex items-center justify-between text-xs font-mono text-[#6B7280] dark:text-[#D9CDB8]">
                  <span>{p.author_name}</span>
                  <span className="text-[#F97316] dark:text-[#F97316] font-semibold">Read Article →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
