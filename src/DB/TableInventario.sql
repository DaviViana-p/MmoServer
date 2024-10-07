-- SQLite
CREATE TABLE inventario (
    conteiner_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INT NOT NULL,
    itens_id TEXT NOT NULL
);



--seleciona todos os itens da table itens de um usuario.
SELECT * FROM itens WHERE containerId = 10000;
--adiciona um novo inventario
INSERT INTO inventario (owner_id, itens_id)
VALUES (2, '');



--atualiza infos do inventario
UPDATE inventario 
    SET conteiner_id = ?, itens_id = ? 
    WHERE owner_id = ?
--deleta o inventario
DELETE FROM inventario WHERE owner_id = 1000
--Adicionando o novo item ao inventrio do jogador
UPDATE inventario 
SET itens_id = itens_id || ',' || '10002' 
WHERE owner_id = 1000 AND conteiner_id = 3; -- Especificando owner_id e conteiner_id

PRAGMA table_info(inventario);
DROP TABLE inventario
