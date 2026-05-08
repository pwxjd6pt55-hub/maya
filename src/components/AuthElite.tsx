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
        window.location.href = data.role === 'admin' ? '/admin-maya-2026' : '/mon-compte'
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
      <div className="hidden lg:block w-1/2 relative">
         <img src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80" alt="Luxe Maya" className="w-full h-full object-cover grayscale opacity-40" />
         <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0800]" />
         <div className="absolute bottom-20 left-20">
            <h1 className="font-display text-8xl mb-4 tracking-tighter">MAYA <span className="italic text-rose">BAR</span></h1>
            <p className="text-[11px] uppercase tracking-[0.8em] text-rose font-bold">L&apos;Excellence Olfactive</p>
         </div>
      </div>

      {/* ── FORMULAIRE ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative z-10">
         <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
         >
            <div className="mb-12">
               <h2 className="text-4xl font-display mb-4">{type === 'login' ? 'Connexion à l&apos;Atelier' : 'Rejoindre le Cercle'}</h2>
               <p className="text-white/30 text-sm font-light uppercase tracking-widest">{type === 'login' ? 'Entrez dans votre univers de senteurs.' : 'Créez votre profil olfactif unique.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {type === 'register' && (
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Nom Complet</label>
                    <input 
                      required
                      value={nom}
                      onChange={e => setNom(e.target.value)}
                      className="luxury-input w-full"
                      placeholder="Ex: Amara Traoré"
                    />
                 </div>
               )}
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Adresse Email</label>
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="votre@email.com"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-rose font-bold">Mot de Passe</label>
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="luxury-input w-full"
                    placeholder="••••••••"
                  />
               </div>

               {error && <p className="text-rose text-[10px] uppercase tracking-widest font-bold">{error}</p>}

               <button 
                type="submit" 
                disabled={loading}
                className="btn-gold w-full py-6 mt-8 disabled:opacity-30"
               >
                 {loading ? 'AUTHENTIFICATION...' : type === 'login' ? 'S&apos;AUTHENTIFIER' : 'CRÉER MON COMPTE'}
               </button>
            </form>

            <div className="mt-12 text-center">
               <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
                  {type === 'login' ? "Vous n'avez pas de compte ?" : "Déjà membre ?"}
                  <Link href={type === 'login' ? '/inscription' : '/connexion'} className="text-rose ml-2 hover:underline">
                    {type === 'login' ? "S'inscrire" : "Se connecter"}
                  </Link>
               </p>
               <div className="mt-8">
                  <Link href="/" className="text-[9px] uppercase tracking-widest text-white/10 hover:text-white transition-colors">← Retour au site</Link>
               </div>
            </div>
         </motion.div>
      </div>

      <style jsx global>{`
        .luxury-input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(188, 124, 124, 0.1);
          padding: 20px 24px;
          border-radius: 20px;
          outline: none;
          transition: all 0.5s ease;
          font-size: 14px;
          color: white;
        }
        .luxury-input:focus {
          border-color: #BC7C7C;
          background: rgba(188, 124, 124, 0.05);
          box-shadow: 0 0 40px rgba(188, 124, 124, 0.1);
        }
        .btn-gold {
          background: #BC7C7C;
          color: white;
          font-family: var(--font-display);
          font-weight: 500;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-gold:hover {
          background: white;
          color: black;
          transform: translateY(-8px);
          box-shadow: 0 30px 60px rgba(188, 124, 124, 0.2);
        }
      `}</style>
    </div>
  )
}
