'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (data.success) {
        if (data.role === 'admin') router.push('/admin')
        else router.push('/configurateur')
      } else {
        setError(data.error || 'Identifiants incorrects')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-deep-brown flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 w-full max-w-[450px] relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl text-gold mb-4 inline-block">Maya Bar</Link>
          <h1 className="font-display text-4xl font-light text-cream">Bon retour</h1>
          <p className="text-cream/40 text-sm mt-4 uppercase tracking-widest">Connexion à votre espace</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 text-xs mb-8 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">Email</label>
            <input 
              required
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all text-cream"
              placeholder="votre@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-gold/60 ml-1">Mot de passe</label>
            <input 
              required
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-5 focus:border-gold outline-none transition-all text-cream"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="btn-gold w-full py-5 mt-4"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-10">
          <p className="text-cream/40 text-xs">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-gold hover:underline">S&apos;inscrire</Link>
          </p>
          <div className="mt-8 pt-8 border-t border-white/5">
             <Link href="/configurateur" className="text-[9px] uppercase tracking-widest text-cream/30 hover:text-cream transition-colors">
               Commander en tant qu&apos;invité →
             </Link>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
