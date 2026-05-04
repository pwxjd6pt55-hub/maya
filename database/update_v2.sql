-- ── MISE À JOUR : ESPACE CLIENT & PROFIL OLFACTIF ──

-- 1. Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client', 'admin') DEFAULT 'client',
  profil_olfactif JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ajouter user_id à la table commandes pour lier l'historique
ALTER TABLE commandes ADD COLUMN user_id INT NULL AFTER reference;
ALTER TABLE commandes ADD CONSTRAINT fk_commande_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Créer un index sur l'email pour des connexions rapides
CREATE INDEX idx_user_email ON users(email);

-- 4. Table des questions du Quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  options JSON NOT NULL, -- Format: [{"label": "...", "valeur": "..."}, ...]
  ordre INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des questions par défaut
INSERT INTO quiz_questions (question, options, ordre) VALUES 
('Quelle ambiance préférez-vous ?', '[{"label": "Une matinée fraîche et rosée", "valeur": "Frais"}, {"label": "Une soirée chaleureuse au coin du feu", "valeur": "Boisé"}, {"label": "Un jardin fleuri sous le soleil", "valeur": "Floral"}, {"label": "Un voyage dans un souk oriental", "valeur": "Oriental"}]', 1),
('Quelle saveur vous attire le plus ?', '[{"label": "Le piquant du citron", "valeur": "Agrumes"}, {"label": "La douceur de la vanille", "valeur": "Gourmand"}, {"label": "La force du poivre", "valeur": "Épicé"}, {"label": "La pureté du linge propre", "valeur": "Musqué"}]', 2),
('Quel trait de caractère vous définit ?', '[{"label": "Mystérieux et profond", "valeur": "Oriental"}, {"label": "Énergique et pétillant", "valeur": "Agrumes"}, {"label": "Élégant et classique", "valeur": "Floral"}, {"label": "Naturel et terreux", "valeur": "Boisé"}]', 3);
