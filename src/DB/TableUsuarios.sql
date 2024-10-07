-- SQLite
-- SQLite
CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    characterinfo TEXT,
    accountID INTEGER NOT NULL,
    map_id INTEGER DEFAULT 0  -- Adicionando a coluna map_id
);

ALTER TABLE characters ADD COLUMN posX INTEGER DEFAULT 0;
ALTER TABLE characters ADD COLUMN posY INTEGER DEFAULT 0;
ALTER TABLE characters ADD COLUMN posZ INTEGER DEFAULT 0;

CREATE TABLE contas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,         -- Armazena o inventário em formato de texto (JSON ou CSV, por exemplo)
    senha TEXT NOT NULL
    
);

ALTER TABLE characters ADD COLUMN transform TEXT;

UPDATE characters 
SET characterinfo = '{"level":0,"posX":-547,"posY":4462,"posZ":-289,"currentMap":"1"}'
WHERE id = 3;

UPDATE characters 
SET map_id = '1'
WHERE id = 3;


--cadastra novo usuario
INSERT INTO characters (nome, inventario, characterinfo, accountID)
    VALUES ('admin', '', '', 1)


INSERT INTO contas (nome, email, senha)
    VALUES ('admin', 'admin@gmail.com', 'admin')


--atualiza o usuario
UPDATE usuarios SET 
    nome = COALESCE(?, nome), 
    inventario = COALESCE(?, inventario), 
    characterinfo = COALESCE(?, characterinfo) 
    WHERE id = ?
--deleta o usuario
DELETE FROM usuarios WHERE id = ?

DROP TABLE characters