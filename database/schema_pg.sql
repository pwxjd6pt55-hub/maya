-- ============================================
-- SCHEMA POSTGRESQL POUR MAYA BAR
-- ============================================

-- Suppression des tables si elles existent (attention : vide la base)
-- DROP TABLE IF EXISTS panier_items CASCADE;
-- DROP TABLE IF EXISTS panier CASCADE;
-- DROP TABLE IF EXISTS commandes CASCADE;
-- DROP TABLE IF EXISTS essences CASCADE;
-- DROP TABLE IF EXISTS parfums_catalogue CASCADE;
-- DROP TABLE IF EXISTS quiz_questions CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ESSENCES
CREATE TABLE essences (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  famille VARCHAR(50),
  note VARCHAR(20) CHECK (note IN ('tête', 'cœur', 'fond')),
  couleur VARCHAR(20),
  description TEXT,
  image_url TEXT,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PARFUMS CATALOGUE
CREATE TABLE parfums_catalogue (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  marque_inspiree VARCHAR(100),
  famille VARCHAR(100),
  notes_tete TEXT,
  notes_coeur TEXT,
  notes_fond TEXT,
  prix_30ml DECIMAL(10,2),
  prix_50ml DECIMAL(10,2),
  prix_100ml DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMMANDES
CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  client_nom VARCHAR(100),
  client_telephone VARCHAR(20),
  client_email VARCHAR(100),
  
  mode_commande VARCHAR(50) CHECK (mode_commande IN ('catalogue', 'melange', 'melange_essences', 'melange_parfums')),
  parfum_catalogue_id INT REFERENCES parfums_catalogue(id) ON DELETE SET NULL,
  parfum_catalogue_nom VARCHAR(100),
  
  ml INT,
  gravure VARCHAR(100),
  couleur_parfum VARCHAR(50),
  
  prix_total DECIMAL(10,2),
  statut VARCHAR(30) DEFAULT 'nouvelle' CHECK (statut IN ('nouvelle', 'en_preparation', 'prete', 'livree', 'annulee')),
  retrait VARCHAR(20) CHECK (retrait IN ('boutique', 'livraison')),
  date_souhaitee VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. PANIER
CREATE TABLE panier (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PANIER ITEMS
CREATE TABLE panier_items (
  id SERIAL PRIMARY KEY,
  panier_id INT REFERENCES panier(id) ON DELETE CASCADE,
  item_type VARCHAR(50) CHECK (item_type IN ('catalogue', 'melange', 'melange_essences', 'melange_parfums')),
  parfum_catalogue_id INT REFERENCES parfums_catalogue(id) ON DELETE SET NULL,
  nom_personnalise VARCHAR(150),
  ml INT NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  quantite INT DEFAULT 1,
  gravure VARCHAR(100),
  couleur VARCHAR(50),
  essences_json JSONB,
  parfums_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. QUIZ
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  ordre INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- ESSENCES
INSERT INTO essences (nom, famille, note, couleur, description) VALUES
('Rose de Damas', 'Floral', 'cœur', '#E8A0B0', 'Rose intense et veloutée'),
('Jasmin Sambac', 'Floral', 'cœur', '#FFF0A0', 'Jasmin crémeux et envoûtant'),
('Bergamote Sicilienne', 'Agrumes', 'tête', '#A8D860', 'Citronné et pétillant'),
('Santal de Mysore', 'Boisé', 'fond', '#C8904A', 'Crémeux, chaud et sensuel'),
('Vanille Bourbon', 'Gourmand', 'fond', '#E8C080', 'Douce, chaude et réconfortante');

-- PARFUMS CATALOGUE
INSERT INTO parfums_catalogue (nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml) VALUES
('Sauvage Noir', 'Dior Sauvage', 'Frais Aromatique', 'Bergamote, Poivre', 'Lavande, Géranium', 'Ambroxan, Vétiver', 9500, 14000, 22000),
('Liberté Florale', 'YSL Libre', 'Floral Oriental', 'Mandarine, Lavande', 'Fleur d''Oranger, Jasmin', 'Vanille, Musc', 10000, 15000, 24000);

-- QUIZ
INSERT INTO quiz_questions (question, options, ordre) VALUES
('Quelle ambiance préférez-vous ?', '[{"texte":"Frais et Matinal","essences":["Bergamote","Citron"]},{"texte":"Mystérieux et Oriental","essences":["Oud","Ambre"]}]'::jsonb, 1),
('Quel est votre trait de caractère principal ?', '[{"texte":"Audacieux","essences":["Poivre Noir","Cuir"]},{"texte":"Romantique","essences":["Rose","Jasmin"]}]'::jsonb, 2);
