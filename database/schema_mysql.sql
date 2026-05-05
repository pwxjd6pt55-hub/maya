-- ============================================
-- MAYA BAR À SENTEURS — Schéma MySQL complet
-- ============================================

-- Bases de données gérées par Railway


-- ── TABLE ESSENCES ──────────────────────────────
CREATE TABLE IF NOT EXISTS essences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  famille ENUM('Floral','Agrumes','Boisé','Oriental','Gourmand','Musqué','Frais','Épicé') NOT NULL,
  note ENUM('tête','cœur','fond') NOT NULL,
  couleur VARCHAR(7) DEFAULT '#C9A84C',
  description TEXT,
  actif TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── TABLE PARFUMS CATALOGUE ──────────────────────
CREATE TABLE IF NOT EXISTS parfums_catalogue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  marque_inspiree VARCHAR(150),
  famille VARCHAR(100),
  notes_tete TEXT,
  notes_coeur TEXT,
  notes_fond TEXT,
  prix_30ml INT DEFAULT 0,
  prix_50ml INT DEFAULT 0,
  prix_100ml INT DEFAULT 0,
  actif TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── TABLE COMMANDES ──────────────────────────────
CREATE TABLE IF NOT EXISTS commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(20) UNIQUE NOT NULL,
  client_nom VARCHAR(150) NOT NULL,
  client_telephone VARCHAR(20) NOT NULL,
  client_email VARCHAR(150),
  mode_commande ENUM('catalogue','melange') NOT NULL,
  parfum_catalogue_id INT,
  parfum_catalogue_nom VARCHAR(150),
  ml INT DEFAULT 50,
  couleur_parfum VARCHAR(7),
  gravure VARCHAR(30),
  retrait ENUM('boutique','livraison') DEFAULT 'boutique',
  date_souhaitee DATE,
  prix_total INT DEFAULT 0,
  statut ENUM('nouvelle','en_preparation','prete','livree','annulee') DEFAULT 'nouvelle',
  notes_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── TABLE COMMANDE_ESSENCES ──────────────────────
CREATE TABLE IF NOT EXISTS commande_essences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  essence_id INT NOT NULL,
  essence_nom VARCHAR(100),
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
);


-- ============================================
-- DONNÉES INITIALES : ESSENCES (20)
-- ============================================
INSERT INTO essences (nom, famille, note, couleur, description) VALUES
('Rose de Damas', 'Floral', 'cœur', '#E8A0B0', 'Rose intense et veloutée'),
('Jasmin Sambac', 'Floral', 'cœur', '#FFF0A0', 'Jasmin crémeux et envoûtant'),
('Fleur d\'Oranger', 'Floral', 'tête', '#FFD580', 'Fraîche et légèrement mielleuse'),
('Iris Poudrée', 'Floral', 'cœur', '#C8A0D8', 'Poudré, élégant et doux'),
('Bergamote Sicilienne', 'Agrumes', 'tête', '#A8D860', 'Citronné et pétillant'),
('Citron Vert', 'Agrumes', 'tête', '#90E040', 'Vif et tonique'),
('Pamplemousse Rose', 'Agrumes', 'tête', '#FFB0A0', 'Fruité et légèrement amer'),
('Santal de Mysore', 'Boisé', 'fond', '#C8904A', 'Crémeux, chaud et sensuel'),
('Cèdre de l\'Atlas', 'Boisé', 'fond', '#A07840', 'Sec, boisé, masculin'),
('Vétiver d\'Haïti', 'Boisé', 'fond', '#806030', 'Terreux, fumé, profond'),
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

-- ============================================
-- DONNÉES INITIALES : PARFUMS CATALOGUE (12)
-- ============================================
INSERT INTO parfums_catalogue (nom, marque_inspiree, famille, notes_tete, notes_coeur, notes_fond, prix_30ml, prix_50ml, prix_100ml) VALUES
('Sauvage Noir', 'Dior Sauvage', 'Frais Aromatique', 'Bergamote, Poivre', 'Lavande, Géranium', 'Ambroxan, Vétiver', 9500, 14000, 22000),
('Liberté Florale', 'YSL Libre', 'Floral Oriental', 'Mandarine, Lavande', 'Fleur d\'Oranger, Jasmin', 'Vanille, Musc', 10000, 15000, 24000),
('Rose Éternelle', 'Chanel N°5', 'Floral Aldéhydé', 'Aldéhydes, Citron', 'Rose, Jasmin, Iris', 'Santal, Musc, Civet', 10500, 16000, 26000),
('Bois de Soie', 'Tom Ford Oud Wood', 'Boisé Oriental', 'Cardamome, Poivre Rose', 'Oud, Santal', 'Vétiver, Ambre, Musc', 12000, 18000, 28000),
('Jardin de Flore', 'Hermès Un Jardin', 'Floral Frais', 'Pamplemousse, Narcisse', 'Jacinthes, Pivoine', 'Musc Blanc, Cèdre', 9000, 13500, 21000),
('Velours Ambré', 'Maison Margiela Replica', 'Oriental Gourmand', 'Bergamote, Iris', 'Fève Tonka, Vanille', 'Ambre, Musc', 9500, 14500, 23000),
('Bleu Électrique', 'Bleu de Chanel', 'Aromatique Frais', 'Citron, Menthe', 'Gingembre, Noix Muscade', 'Santal, Cèdre', 9500, 14000, 22000),
('Nuit Orientale', 'Lancôme La Nuit Trésor', 'Oriental Gourmand', 'Bergamote, Nectarine', 'Rose, Jasmin, Caramel', 'Vanille, Patchouli, Musc', 9000, 13500, 21000),
('Cuir Nomade', 'Montblanc Explorer', 'Boisé Aromatique', 'Bergamote, Citron Vert', 'Vétiver, Poivre Rose', 'Labdanum, Patchouli', 8500, 12500, 19500),
('Poudre de Soie', 'Viktor & Rolf Flowerbomb', 'Floral Oriental', 'Bergamote, Thé', 'Orchidée, Jasmin, Rose', 'Patchouli, Musc, Vanille', 10000, 15500, 24500),
('Oud Royal', 'Initio Oud for Greatness', 'Oriental Boisé', 'Cardamome Noire, Safran', 'Oud, Encens', 'Musc Animal, Ambre Gris', 13000, 19000, 30000),
('Soleil d\'Afrique', 'Creed Aventus', 'Fruité Boisé', 'Ananas, Pomme Verte', 'Bouleau, Jasmin', 'Chêne, Musc, Ambre', 12000, 18000, 28000);
