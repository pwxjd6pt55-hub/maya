-- ============================================
-- SCHEMA POSTGRESQL MASTER POUR MAYA BAR (V3 FINAL)
-- ============================================

DROP TABLE IF EXISTS panier_items CASCADE;
DROP TABLE IF EXISTS panier CASCADE;
DROP TABLE IF EXISTS commande_essences CASCADE;
DROP TABLE IF EXISTS commandes CASCADE;
DROP TABLE IF EXISTS essences CASCADE;
DROP TABLE IF EXISTS parfums_catalogue CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS (Avec profil olfactif)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  profil_olfactif JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_email ON users(email);

-- 2. ESSENCES
CREATE TABLE essences (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  famille VARCHAR(50) CHECK (famille IN ('Floral','Agrumes','Boisé','Oriental','Gourmand','Musqué','Frais','Épicé')),
  note VARCHAR(20) CHECK (note IN ('tête', 'cœur', 'fond')),
  couleur VARCHAR(20) DEFAULT '#C9A84C',
  description TEXT,
  image_url TEXT,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PARFUMS CATALOGUE
CREATE TABLE parfums_catalogue (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  marque_inspiree VARCHAR(150),
  famille VARCHAR(100),
  notes_tete TEXT,
  notes_coeur TEXT,
  notes_fond TEXT,
  prix_30ml INT DEFAULT 0,
  prix_50ml INT DEFAULT 0,
  prix_100ml INT DEFAULT 0,
  image_url TEXT,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMMANDES
CREATE TABLE commandes (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(50) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  client_nom VARCHAR(150),
  client_telephone VARCHAR(20),
  client_email VARCHAR(150),
  
  mode_commande VARCHAR(50) CHECK (mode_commande IN ('catalogue', 'melange', 'melange_essences', 'melange_parfums')),
  parfum_catalogue_id INT REFERENCES parfums_catalogue(id) ON DELETE SET NULL,
  parfum_catalogue_nom VARCHAR(150),
  
  ml INT DEFAULT 50,
  gravure VARCHAR(100),
  couleur_parfum VARCHAR(50),
  
  prix_total INT DEFAULT 0,
  statut VARCHAR(30) DEFAULT 'nouvelle' CHECK (statut IN ('nouvelle', 'en_preparation', 'prete', 'livree', 'annulee')),
  retrait VARCHAR(20) CHECK (retrait IN ('boutique', 'livraison')),
  date_souhaitee VARCHAR(50),
  notes_admin TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COMMANDE_ESSENCES (Détail des mélanges par commande)
CREATE TABLE commande_essences (
  id SERIAL PRIMARY KEY,
  commande_id INT REFERENCES commandes(id) ON DELETE CASCADE,
  essence_id INT REFERENCES essences(id) ON DELETE CASCADE,
  essence_nom VARCHAR(100)
);

-- 6. PANIER
CREATE TABLE panier (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PANIER ITEMS
CREATE TABLE panier_items (
  id SERIAL PRIMARY KEY,
  panier_id INT REFERENCES panier(id) ON DELETE CASCADE,
  item_type VARCHAR(50) CHECK (item_type IN ('catalogue', 'melange', 'melange_essences', 'melange_parfums')),
  parfum_catalogue_id INT REFERENCES parfums_catalogue(id) ON DELETE SET NULL,
  nom_personnalise VARCHAR(150),
  ml INT NOT NULL,
  prix INT NOT NULL,
  quantite INT DEFAULT 1,
  gravure VARCHAR(100),
  couleur VARCHAR(50),
  essences_json JSONB,
  parfums_json JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. QUIZ
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  ordre INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fonctions pour mise à jour automatique du updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_panier_updated_at BEFORE UPDATE ON panier FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONNÉES INITIALES COMPLÈTES
-- ============================================

-- ESSENCES (20)
INSERT INTO essences (nom, famille, note, couleur, description) VALUES
('Rose de Damas', 'Floral', 'cœur', '#E8A0B0', 'Rose intense et veloutée'),
('Jasmin Sambac', 'Floral', 'cœur', '#FFF0A0', 'Jasmin crémeux et envoûtant'),
('Fleur d''Oranger', 'Floral', 'tête', '#FFD580', 'Fraîche et légèrement mielleuse'),
('Iris Poudrée', 'Floral', 'cœur', '#C8A0D8', 'Poudré, élégant et doux'),
('Bergamote Sicilienne', 'Agrumes', 'tête', '#A8D860', 'Citronné et pétillant'),
('Citron Vert', 'Agrumes', 'tête', '#90E040', 'Vif et tonique'),
('Pamplemousse Rose', 'Agrumes', 'tête', '#FFB0A0', 'Fruité et légèrement amer'),
('Santal de Mysore', 'Boisé', 'fond', '#C8904A', 'Crémeux, chaud et sensuel'),
('Cèdre de l''Atlas', 'Boisé', 'fond', '#A07840', 'Sec, boisé, masculin'),
('Vétiver d''Haïti', 'Boisé', 'fond', '#806030', 'Terreux, fumé, profond'),
('Oud Arabique', 'Oriental', 'fond', '#603020', 'Oud pur, intense et précieux'),
('Ambre Gris', 'Oriental', 'fond', '#D0A060', 'Chaud, animal et profond'),
('Vanille Bourbon', 'Gourmand', 'fond', '#E8C080', 'Douce, chaude et réconfortante'),
('Caramel Salé', 'Gourmand', 'cœur', '#C07840', 'Gourmand et addictif'),
('Fève Tonka', 'Gourmand', 'fond', '#A05020', 'Amandée, miellée, envoûtante'),
('Musc Blanc', 'Musqué', 'fond', '#F0F0F0', 'Propre, doux, seconde peau'),
('Musc Noir', 'Musqué', 'fond', '#404040', 'Sensuel, profond, magnétique'),
('Menthe Poivrée', 'Frais', 'tête', '#80E0A0', 'Fraîche, vivifiante, intense'),
('Eucalyptus', 'Frais', 'tête', '#A0D0C0', 'Pur, aérien, propre'),
('Poivre Noir', 'Épicé', 'cœur', '#303030', 'Piquant, dynamique, chaud');

-- PARFUMS CATALOGUE (12)
INSERT INTO parfums_catalogue (nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml) VALUES
('Sauvage Noir', 'Dior Sauvage', 'Frais Aromatique', 'Bergamote, Poivre', 'Lavande, Géranium', 'Ambroxan, Vétiver', 9500, 14000, 22000),
('Liberté Florale', 'YSL Libre', 'Floral Oriental', 'Mandarine, Lavande', 'Fleur d''Oranger, Jasmin', 'Vanille, Musc', 10000, 15000, 24000),
('Rose Éternelle', 'Chanel N°5', 'Floral Aldéhydé', 'Aldéhydes, Citron', 'Rose, Jasmin, Iris', 'Santal, Musc, Civet', 10500, 16000, 26000),
('Bois de Soie', 'Tom Ford Oud Wood', 'Boisé Oriental', 'Cardamome, Poivre Rose', 'Oud, Santal', 'Vétiver, Ambre, Musc', 12000, 18000, 28000),
('Jardin de Flore', 'Hermès Un Jardin', 'Floral Frais', 'Pamplemousse, Narcisse', 'Jacinthes, Pivoine', 'Musc Blanc, Cèdre', 9000, 13500, 21000),
('Velours Ambré', 'Maison Margiela Replica', 'Oriental Gourmand', 'Bergamote, Iris', 'Fève Tonka, Vanille', 'Ambre, Musc', 9500, 14500, 23000),
('Bleu Électrique', 'Bleu de Chanel', 'Aromatique Frais', 'Citron, Menthe', 'Gingembre, Noix Muscade', 'Santal, Cèdre', 9500, 14000, 22000),
('Nuit Orientale', 'Lancôme La Nuit Trésor', 'Oriental Gourmand', 'Bergamote, Nectarine', 'Rose, Jasmin, Caramel', 'Vanille, Patchouli, Musc', 9000, 13500, 21000),
('Cuir Nomade', 'Montblanc Explorer', 'Boisé Aromatique', 'Bergamote, Citron Vert', 'Vétiver, Poivre Rose', 'Labdanum, Patchouli', 8500, 12500, 19500),
('Poudre de Soie', 'Viktor & Rolf Flowerbomb', 'Floral Oriental', 'Bergamote, Thé', 'Orchidée, Jasmin, Rose', 'Patchouli, Musc, Vanille', 10000, 15500, 24500),
('Oud Royal', 'Initio Oud for Greatness', 'Oriental Boisé', 'Cardamome Noire, Safran', 'Oud, Encens', 'Musc Animal, Ambre Gris', 13000, 19000, 30000),
('Soleil d''Afrique', 'Creed Aventus', 'Fruité Boisé', 'Ananas, Pomme Verte', 'Bouleau, Jasmin', 'Chêne, Musc, Ambre', 12000, 18000, 28000);

-- QUIZ QUESTIONS
INSERT INTO quiz_questions (question, options, ordre) VALUES 
('Quelle ambiance préférez-vous ?', '[{"label": "Une matinée fraîche et rosée", "valeur": "Frais"}, {"label": "Une soirée chaleureuse au coin du feu", "valeur": "Boisé"}, {"label": "Un jardin fleuri sous le soleil", "valeur": "Floral"}, {"label": "Un voyage dans un souk oriental", "valeur": "Oriental"}]'::jsonb, 1),
('Quelle saveur vous attire le plus ?', '[{"label": "Le piquant du citron", "valeur": "Agrumes"}, {"label": "La douceur de la vanille", "valeur": "Gourmand"}, {"label": "La force du poivre", "valeur": "Épicé"}, {"label": "La pureté du linge propre", "valeur": "Musqué"}]'::jsonb, 2),
('Quel trait de caractère vous définit ?', '[{"label": "Mystérieux et profond", "valeur": "Oriental"}, {"label": "Énergique et pétillant", "valeur": "Agrumes"}, {"label": "Élégant et classique", "valeur": "Floral"}, {"label": "Naturel et terreux", "valeur": "Boisé"}]'::jsonb, 3);
