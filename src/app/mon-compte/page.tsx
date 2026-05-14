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
        quantite: 1
      }),
    })
    setActiveTab('panier')
    fetchData()
  }

  const updateCartItemQuantity = async (itemId: number, quantite: number) => {
    await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantite })
    })
    fetchData()
  }

  const cartTotal = cart.reduce((a, c) => a + ((c.prix || 0) * (c.quantite || 1)), 0)

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
      <nav className="sticky top-0 z-50 bg-[#0D0800]/60 backdrop-blur-xl border-b border-white/[0.03] px-6 py-5 sm:px-12 sm:py-8 flex justify-between items-center">
        <Link href="/" className="font-display text-2xl tracking-tighter hover:text-rose transition-all duration-700">
          MAYA <span className="italic font-light opacity-30">BAR</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 hover:opacity-100 hover:text-rose transition-all px-4 py-2"
        >
          Déconnexion
        </button>
      </nav>

      {/* ── HERO GREETING ── */}
      <div className="px-6 sm:px-12 pt-12 pb-10 max-w-5xl">
        <motion.p
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="text-rose text-[11px] uppercase tracking-[0.6em] font-bold mb-4"
        >
          Espace Membre Privé
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 1 }}
          className="text-4xl sm:text-6xl font-display font-light leading-tight"
        >
          Bienvenue,{' '}
          <span className="italic text-rose">{user?.nom?.split(' ')[0]}</span>
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center gap-4 mt-6"
        >
          <div className="w-8 h-[1px] bg-white/10" />
          <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">{user?.email}</p>
        </motion.div>
      </div>

      {/* ── TABS ── */}
      <div className="px-6 sm:px-12 mb-10 max-w-2xl">
        <div className="flex gap-2 bg-white/[0.02] p-1.5 rounded-[20px] border border-white/[0.05]">
          {(['commandes', 'panier'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 rounded-[15px] text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${
                activeTab === tab
                  ? 'bg-rose text-white shadow-[0_10px_30px_rgba(188,124,124,0.3)]'
                  : 'text-white/20 hover:text-white/50 hover:bg-white/[0.02]'
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
                    className="glass-card p-8 space-y-6"
                  >
                    {/* Row 1: Reference + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-rose font-bold uppercase tracking-[0.4em]">
                        #{order.reference}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full"
                        style={{ color: st.color, background: st.bg, border: `1px solid ${st.color}22` }}
                      >
                        {st.label}
                      </span>
                    </div>
 
                    {/* Row 2: Perfume name + details */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-display font-medium leading-snug">
                        {order.parfum_catalogue_nom || 'Création Personnalisée'}
                      </h3>
                      <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span>{new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{order.ml}ml</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>{order.mode_commande === 'catalogue' ? 'Catalogue' : 'Sur mesure'}</span>
                      </p>
                      {order.gravure && (
                        <p className="text-[11px] italic text-rose/60 mt-4 tracking-wide bg-rose/5 px-4 py-3 rounded-xl border border-rose/10 inline-block">✍️ &quot;{order.gravure}&quot;</p>
                      )}
                    </div>
 
                    {/* Row 3: Price + Reorder */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                      <span className="text-xl font-display font-bold text-[#D4AF37]">
                        {order.prix_total?.toLocaleString()} F
                      </span>
                      <button
                        onClick={() => handleReorder(order)}
                        className="btn-outline !py-3 !px-6 !text-[9px] !rounded-[15px] opacity-60 hover:opacity-100"
                      >
                        ↺ Recommander
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
                      className="glass-card p-6 flex items-center justify-between gap-6"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-display font-medium truncate">
                          {item.nom_personnalise || 'Mélange Personnalisé'}
                        </div>
                        <div className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                          <span>{item.ml}ml</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span>{item.item_type?.replace('_', ' ')}</span>
                        </div>
                        {item.gravure && (
                          <div className="text-[10px] italic text-rose/50 mt-3 font-light">✍️ &quot;{item.gravure}&quot;</div>
                        )}
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="flex items-center gap-3 bg-white/[0.03] rounded-full px-3 py-1.5 border border-white/[0.05]">
                          <button onClick={() => updateCartItemQuantity(item.id, (item.quantite || 1) - 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all">-</button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantite || 1}</span>
                          <button onClick={() => updateCartItemQuantity(item.id, (item.quantite || 1) + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-all">+</button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-lg font-display font-bold text-[#D4AF37]">
                            {((item.prix || 0) * (item.quantite || 1)).toLocaleString()} F
                          </div>
                        </div>
                        <button onClick={() => updateCartItemQuantity(item.id, 0)} className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/5 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}

                   {/* TOTAL + CTA */}
                  <div className="glass-card !bg-rose/5 !border-rose/20 p-8 space-y-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] uppercase tracking-[0.4em] text-white/40 font-bold">Total Estimation</span>
                      <span className="text-3xl font-display font-bold text-rose">
                        {cartTotal.toLocaleString()} F
                      </span>
                    </div>
                    <Link href="/checkout" className="block">
                      <button className="btn-gold w-full !py-5 !text-[11px]">
                        Commander maintenant
                      </button>
                    </Link>
                    <Link href="/configurateur" className="block text-center text-[9px] uppercase tracking-[0.5em] text-white/20 hover:text-rose transition-all py-2">
                      + Ajouter une autre création
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── BOTTOM NAV (mobile) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D0800]/80 backdrop-blur-xl border-t border-white/[0.03] px-6 py-6 flex gap-4 z-50 lg:hidden">
        <Link href="/" className="flex-1">
          <button className="w-full py-4 rounded-2xl border border-white/10 text-[9px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-rose hover:border-rose/30 transition-all bg-white/[0.02]">
            Accueil
          </button>
        </Link>
        <Link href="/configurateur" className="flex-1">
          <button className="w-full py-4 rounded-2xl border border-white/10 text-[9px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-rose hover:border-rose/30 transition-all bg-white/[0.02]">
            Créer
          </button>
        </Link>
        {cart.length > 0 && (
          <Link href="/checkout" className="flex-1">
            <button className="btn-gold !py-4 !text-[9px] !rounded-2xl shadow-[0_10px_30px_rgba(188,124,124,0.3)]">
              Payer ({cart.length})
            </button>
          </Link>
        )}
      </div>

      <style jsx global>{`
        body { -webkit-tap-highlight-color: transparent; }
        * { -webkit-font-smoothing: antialiased; }
        .glass-card { 
          background: rgba(255, 255, 255, 0.02); 
          backdrop-filter: blur(40px); 
          border: 1px solid rgba(255, 255, 255, 0.05); 
          border-radius: 40px; 
          transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>
    </div>
  )
}
