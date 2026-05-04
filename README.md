# 🌸 Maya Bar à Senteurs — Site Web

> 1er Bar à Parfums du Togo • Lomé, Togo

## Structure du projet

```
maya-bar/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Page d'accueil
│   │   ├── configurateur/        ← Configurateur de parfum
│   │   │   └── page.tsx
│   │   ├── admin/                ← Tableau de bord admin
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── essences/         ← API essences
│   │       ├── parfums/          ← API catalogue parfums
│   │       └── commandes/        ← API commandes (GET/POST/PATCH)
│   └── lib/
│       └── db.ts                 ← Connexion MySQL
├── database/
│   └── schema_mysql.sql          ← Schéma complet + données initiales
└── .env.local                    ← Variables d'environnement
```

## 🚀 Installation pas à pas

### 1. Prérequis
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- MySQL Workbench ([mysql.com](https://dev.mysql.com/downloads/workbench/))

### 2. Base de données
1. Ouvrir **MySQL Workbench**
2. `File > Open SQL Script` → ouvrir `database/schema_mysql.sql`
3. Cliquer sur **Execute ⚡** (éclair)
4. La base `maya_bar` est créée avec toutes les données

### 3. Configuration
```bash
# Copier le fichier d'environnement
cp .env.local .env.local

# Modifier avec vos identifiants MySQL :
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=votre_mot_de_passe
# DB_NAME=maya_bar
```

### 4. Lancement
```bash
npm install
npm run dev
```

Ouvrir → http://localhost:3000

## 📱 Pages

| URL | Description |
|-----|-------------|
| `/` | Page d'accueil |
| `/configurateur` | Configurateur de parfum (catalogue + mélange) |
| `/admin` | Tableau de bord (mot de passe: `mayabar2024`) |

## ⚙️ Fonctionnement sans base de données

Si MySQL n'est pas encore connecté, les APIs retournent automatiquement des **données de démonstration**. Le site fonctionne à 100%, les commandes partent bien sur WhatsApp mais ne sont pas sauvegardées en base.

## 🔧 Personnalisation

### Ajouter une nouvelle essence
Dans MySQL Workbench :
```sql
INSERT INTO essences (nom, famille, note, couleur, description)
VALUES ('Jasmin Blanc', 'Floral', 'coeur', '#FFFFF0', 'Jasmin délicat et pur');
```

### Ajouter un parfum catalogue
```sql
INSERT INTO parfums_catalogue (nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml)
VALUES ('Mon Nouveau Parfum', 'Marque Inspirée', 'Floral', 'Notes tête', 'Notes coeur', 'Notes fond', 9000, 14000, 22000);
```

### Changer le mot de passe admin
Dans `src/app/admin/page.tsx`, ligne ~68 :
```typescript
if (motDePasse === 'mayabar2024') {  // ← Changer ici
```

## 🚢 Déploiement (Production)

1. **Vercel** (recommandé) — gratuit, rapide
   ```bash
   npm install -g vercel
   vercel
   ```
2. **Base de données** — Railway MySQL (gratuit)
   - railway.app → New Project → MySQL
   - Récupérer les credentials → `.env.local`

---
*Développé pour Maya Bar à Senteurs, Lomé, Togo 🇹🇬*
