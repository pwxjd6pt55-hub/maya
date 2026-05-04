# 📧 Guide — Configurer Gmail pour Maya Bar
## En 5 étapes simples (2 minutes)

---

## Pourquoi un "Mot de passe d'application" ?

Google ne laisse pas les applications se connecter avec ton vrai mot de passe — 
c'est pour ta sécurité. Il faut créer un mot de passe spécial juste pour Maya Bar.

---

## Étape 1 — Activer la validation en 2 étapes

1. Va sur **myaccount.google.com**
2. Clique sur **"Sécurité"** dans le menu de gauche
3. Cherche **"Validation en 2 étapes"**
4. Si ce n'est pas encore activé → clique et suis les instructions
   *(nécessaire pour créer un mot de passe d'application)*

---

## Étape 2 — Créer le mot de passe d'application

1. Toujours dans **myaccount.google.com → Sécurité**
2. Cherche **"Mots de passe des applications"**
   *(ou tape directement dans Google : "google app password")*
3. Clique dessus
4. Dans le champ **"Nom"**, tape : `Maya Bar`
5. Clique **"Créer"**
6. Google affiche un code de **16 caractères** : `xxxx xxxx xxxx xxxx`
7. **Copie-le tout de suite** — il ne sera affiché qu'une seule fois !

---

## Étape 3 — Coller dans .env.local

Ouvre le fichier `.env.local` et remplace :

```env
GMAIL_USER=mayabarsenteurs@gmail.com    ← ton vrai email Gmail
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  ← le code de 16 caractères
```

---

## Étape 4 — Tester l'envoi

Lance le projet puis ouvre dans ton navigateur :

```
http://localhost:3000/api/test-email
```

Si tu vois `"Email de test envoyé avec succès !"` → c'est bon ! ✅  
Vérifie ta boîte email Gmail — tu dois avoir reçu un email.

---

## Étape 5 — En cas d'erreur

| Erreur | Solution |
|--------|----------|
| `Invalid login` | Vérifie que tu as bien copié le mot de passe d'application |
| `Username and Password not accepted` | Assure-toi que la validation 2 étapes est activée |
| `Connection timeout` | Vérifie ta connexion internet |
| `Less secure app` | Utilise bien un "mot de passe d'application", pas ton vrai mot de passe |

---

## Ce qui se passe quand une commande arrive

```
Client passe une commande
        ↓
✅ Sauvegardée en base MySQL
        ↓
📧 Email automatique → TOI (admin)
   avec détails complets + boutons d'action rapide
        ↓
📧 Email automatique → CLIENT (si email fourni)
   avec confirmation élégante + récapitulatif
        ↓
💬 Lien WhatsApp généré
   (s'ouvre dans l'app, message pré-rempli)
```

---

## Configuration dans .env.local (résumé)

```env
GMAIL_USER=mayabarsenteurs@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

*Guide créé pour Maya Bar Senteurs — Marrakech* 🌸
