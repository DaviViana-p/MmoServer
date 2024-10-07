CREATE TABLE itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,          -- ID único do item no inventário
    idtipo TEXT NOT NULL,                   -- ID do dono do item
    amount INTEGER NOT NULL DEFAULT 1,     -- Quantidade do item
    containerId INTEGER,                      -- Container onde o item está armazenado
    slotId INTEGER DEFAULT 0,              -- Posição do item no inventário
    props TEXT                             -- Propriedades adicionais (JSON ou outra estrutura)
);

-- deletar item
DELETE FROM itens WHERE id = 22;
drop TABLE itens;

--atualizar informações do item 
UPDATE itens 
SET 
    idtipo = 10001, 
    amount = 1, 
    containerId = 7, 
    slotId = 0, 
    props = '{
    "itemName": "Sword of Valor",
    "durability": 100,
    "rarity": "Rare",
    "weight": 2.5,
    "description": "A legendary sword imbued with magical power."
}'
WHERE id = 1;

SELECT * FROM itens WHERE containerId = 1;

--criar novo item 
INSERT INTO itens (idtipo, amount, containerId, slotId, props) 
VALUES ('10002',1,'9',1, '{
    "itemName": "Sword of Valor",
    "durability": 100,
    "rarity": "Rare",
    "weight": 2.5,
    "description": "A legendary sword imbued with magical power."
}');

--mover item de inventario
UPDATE itens 
SET 
    containerId = ?  -- Novo ID do contêiner
WHERE id = ?;      -- ID do item que você deseja mover


