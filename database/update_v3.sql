-- ── UPDATE V3 : PANIER & UPLOADS ──────────────────

-- 1. Ajout de image_url aux essences
ALTER TABLE essences ADD COLUMN image_url TEXT AFTER couleur;

-- 2. Table Panier
CREATE TABLE IF NOT EXISTS panier (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Table Panier Items
CREATE TABLE IF NOT EXISTS panier_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  panier_id INT NOT NULL,
  item_type ENUM('catalogue', 'melange_essences', 'melange_parfums') NOT NULL,
  parfum_catalogue_id INT, -- Si type catalogue ou mélange parfums
  nom_personnalise VARCHAR(150), -- Pour les mélanges
  ml INT NOT NULL,
  prix INT NOT NULL,
  quantite INT DEFAULT 1,
  gravure VARCHAR(30),
  couleur VARCHAR(7),
  essences_json JSON, -- Stocke les IDs/noms des essences si mélange essences
  parfums_json JSON, -- Stocke les IDs/noms des parfums si mélange parfums
  image_url TEXT, -- Pour les mélanges si on génère un visuel (optionnel)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (panier_id) REFERENCES panier(id) ON DELETE CASCADE
);
