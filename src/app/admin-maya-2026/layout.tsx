import React from 'react'

export const metadata = {
  title: 'Maya Bar | Gestion',
  description: 'Espace Administrateur Maya Bar à Senteurs',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-root bg-[#0D0800] min-h-screen text-[#F7F1E8]">
      {children}
    </div>
  )
}
