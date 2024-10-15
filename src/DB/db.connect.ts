import sqlite3 from 'sqlite3';
import { characters} from '../interfaces/characters.interface';
import { contas } from '../interfaces/contas.interface'; 
import { inventario } from '../interfaces/inventario.interface'; 
import { CharacterInfoFormat } from './characterinfoformat';
import {Item} from '../interfaces/BaseItem'


// Conexão com o banco de dados SQLite
//const db = new sqlite3.Database('/home/ec2-user/mmoserver/src/DB/meu_banco.db', (err) => {
const db = new sqlite3.Database('src/DB/meu_banco.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    }
});


// Função para criar uma nova conta
export function createAccount(nome: string, email: string, senha: string, callback: (user: contas | null) => void) {
    // Primeiro, verifique se o e-mail já está em uso
    userExists(email, (exists) => {
        if (exists) {
            console.log(`User with email ${email} already exists.`);
            callback(null);  // E-mail já existe, não cria a conta
            return;
        }

        // Inserindo o novo usuário
        const newUser: contas = {
            id: 0,  // O banco de dados autoincrementará este campo
            nome,
            email,
            senha
        };

        db.run(`INSERT INTO contas (nome, email, senha) VALUES (?, ?, ?)`,
            [newUser.nome, newUser.email, newUser.senha],
            function(err) {
                if (err) {
                    console.error(err.message);
                    callback(null);  // Em caso de erro, retornamos null
                    return;
                }
                newUser.id = this.lastID;  // ID gerado pelo banco de dados
                callback(newUser);  // Retorna o novo usuário criado
            }
        );
    });
}


// Função para verificar se o usuário existe no banco de dados
export function userExists(email: string, callback: (exists: boolean) => void) {
    db.get(`SELECT id FROM contas WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(false);  // Em caso de erro, retornamos false
        } else {
            callback(!!row);  // Se `row` existir, retorna true, senão retorna false
        }
    });
}

// Função para carregar o personagem pelo accountId
export function loadCharacter(accountId: string, callback: (character: characters | null) => void) {
    db.get(`SELECT * FROM characters WHERE accountID = ?`, [accountId], (err, row: characters) => {
        if (err) {
            console.error(err.message);
            callback(null);  // Em caso de erro, retornamos null
        } else if (row) {
            const character: characters = {
                id: row.id,                 // Aqui, 'row' agora é reconhecido como um objeto do tipo 'characters'
                nome: row.nome,
                characterinfo: row.characterinfo,
                accountID: row.accountID,
                map_id: row.map_id

            };
            callback(character);
        } else {
            callback(null);  // Nenhum personagem encontrado
        }
    });
}

// Função para criar um novo personagem
// Função para criar um novo personagem
export function createCharacter(accountId: number, playerName: string, initialLevel: number, callback: (character: characters | null) => void) {
    // Criando a estrutura de characterinfo com dados detalhados
    const characterInfoJson:string = `{
        "name": "${playerName}",
        "aparence": "Cavaleiro",
        "status": {
            "forca": 5,
            "destreza": 5,
            "vitalidade": 5,
            "magia": 5
        },
        "tags": ["Novato", "Tester"],
        "gameplayVariables": {
            "transform": { 
                "x": 0, "y": 0, "z": 0, 
                "xr": 0, "yr": 0, "zr": 0, 
                "ex": 1, "ey": 1, "er": 1 
            },
            "velocity": { "x": 1, "y": 1, "z": 1 },
            "atualMap": "1",
            "containers": { "container1": ["item1", "item2"] }
        },
        "conjuracao": {
            "magiaSagrada": 0,
            "magiaDeAgua": 0,
            "magiaDeFogo": 0,
            "magiaDeAr": 0,
            "necromancia": 0,
            "cura": 0,
            "metamagia": 0
        },
        "especializacaoCombate": {
            "guerreiro": 0,
            "mago": 0,
            "sacerdote": 0,
            "assassino": 0
        },
        "habilidades": ["criarchama", "criaragua"],
        "magias": { "fireball": 2, "waterball": 3 },
        "profissoes": {
            "pescador": 0,
            "pintor": 0,
            "bardo": 0,
            "dancarino": 0,
            "cozinheiro": 0,
            "herbalista": 0,
            "mestreDasBestas": 0,
            "alfaiate": 0,
            "construtor": 0,
            "alquimista": 0,
            "comerciante": 0
        },
        "equipamentos": {
        "elmo": "Iron Helmet",
        "peitoral": "Iron Chestplate",
        "calca": "Iron Pants",
        "bota": "Iron Boots",
        "aneis": "Gold Ring",
        "capa": "Red Cloak",
        "colar": "Silver Necklace",
        "amuleto": "Mystic Amulet"
    },
        "quests": { "Iniciando no Mundo": "completa", "Primeiros Passos": "incompleta" },
        "craftsMemorizados": { "picareta": "picareta grande", "mesa": "mesa normal" }
    }`;

    const newCharacter: characters = {
        id: 0,  // O banco de dados autoincrementará este campo
        nome: playerName,
        characterinfo: characterInfoJson, // Usando o JSON com informações detalhadas
        accountID: accountId,
        map_id: 1
    };

    // Insere o personagem no banco de dados
    db.run(`INSERT INTO characters (nome, characterinfo, accountID, map_id) 
            VALUES (?, ?, ?, ?)`, 
            [newCharacter.nome, newCharacter.characterinfo, newCharacter.accountID, newCharacter.map_id],
            function(err) {
                if (err) {
                    console.error("Erro ao criar personagem:", err.message);
                    return callback(null); // Retorna null se ocorrer erro
                }

                // Após inserir o personagem, pegamos o ID gerado automaticamente
                newCharacter.id = this.lastID;

                // Agora criamos o inventário para o personagem
                db.run(`INSERT INTO inventario (owner_id, itens_id) VALUES (?, ?)`,
                    [newCharacter.id, ''],  // Owner_id será o ID do personagem criado e o inventário começa vazio
                    function(err) {
                        if (err) {
                            console.error("Erro ao criar inventário:", err.message);
                        } else {
                            console.log(`Inventário criado para o personagem com ID ${newCharacter.id}`);
                        }

                        // Retorna o novo personagem criado (com inventário já associado)
                        callback(newCharacter);
                    });
            });
}
 

export function getPasswordByEmail(email: string, callback: (password: string | null) => void) {
    db.get<contas>(`SELECT senha FROM contas WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(null);  // Em caso de erro, retornamos null
        } else if (row) {
            callback(row.senha);  // Agora TypeScript sabe que `row` tem a propriedade `senha`
        } else {
            callback(null);  // Nenhum usuário encontrado
        }
    });
}

export function getUserByEmail(email: string, callback: (contas: contas | null) => void) {
    db.get<contas>(`SELECT * FROM contas WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(null);  // Em caso de erro, retornamos null
        } else if (row) {
            callback(row);  // Retorna o usuário completo
        } else {
            callback(null);  // Nenhum usuário encontrado
        }
    });
}

export function getCharactersByAccountId(accountId: number, callback: (charactersList: characters[] | null) => void) { 
    db.all(`SELECT * FROM characters WHERE accountID = ?`, [accountId], (err, rows: any[]) => {  // Define 'rows' como um array de objetos não tipados
        if (err) {
            console.error(err.message);
            callback(null);  // Em caso de erro, retornamos null
        } else if (rows && rows.length > 0) {
            const charactersList: characters[] = rows.map(row => ({
                id: row.id,
                nome: row.nome,
                characterinfo: row.characterinfo,  // A propriedade characterinfo deve existir no banco de dados
                accountID: row.accountID,
                map_id: row.map_id

            }));
            callback(charactersList);  // Retorna a lista de personagens como um array de objetos characters[]
        } else {
            callback(null);  // Nenhum personagem encontrado
        }
    });
}

// Função para obter um personagem pelo ID
export function getCharacterById(characterId: number, callback: (character: characters | null) => void) { 
    db.get<characters>(`SELECT * FROM characters WHERE id = ?`, [characterId], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(null);  // Em caso de erro, retornamos null
        } else if (row) {
            try {
                // Verifica se characterinfo está definido e é um JSON válido
                const characterInfo = row.characterinfo ? JSON.parse(row.characterinfo) : {};

                // Retorna o personagem como um objeto do tipo characters
                const character: characters = {
                    id: row.id,
                    nome: row.nome,
                    characterinfo: row.characterinfo,
                    accountID: row.accountID,
                    map_id: row.map_id, // Incluindo o map_id
                    transform: row.transform
                };
                callback(character);  
            } catch (parseError) {
                console.error('Error parsing characterinfo:', parseError);
                callback(null);  // Em caso de erro no parsing, retornamos null
            }
        } else {
            callback(null);  // Nenhum personagem encontrado
        }
    });
}



export function getAllMaps(callback: (maps: any[]) => void) {
    const sql = 'SELECT * FROM maps';

    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });

}

export function updateCharacterInfo(characterId: number, newCharacterInfo: string, callback: (success: boolean) => void): void {
    db.run(
        `UPDATE characters SET characterinfo = ? WHERE id = ?`,
        [newCharacterInfo, characterId],
        function (err) {
            if (err) {
                console.error(`Erro ao atualizar characterinfo do personagem com ID ${characterId}: ${err.message}`);
                callback(false);  // Retorna false em caso de erro
            } else {
               // console.log(`Characterinfo do personagem com ID ${characterId} atualizado com sucesso.`);
                callback(true);  // Retorna true em caso de sucesso
            }
        }
    );
}

export function updateCharacterMapId(characterId: number, newMapId: string, callback: (success: boolean) => void): void {
    db.run(
        `UPDATE characters SET map_id = ? WHERE id = ?`,
        [newMapId, characterId],
        function (err) {
            if (err) {
                // console.error(`Erro ao atualizar map_id do personagem com ID ${characterId}: ${err.message}`);
                callback(false);  // Retorna false em caso de erro
            } else {
                // console.log(`map_id do personagem com ID ${characterId} atualizado com sucesso.`);
                callback(true);  // Retorna true em caso de sucesso
            }
        }
    );
}

// Função para buscar os containerId e os itens associados a esses containerId
export function getContainerIdsByOwnerId(ownerId: number, callback: (items: any[] | null, containerIds:any[]) => void) {
    // Buscar todos os conteiner_id associados ao owner_id na tabela inventario
    db.all(`SELECT conteiner_id FROM inventario WHERE owner_id = ?`, [ownerId], (err, rows: any[]) => {
        if (err) {
            console.error('Erro ao buscar conteiner_id:', err.message);
            callback(null,[]); // Em caso de erro, retorna null
            return;
        }
        
        if (rows.length === 0) {
            console.log('Nenhum inventário encontrado para esse owner_id.');
            callback([],[]);  // Nenhum inventário encontrado, retorna array vazio
            return;
        }
        //console.log('row lengh:',rows.length)
        // Extrair todos os conteiner_id encontrados
        const containerIds: number[] = rows.map(row => row.conteiner_id);
        //console.log(`containerIds encontrados: ${containerIds}`);  // Exibir os conteiner_id encontrados

        // Se não houver conteiner_id, retorna vazio
        if (containerIds.length === 0) {
            console.log('Nenhum conteiner_id encontrado.');
            callback([],[]);  // Retorna array vazio
            return;
        }

        // Agora buscar todos os itens que têm conteiner_id correspondente na tabela itens
        const placeholders = containerIds.map(() => '?').join(',');  // Criar placeholders para a query
        
        const sql = `SELECT * FROM itens WHERE containerId IN (${placeholders})`;  // Atenção à coluna 'containerId' na tabela 'itens'

        db.all(sql, containerIds, (err, items) => {
            if (err) {
                console.error('Erro ao buscar itens:', err.message);
                callback(null,[]); // Em caso de erro, retorna null
                return;
            }

            //console.log(`Itens encontrados: ${JSON.stringify(items)}`);  // Exibir os itens encontrados

            callback(items, containerIds);  // Retorna os itens encontrados
        });
    });
}


export function createNewItem(idtipo: string, amount: number, containerId: number, slotId: number, props: string, callback: (success: boolean) => void) {
    const sql = `INSERT INTO itens (idtipo, amount, containerId, slotId, props) VALUES (?, ?, ?, ?, ?)`;

    // Inserir novo item na tabela
    db.run(sql, [idtipo, amount, containerId, slotId, props], function (err) {
        if (err) {
            console.error('Erro ao criar item:', err.message);
            callback(false); // Retorna false em caso de erro
            return;
        }
        
        console.log(`Item criado com sucesso com ID: ${this.lastID}`); // this.lastID retorna o ID do item inserido
        callback(true); // Retorna true se o item foi criado com sucesso
    });
}

export function updateItemAmount(idtipo: string, containerId: number, slotId: number, amountChange: number, callback: (success: boolean) => void) {
    // Primeiro, vamos buscar o item para garantir que ele existe e pegar seu amount atual
    const selectSql = `SELECT * FROM itens WHERE idtipo = ? AND containerId = ? AND slotId = ?`;
    
    db.get(selectSql, [idtipo, containerId, slotId], (err, row: Item | undefined) => { // Aqui definimos row como Item | undefined
        if (err) {
            console.error('Erro ao buscar item:', err.message);
            callback(false); // Retorna false em caso de erro
            return;
        }

        if (!row) {
            console.log(`Item com idtipo ${idtipo}, containerId ${containerId}, e slotId ${slotId} não encontrado.`);
            callback(false); // Item não encontrado
            return;
        }

        // Calcula o novo amount
        const newAmount = row.amount + amountChange;

        if (newAmount < 0) {
            console.log(`Não é possível retirar ${-amountChange} do item. O amount atual é ${row.amount}.`);
            callback(false); // Não é possível retirar mais do que o disponível
            return;
        }

        // Atualiza o amount do item
        const updateSql = `UPDATE itens SET amount = ? WHERE idtipo = ? AND containerId = ? AND slotId = ?`;
        db.run(updateSql, [newAmount, idtipo, containerId, slotId], function (updateErr) {
            if (updateErr) {
                console.error('Erro ao atualizar item:', updateErr.message);
                callback(false); // Retorna false em caso de erro na atualização
                return;
            }

            console.log(`Item atualizado com sucesso. Novo amount: ${newAmount}`);
            callback(true); // Retorna true se a atualização foi bem-sucedida
        });
    });
}


export function deleteItem(idtipo: string, containerId: number, slotId: number, callback: (success: boolean) => void) {
    const sql = `DELETE FROM itens WHERE idtipo = ? AND containerId = ? AND slotId = ?`;
    db.run(sql, [idtipo, containerId, slotId], function (err) {
        if (err) {
            console.error('Erro ao deletar item:', err.message);
            callback(false); // Retorna false em caso de erro
            return;
        }
        console.log(`Item deletado com sucesso do slot ${slotId} no container ${containerId}.`);
        callback(true); // Retorna true se a remoção foi bem-sucedida
    });
}

export function updateslot(idtipo: string, containerId: number, slotId: number, callback: (success: boolean) => void) {
    const updateSql = `UPDATE itens SET slotId = ? WHERE idtipo = ? AND containerId = ?`;
    db.run(updateSql, [slotId, idtipo, containerId], function (err) {
        if (err) {
            console.error('Erro ao atualizar o slot:', err.message);
            callback(false);
        } else {
            callback(true);
        }
    });
}











// Exporta o objeto db para outras operações, se necessário
export { db };
