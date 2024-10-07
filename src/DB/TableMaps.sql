-- SQLite
CREATE TABLE maps (
  map_id INT NOT NULL,
  gatherables_id JSON NOT NULL,
  npcs_id JSON NOT NULL,
  respawns JSON NOT NULL
);


--CRIA O MAPA COM TODAS AS INFO
--Map id integer gatherables(id e transform) nps(id e transform) respawns (id:localização)
INSERT INTO maps (map_id, gatherables_id, npcs_id, respawns)
VALUES (2, 
        '1:101.238.111,2:102.223.233,3:103.232.232.323',
        '1:111.232.444,2:202.222.222,3:203.555.666', 
        '1:111.232.444,2:202.222.222,3:203.555.666');

DELETE FROM inventario;
DROP TABLE IF EXISTS maps;

--deleta um mapa
DELETE FROM maps 
WHERE map_id = 1;

--adiciona mais um campo a tabela maps
ALTER TABLE maps 
ADD COLUMN respawns JSON;

ALTER TABLE maps 
DROP COLUMN respawns;

DROP TABLE maps;


