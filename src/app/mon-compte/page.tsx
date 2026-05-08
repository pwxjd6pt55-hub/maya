'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  nouvelle:       { label: 'Nouvelle',       color: '#BC7C7C', bg: 'rgba(188,124,124,0.12)' },
  en_preparation: { label: 'En préparation', color: '#C9A84C', bg: 'rgba(201,168,76,0.12)'  },
  prete:          { label: 'Prête',          color: '#6FC48A', bg: 'rgba(111,196,138,0.12)' },
  livree:         { label: 'Livrée ✓',       color: '#6FC48A', bg: 'rgba(111,196,138,0.12)' },
  annulee:        { label: 'Annulée',        color: '#999',    bg: 'rgba(153,153,153,0.10)' },
}

export default function AccountElite() {
  const [user, setUser]     = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [cart, setCart]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'commandes' | 'panier'>('commandes')

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) { setUser(d.user); fetchData() }
        else window.location.href = '/connexion'
      })
  }, [])

  const fetchData = async () => {
    try {
      const [resO, resC] = await Promise.all([
        fetch('/api/commandes').then(r => r.json()),
        fetch('/api/cart').then(r => r.json()),
      ])
      if (resO.success) setOrders(resO.data || [])
      if (resC.success) setCart(resC.items || [])
    } catch (e: unknown) { console.error(e) }
    setLoading(false)
  }

  const handleLogout = () =>
    fetch('/api/auth', { method: 'DELETE' }).then(() => (window.location.href = '/'))

  const handleReorder = async (order: any) => {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_type: order.mode_commande,
        parfum_catalogue_id: order.parfum_catalogue_id,
        nom_personnalise: order.parfum_catalogue_nom,
        ml: order.ml,
        prix: order.prix_total,
        gravure: order.gravure,
      }),
    })
    setActiveTab('panier')
    fetchData()
  }

  const cartTotal = cart.reduce((a, c) => a + (c.prix || 0), 0)

  /* ── LOADING ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0D0800] flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="text-rose font-display text-xl tracking-[0.4em] uppercase italic"
      >
        Maya Bar…
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0800] text-[#F9F5F2] font-body flex flex-col">

      {/* ── HEADER ── */}
      <nav className="sticky top-0 z-50 bg-[#0D0800]/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex justify-between items-center">
        <Link href="/" className="font-display text-xl tracking-tighter hover:text-rose transition-colors">
          MAYA <span className="italic font-light opacity-30">BAR</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity px-3 py-2"
        >
          Déconnexion
        </button>
      </nav>

      {/* ── HERO GREETING ── */}
      <div className="px-5 pt-10 pb-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-rose text-[10px] uppercase tracking-[0.4em] font-bold mb-2"
        >
          Espace Membre Privé
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl font-display font-light leading-tight"
        >
          Bienvenue,{' '}
          <span className="italic text-rose">{user?.nom}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/30 text-xs mt-2"
        >
          {user?.email}
        </motion.p>
      </div>

      {/* ── TABS ── */}
      <div className="px-5 mb-6">
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
          {(['commandes', 'panier'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-rose text-white shadow-lg shadow-rose/20'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {tab === 'commandes' ? `Commandes (${orders.length})` : `Panier (${cart.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="flex-1 px-5 pb-28">
        <AnimatePresence mode="wait">

          {/* ── TAB: COMMANDES ── */}
          {activeTab === 'commandes' && (
            <motion.div
              key="commandes"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {orders.length === 0 ? (
                <div className="py-20 text-center text-white/20 italic text-sm">
                  Aucune commande pour le moment.
                </div>
              ) : orders.map((order, i) => {
                const st = statusConfig[order.statut] || statusConfig['nouvelle']
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5 space-y-4"
                  >
                    {/* Row 1: Reference + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-rose font-bold uppercase tracking-widest">
                        #{order.reference}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {st.label}
                      </span>
                    </div>

                    {/* Row 2: Perfume name + details */}
                    <div>
                      <h3 className="text-base font-display font-medium leading-snug">
                        {order.parfum_catalogue_nom || 'Création Personnalisée'}
                      </h3>
                      <p className="text-[11px] text-white/30 uppercase tracking-widest mt-1">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })} · {order.ml}ml ·{' '}
                        {order.mode_commande === 'catalogue' ? 'Catalogue' : 'Sur mesure'}
                      </p>
                      {order.gravure && (
                        <p className="text-[11px] italic text-white/40 mt-1">✍️ &quot;{order.gravure}&quot;</p>
                      )}
                    </div>

                    {/* Row 3: Price + Reorder */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-lg font-display font-bold text-[#C9A84C]">
                        {order.prix_total?.toLocaleString()} F
                      </span>
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-rose transition-colors px-3 py-2 rounded-xl border border-white/10 hover:border-rose/30"
                      >
                        ↺ <span>Recommander</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* ── TAB: PANIER ── */}
          {activeTab === 'panier' && (
            <motion.div
              key="panier"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-6">
                  <p className="text-white/20 italic text-sm">Votre panier est vide.</p>
                  <Link
                    href="/configurateur"
                    className="inline-block text-[10px] uppercase tracking-widest font-bold text-rose border border-rose/30 px-6 py-3 rounded-full hover:bg-rose hover:text-white transition-all"
                  >
                    Créer un parfum →
                  </Link>
                </div>
              ) : (
                <>
                  {cart.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {item.nom_personnalise || 'Mélange Personnalisé'}
                        </div>
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                          {item.ml}ml · {item.item_type?.replace('_', ' ')}
                        </div>
                        {item.gravure && (
                          <div className="text-[10px] italic text-white/30 mt-0.5">✍️ &quot;{item.gravure}&quot;</div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-display font-bold text-[#C9A84C]">
                          {item.prix?.toLocaleString()} F
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* TOTAL + CTA */}
                  <div className="bg-rose/5 border border-rose/20 rounded-3xl p-5 space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] uppercase tracking-widest text-white/40 font-bold">Total</span>
                      <span className="text-2xl font-display font-bold text-rose">
                        {cartTotal.toLocaleString()} F
                      </span>
                    </div>
                    <Link href="/checkout" className="block">
                      <button className="w-full py-4 bg-rose text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#A66B6B] transition-all active:scale-95">
                        Commander maintenant →
                      </button>
                    </Link>
                    <Link href="/configurateur" className="block text-center text-[10px] uppercase tracking-widest text-white/20 hover:text-white/60 transition-colors py-1">
                      + Ajouter un parfum
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0800]/95 backdrop-blur-md border-t border-white/5 px-5 py-4 flex gap-3 z-50">
        <Link href="/configurateur" className="flex-1">
          <button className="w-full py-3 rounded-2xl border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-rose hover:border-rose/30 transition-all">
            ✦ Créer
          </button>
        </Link>
        {cart.length > 0 && (
          <Link href="/checkout" className="flex-1">
            <button className="w-full py-3 rounded-2xl bg-rose text-white text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-rose/20 active:scale-95 transition-all">
              Commander ({cart.length})
            </button>
          </Link>
        )}
      </div>

      <style jsx global>{`
        body { -webkit-tap-highlight-color: transparent; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  )
}
