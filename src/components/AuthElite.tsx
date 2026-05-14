'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthElite({ type = 'login' }: { type?: 'login' | 'register' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const endpoint = type === 'login' ? '/api/auth' : '/api/auth/register'
    const body = type === 'login' ? { email, password } : { nom, email, password }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        window.location.href = data.role === 'admin' ? '/admin-maya-2026' : '/'
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0D0800] text-[#F9F5F2] font-body flex relative overflow-hidden">
      
      {/* ── BACKGROUND IMMERSIF ── */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
         <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80" 
          alt="Luxe Maya" 
          className="w-full h-full object-cover grayscale opacity-20" 
         />
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0D0800]/50 to-[#0D0800]" />
         <div className="absolute bottom-24 left-24 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <h1 className="font-display text-8xl mb-4 tracking-tighter">MAYA <span className="italic text-rose">BAR</span></h1>
              <p className="text-[10px] uppercase tracking-[1em] text-rose font-bold opacity-60">L&apos;Excellence Olfactive</p>
            </motion.div>
         </div>
      </div>

      {/* ── FORMULAIRE ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative z-10">
         <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
         >
            <div className="mb-16">
               <h2 className="text-5xl font-display font-light mb-6">
                {type === 'login' ? <><span className="italic">Connexion</span> à l&apos;Atelier</> : <>Rejoindre le <span className="italic text-rose">Cercle</span></>}
               </h2>
               <div className="flex items-center gap-4">
                 <div className="w-8 h-[1px] bg-white/10" />
                 <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-light">
                  {type === 'login' ? 'Entrez dans votre univers de senteurs.' : 'Créez votre profil olfactif unique.'}
                 </p>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               {type === 'register' && (
                 <div className="space-y-3">
                    <label className="text-[9px] uppercase tracking-[0.6em] text-rose font-bold ml-1">Nom Complet</label>
                    <input 
                      required
                      value={nom}
                      onChange={e => setNom(e.target.value)}
                      className="luxury-input w-full"
                      placeholder="Ex: Amara Traoré"
                    />
                 </div>
               )}
               <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.6em] text-rose font-bold ml-1">Adresse Email</label>
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="votre@email.com"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[9px] uppercase tracking-[0.6em] text-rose font-bold ml-1">Mot de Passe</label>
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="••••••••"
                  />
               </div>

               {error && (
                 <motion.p 
                  initial={{ opacity: 0, x: -5 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="text-rose text-[9px] uppercase tracking-widest font-bold bg-rose/5 p-4 rounded-xl border border-rose/10"
                 >
                   ⚠️ {error}
                 </motion.p>
               )}

               <button 
                type="submit" 
                disabled={loading}
                className="btn-gold w-full py-6 mt-10 disabled:opacity-30 relative group overflow-hidden"
               >
                 <span className="relative z-10">{loading ? 'AUTHENTIFICATION...' : type === 'login' ? 'S\'AUTHENTIFIER' : 'CRÉER MON COMPTE'}</span>
                 <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22, 1, 0.36, 1]" />
               </button>
            </form>

            <div className="mt-16 text-center space-y-10">
               <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
                  {type === 'login' ? "Vous n'avez pas de compte ?" : "Déjà membre ?"}
                  <Link href={type === 'login' ? '/inscription' : '/connexion'} className="text-rose ml-3 hover:text-white transition-colors">
                    {type === 'login' ? "S'inscrire" : "Se connecter"}
                  </Link>
               </p>
               <div className="pt-8 border-t border-white/[0.03]">
                  <Link href="/" className="text-[9px] uppercase tracking-[0.5em] text-white/10 hover:text-rose transition-all">← Retour à l&apos;accueil</Link>
               </div>
            </div>
         </motion.div>
      </div>

      <style jsx global>{`
        .luxury-input {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px 28px;
          border-radius: 20px;
          outline: none;
          transition: all 0.5s ease;
          font-size: 14px;
          color: white;
          font-family: var(--font-body);
        }
        .luxury-input:focus {
          border-color: rgba(188, 124, 124, 0.4);
          background: rgba(188, 124, 124, 0.03);
          box-shadow: 0 0 30px rgba(188, 124, 124, 0.05);
        }
        .btn-gold {
          background: #BC7C7C;
          color: white;
          font-family: var(--font-body);
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-gold:hover {
          color: black;
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(188, 124, 124, 0.3);
        }
      `}</style>
    </div>
  )
}
