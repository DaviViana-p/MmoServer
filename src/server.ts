import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ByteBuffer } from "./lib/bytebuffer";
import { ConcurrentByteBufferPool } from "./lib/concurrentpool";
import { QueueBuffer } from "./lib/queuebuffer";
import * as packets from './packets';
import { characters} from './interfaces/characters.interface';
import { contas } from './interfaces/contas.interface'; 
import * as DB from './DB/db.connect'
import * as chat from './chat'



import { Mapa } from './maps'; // Importando a classe Mapa

import * as fs from 'fs';


const port = 3001;
const clients = new Map<string, any>();
const server = new WebSocket.Server({ port, host: "0.0.0.0" });
const mapas = new Map<string, Mapa>(); // Gerenciar diferentes mapas
initializeMaps();

server.on('connection', (socket: any) => {
    const id = uuidv4();
    sendPacket(socket, packets.packetSession(id));
    socket.id = id;
    clients.set(id, socket);
    socket.character = null;// characters | null = null
    let conta: contas | null = null
    QueueBuffer.addSocket(id, socket);
    let conteinerids = [];
    let mapaatual:Mapa | undefined;
    console.log(`Player connected ${id}`);

    socket.on('message', (data: any) => {
        const message = new ByteBuffer(ByteBuffer.toArrayBuffer(data));
        const encrypted = message.getByte();
        const type = message.getByte();
        const accountId: number | undefined = conta?.id;  // Use `number | undefined` to account for possible undefined values
        switch(type){
            case 0: // Move
                const transform = message.getString(); // Obtém a string com os valores separados por vírgula
                const velocity = message.getString();
                //console.log(`String recebida: ${transform}`); // Debug: mostra a string recebida
                
                // Divide a string em um array usando a vírgula como delimitador
                const values = transform.split(',').map(Number); // Converte cada valor para número
                
                // Verifica se temos exatamente 6 valores
                if (values.length === 6) {
                    const [x, y, z, xr, yr, zr] = values; // Desestrutura o array para obter os valores
                    //console.log(x, y, z, xr, yr, zr);
                    
                    // Verifica se o personagem existe e obtém o mapa
                    if (socket.character) {
                        const map = mapas.get(socket.character.map_id.toString()); // Obtém o mapa usando o map_id do personagem

                        if (map) {
                            // Chama a função movePlayer do mapa para mover o jogador
                            map.movePlayer(socket.character.nome, x, y, z, xr, yr, zr, velocity);
                        } else {
                            console.error(`Mapa com ID ${socket.character.map_id} não encontrado.`);
                        }
                    } else {
                        console.error(`Personagem não encontrado.`);
                    }
                } else {
                    console.error(`Número de valores inválido. Esperado 6, recebido ${values.length}.`);
                }
            break;
              ;
            case 1: //criarconta
                const newName = message.getString();  
                const newEmail = message.getString();  
                const newPassword = message.getString();  

                DB.createAccount(newName, newEmail, newPassword, (newUser) => {
                    if (newUser) {
                        console.log(`Account created successfully for ${newEmail}.`);
                        // Enviar resposta de sucesso
                        sendPacket(socket, packets.packetAccountCreated(newUser.id));
                    } else {
                        console.log(`Failed to create account for ${newEmail}.`);
                        // Enviar resposta de erros
                        sendPacket(socket, packets.packetAccountCreationFailed());
                    }
                });
                break;
            case 2: // Player login          
                const email = message.getString();
                const senha = message.getString();           
                // Verifica se o usuário existe
                DB.userExists(email, (exists) => {
                    if (exists) {
                        // Pega a senha armazenada no banco de dados
                        DB.getPasswordByEmail(email, (storedPassword) => {
                            if (storedPassword && storedPassword === senha) {
                                // Senha correta, buscar os dados completos do usuário
                                DB.getUserByEmail(email, (userData) => {
                                    if (userData) {
                                        conta = userData; // Armazena os dados do usuário na variável User
                                        console.log(`User ${userData} logged in successfully.`);
                                        sendPacket(socket, packets.packetLoginSuccess());
            
                                        // Você também pode fazer outras ações com base nos dados do usuário aqui
                                        console.log(`Logged in user:`, conta);
                                    }
                                });
                            } else {
                                // Senha incorreta
                                console.log(`Incorrect password for user ${email}.`);
                                sendPacket(socket, packets.packetLoginError("Usuário ou senha incorreta"));
                            }
                        });
                    } else {
                        console.log(`User ${email} does not exist.`);
                        // Enviar pacote de erro de login
                        sendPacket(socket, packets.packetLoginError("Usuário não cadastrado"));
                    }
                });
            break;
            case 3: //carregar personagens da conta
                
                
                if (accountId !== undefined) {
                    // Busca todos os personagens associados à conta
                    DB.getCharactersByAccountId(accountId, (charactersList) => {
                        if (charactersList && charactersList.length > 0) {
                            console.log(`Found ${charactersList.length} characters for account ID: ${accountId}`);
                            
                            // Enviar os personagens ao cliente
                            sendPacket(socket, packets.packetCharactersList(charactersList));
                        } else {
                            console.log(`No characters found for account ID: ${accountId}`);
                        }
                    });
                } else {
                    console.log(`Account ID is undefined. Cannot load characters.`);
                }
            break;
            case 4: // packetenterworld - Entrar no mapa
                socket.characterId = message.getInt32();
                socket.conteinerids = [];
                //console.log(mapas);
                
                DB.getCharacterById(socket.characterId, (fetchedCharacter) => {
                    if (fetchedCharacter) {
                        socket.character = fetchedCharacter;


                        // Acessar as coordenadas x, y, z do JSON
                        const posX = socket.character.posX || 0; // Valor padrão 0 caso não tenha no JSON
                        const posY = socket.character.posY || 0;
                        const posZ = socket.character.posZ || 0;

                        console.log(`Character found: ${socket.character.nome} at position (${posX}, ${posY}, ${posZ})`);

                        // Pega ou cria o mapa
                        socket.mapNamespace = socket.character.map_id.toString();
                        mapaatual = mapas.get(socket.mapNamespace);
                        if (!mapaatual) {
                            mapaatual = new Mapa(socket.mapNamespace);
                           // mapas.set(mapNamespace, mapa);
                           console.log('mapavazio:',mapa);
                        }else

                        console.log('socket.character.nome:',socket.character.nome)
                        // Adiciona o jogador ao mapa com a posição correta
                        mapaatual.addPlayer(socket.character.nome, socket, {
                            ...socket.character,
                            posX,         
                            posY,
                            posZ
                        });

                        DB.getContainerIdsByOwnerId(socket.character.id, (inventory, containerIds) => {
                            if (inventory) {
                               // console.log("Inventário carregado:", inventory);
                                socket.inventory = inventory;
                                
                                socket.conteinerids = containerIds;
                            } else {
                                console.log("Nenhum inventário encontrado ou erro ao carregar.");
                            }
                        });

                        mapaatual.broadcast(packets.spawnproxy(socket.character.nome,socket.character.characterinfo),socket.character.nome);
                        // Enviar o pacote de entrada no mundo
                        sendPacket(socket, packets.entrarnomundo(socket.mapNamespace, socket.character));
                    } else {
                        console.log(`Character with ID ${socket.characterId} not found.`);
                    }
                });
            break;
            case 5: // Criar personagem
                    const characterName = message.getString(); // Nome do personagem
                    if (accountId !== undefined && characterName) {
                        DB.createCharacter(accountId, characterName, 0, (newCharacter) => {
                            if (newCharacter) {
                                console.log(`Character ${newCharacter.nome} created successfully.`);

                                // Enviar o novo personagem de volta ao cliente
                                //sendPacket(socket, packets.packetCharacterCreated(newCharacter));

                                // Opcionalmente, você pode adicionar o personagem ao mapa ou processar de outra forma
                            } else {
                                console.log(`Failed to create character for account ID ${accountId}.`);
                                // Enviar resposta de erro de criação de personagem
                               // sendPacket(socket, packets.packetCharacterCreationFailed());
                            }
                        });
                    } else {
                        console.log("Account ID or character name is missing.");
                        // Enviar resposta de erro se o ID da conta ou o nome do personagem estiver faltando
                       // sendPacket(socket, packets.packetCharacterCreationFailed());
                    }
                break;
            case 6: // teleport player
                const targetMapName: string = message.getString(); // Nome do mapa de destino
                const mapa = mapas.get(targetMapName); // Obtém o mapa usando o nome
            
                if (mapa) {
                    //console.log("Target map found:", mapa);
                    
                    // Use the socket character's current map ID to fetch the current map
                    const atualmapid: string = socket.character.map_id.toString();
                    //console.log(atualmapid);
                    const atualmap: Mapa | undefined = mapas.get(atualmapid); // Obtém o mapa atual
            
                    //console.log("Current map object:", atualmap);
                    
                    // Certifique-se de que o `characterId` foi atribuído
                    if (socket.characterId !== undefined) {
                        if (atualmap) {
                            atualmap.transportPlayer(socket.character.nome, mapa, '0', '0', '0',targetMapName); // Teletransporta o jogador
                            // Atualize o map_id do personagem após o teletransporte
                            socket.character.map_id = targetMapName;
                            //console.log(`Teleporting player ${socket.characterId} to map ${targetMapName} at position (-360, -2150, 810).`);
                            //console.log('character.id:',socket.character.nome);
                           // console.log('socket.character:',socket.character,'br',socket.character);
                            atualmap.broadcast(packets.removecharacter(socket.character.nome),socket.id);
                            sendPacket(socket, packets.entrarnomundo(targetMapName, socket.character));
                        } else {
                            console.error("Current map not found.");
                        }
                    } else {
                        console.error("Character ID is undefined. Cannot teleport player.");
                    }
                } else {
                    console.error("Target map not found.");
                }
                break;
                
                case 7: // Add Item to Inventory
                
                mapaatual?.coletaritem(socket);
                
                break;
                
                case 8: // Query Inventory
                   // console.log(socket.containerIds);
                    sendPacket(socket,packets.packetInventory(socket.inventory,socket.conteinerids));  // Função para enviar os dados para o cliente (exemplo)
                break;
                case 8: // useitem
               //   handleUseItem(message, id);
                break;
                case 9:
                    console.log("case 9")
                    chat.handleBroadcastMessage(socket, message);
                break;


        }
    });

    socket.on('close', () => {
        QueueBuffer.removeSocket(socket.id);
        clients.delete(socket.id);
       /* mapas.forEach(mapa => {
            if(socket.character.id)
                 mapa.removePlayer(socket.character.id);
        });*/
       broadcast(packets.removecharacter(socket.character.nome),socket.id)
        console.log(`Player disconnected ${socket.id}`);
    });

    broadcast(packets.packetCreatePlayer(id), id);
});

export function sendPacket(socket: any, packet: ByteBuffer){
    socket.send(packet.getBuffer());
    ConcurrentByteBufferPool.release(packet);
}

export function broadcast(message: ByteBuffer, id: string){
    clients.forEach((client, idSocket) => {
        if(idSocket !== id)
            //QueueBuffer.addBuffer(id, message);
            client.send(message.getBuffer());
    });

    ConcurrentByteBufferPool.release(message);
}

function parseMapData(mapData: string) {
    const parsedData: any[] = [];
    
    const entries = mapData.split(','); // Divide a string em pares
    entries.forEach(entry => {
        const [id, coordinates] = entry.split(':'); // Separa o ID das coordenadas
        const coordValues = coordinates.split('.'); // Divide as coordenadas em um array
        parsedData.push({ id: parseInt(id), coordinates: coordValues.map(Number) }); // Adiciona ao array
    });
    
    return parsedData;
}

function initializeMaps() {
    DB.getAllMaps((maps) => {
        maps.forEach((map) => {
            const mapNamespace = map.map_id.toString();
            console.log('inicializando mapa:',mapNamespace);

            // Tente fazer o parse dos JSONs e capture erros
            try {
                const gatherables = parseMapData(map.gatherables_id);
                const npcs = parseMapData(map.npcs_id);
                const respawns = parseMapData(map.respawns);

                const mapa = new Mapa(mapNamespace, {
                    gatherables,
                    npcs,
                    respawns,
                });
                mapas.set(mapNamespace, mapa);
            } catch (error) {
                console.error(`Error parsing data for map ${mapNamespace}:`, error);
            }
        });
    });
}

console.log(`Server Listem ${port}`);