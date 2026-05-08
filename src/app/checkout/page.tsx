'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CheckoutElite() {
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deliveryMethod, setDeliveryMethod] = useState<'livraison' | 'retrait'>('livraison')
  
  // Form State
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  })
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderRef, setOrderRef] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const [cartRes, authRes] = await Promise.all([
          fetch('/api/cart').then(r => r.json()),
          fetch('/api/auth').then(r => r.json())
        ])
        if (cartRes.success) setCart(cartRes.items || [])
        else window.location.href = '/connexion'
        if (authRes.authenticated && authRes.user) {
          setFormData(prev => ({ 
            ...prev, 
            nom: authRes.user.nom || '', 
            email: authRes.user.email || '' 
          }))
        }
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    init()
  }, [])

  const total = cart.reduce((a, c) => a + (c.prix || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          prix_total: total,
          ...formData,
          mode_livraison: deliveryMethod
        })
      })
      const data = await res.json()
      if (data.success) {
        setOrderRef(data.reference)
        setOrderComplete(true)

        // Build detailed lines for each cart item
        const itemLines = cart.map((item: any, i: number) => {
          const essences = (() => {
            try {
              const parsed = typeof item.essences_json === 'string'
                ? JSON.parse(item.essences_json)
                : item.essences_json
              return Array.isArray(parsed) && parsed.length > 0
                ? parsed.map((e: any) => e.nom).join(', ')
                : null
            } catch { return null }
          })()

          const parfums = (() => {
            try {
              const parsed = typeof item.parfums_json === 'string'
                ? JSON.parse(item.parfums_json)
                : item.parfums_json
              return Array.isArray(parsed) && parsed.length > 0
                ? parsed.map((p: any) => p.nom).join(' + ')
                : null
            } catch { return null }
          })()

          const typeLabel =
            item.item_type === 'catalogue' ? '🏺 Parfum Catalogue'
            : item.item_type === 'melange_essences' ? '🌸 Création Pure (Essences)'
            : item.item_type === 'melange_parfums' ? '✨ Mélange Signature'
            : '🎨 Création Personnalisée'

          let details = `━━━ Article ${i + 1} ━━━\n`
          details += `📦 Type : ${typeLabel}\n`
          if (item.nom_personnalise) details += `🏷️ Nom : ${item.nom_personnalise}\n`
          if (essences) details += `🌿 Essences : ${essences}\n`
          if (parfums) details += `💧 Parfums mélangés : ${parfums}\n`
          details += `📏 Contenance : ${item.ml}ml\n`
          if (item.gravure) details += `✍️ Gravure laser : "${item.gravure}"\n`
          if (item.couleur) details += `🎨 Couleur du flacon : ${item.couleur}\n`
          details += `💰 Prix : ${item.prix?.toLocaleString()} F`
          return details
        }).join('\n\n')

        const deliveryLine = deliveryMethod === 'livraison'
          ? `🚚 Livraison\n📍 Adresse : ${formData.adresse}`
          : `🏪 Retrait en boutique`

        const references = data.references || [data.reference]
        const refLine = references.length > 1
          ? `📋 Références : ${references.join(', ')}`
          : `📋 Référence : #${data.reference}`

        const message = encodeURIComponent(
          `✨ *NOUVELLE COMMANDE — MAYA BAR* ✨\n\n` +
          `${refLine}\n` +
          `👤 Client : ${formData.nom}\n` +
          `📞 Téléphone : ${formData.telephone}\n` +
          `📧 Email : ${formData.email}\n\n` +
          `${itemLines}\n\n` +
          `━━━━━━━━━━━━━━━━━\n` +
          `${deliveryLine}\n` +
          `💳 *TOTAL : ${total.toLocaleString()} F*\n\n` +
          `Veuillez confirmer ma création ! 🏺`
        )
        const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '22870993597'}?text=${message}`

        await fetch('/api/cart?all=true', { method: 'DELETE' })
        setTimeout(() => { window.open(whatsappUrl, '_blank') }, 2000)
      } else {
        alert("Erreur lors de la commande: " + (data.error || "Inconnu"))
      }
    } catch (e) { console.error(e); alert("Erreur de connexion"); }
    setLoading(false)
  }

  if (orderComplete) return (
    <div className="min-h-screen bg-[#0D0800] flex items-center justify-center p-8 text-center">
       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-16 max-w-xl space-y-8">
          <div className="w-24 h-24 bg-rose rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-rose/20">✨</div>
          <h2 className="text-4xl font-display italic">Commande Confirmée</h2>
          <p className="text-white/40 text-sm font-light">Merci <span className="text-rose font-bold">{formData.nom}</span>, votre commande est enregistrée.</p>
          <div className="pt-8 space-y-4">
             <button 
               onClick={() => window.open(`https://wa.me/22870993597?text=${encodeURIComponent('Bonjour Maya Bar, je souhaite confirmer ma commande #' + orderRef)}`, '_blank')}
               className="w-full py-5 bg-[#25D366] text-white rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all"
             >
                <span>📱</span> CONFIRMER SUR WHATSAPP
             </button>
             <Link href="/mon-compte" className="block text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-colors mt-6">Voir mon historique</Link>
          </div>
       </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0800] text-[#F9F5F2] font-body flex flex-col selection:bg-rose/40">
      <nav className="p-10 border-b border-white/5 flex justify-between items-center">
         <Link href="/" className="font-display text-2xl tracking-tighter">MAYA <span className="italic font-light opacity-30">BAR</span></Link>
         <Link href="/configurateur" className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity">Retour au configurateur</Link>
      </nav>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20">
         
         <div className="space-y-12">
            <div>
               <h2 className="text-4xl font-display font-light mb-4 italic">Finalisation</h2>
               <p className="text-white/30 text-sm font-light uppercase tracking-widest">Informations de livraison et contact</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Votre Nom</label>
                     <input required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="luxury-input w-full" placeholder="Prénom Nom" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Email</label>
                     <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="luxury-input w-full" placeholder="email@exemple.com" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Téléphone (WhatsApp)</label>
                  <input required type="tel" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} placeholder="+228 XX XX XX XX" className="luxury-input w-full" />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Mode de Réception</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => setDeliveryMethod('livraison')} className={`p-6 rounded-2xl border transition-all text-left ${deliveryMethod === 'livraison' ? 'bg-rose border-rose text-white shadow-xl shadow-rose/20' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        <div className="text-xl mb-2">🚚</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">Livraison</div>
                     </button>
                     <button type="button" onClick={() => setDeliveryMethod('retrait')} className={`p-6 rounded-2xl border transition-all text-left ${deliveryMethod === 'retrait' ? 'bg-rose border-rose text-white shadow-xl shadow-rose/20' : 'bg-white/5 border-white/10 text-white/40'}`}>
                        <div className="text-xl mb-2">🏪</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest">Retrait</div>
                     </button>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                 {deliveryMethod === 'livraison' ? (
                   <motion.div key="livraison" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Lieu de livraison</label>
                      <textarea required value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} placeholder="Quartier, repères visuels..." className="luxury-input w-full h-32 resize-none" />
                   </motion.div>
                 ) : (
                   <motion.div key="retrait" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-rose/5 border border-rose/20 rounded-3xl">
                      <p className="text-sm italic font-light">Votre création vous attendra à la boutique Maya Bar (Lomé). Nous vous confirmerons l&apos;heure de retrait.</p>
                   </motion.div>
                 )}
               </AnimatePresence>

               <button type="submit" disabled={loading || cart.length === 0} className="btn-gold w-full py-6 mt-10">
                  {loading ? 'TRAITEMENT...' : `CONFIRMER — ${total.toLocaleString()} F`}
               </button>
            </form>
         </div>

         <div className="space-y-10">
            <div className="glass-card p-10 space-y-8 sticky top-32">
               <h3 className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Votre Sélection</h3>
               <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
                       <div className="space-y-1">
                          <div className="text-sm font-medium">{item.nom_personnalise || 'Mélange'}</div>
                          <div className="text-[9px] text-white/20 uppercase tracking-widest">{item.ml}ml · {item.item_type}</div>
                       </div>
                       <div className="text-sm font-display text-gold">{item.prix?.toLocaleString()} F</div>
                    </div>
                  ))}
               </div>
               <div className="pt-10 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xl font-display italic">Total</span>
                  <span className="text-3xl font-display font-bold text-rose">{total.toLocaleString()} F</span>
               </div>
            </div>
         </div>
      </main>

      <style jsx global>{`
        .glass-card { background: rgba(18, 13, 10, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 40px; }
        .luxury-input { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(188, 124, 124, 0.1); padding: 20px 24px; border-radius: 20px; outline: none; transition: all 0.5s ease; font-size: 14px; color: white; }
        .luxury-input:focus { border-color: #BC7C7C; background: rgba(188, 124, 124, 0.05); }
        .btn-gold { background: #BC7C7C; color: white; font-family: var(--font-display); font-weight: 500; letter-spacing: 0.3em; text-transform: uppercase; transition: all 0.5s ease; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-gold:hover { background: #A66B6B; transform: translateY(-5px); box-shadow: 0 20px 40px rgba(188, 124, 124, 0.3); }
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #BC7C7C; }
      `}</style>
    </div>
  )
}
