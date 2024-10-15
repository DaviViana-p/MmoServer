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
import * as playerentiti from './entities/playerentiti'
import * as path from 'path';
import * as fs from 'fs';



import { Mapa } from './maps'; // Importando a classe Mapa




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
    let mapaatual:Mapa | undefined;
    console.log(`Player connected ${id}`);

    socket.on('message', (data: any) => {
        const message = new ByteBuffer(ByteBuffer.toArrayBuffer(data));
        const encrypted = message.getByte();
        const type = message.getByte();
        socket.accountID;  // Use `number | undefined` to account for possible undefined values
  
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
                        const map = mapas.get(socket.character.gameplayVariables.atualMap); // Obtém o mapa usando o map_id do personagem
                        if (map) {
                            // Chama a função movePlayer do mapa para mover o jogador
                            map.movePlayer(socket.character.name, x, y, z, xr, yr, zr, velocity,socket);
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
                                        socket.accountID = conta.id.toString();
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
                
                
                if (socket.accountID !== undefined) {
                    // Busca todos os personagens associados à conta
                    DB.getCharactersByAccountId(socket.accountID, (charactersList) => {
                        if (charactersList && charactersList.length > 0) {
                            console.log(`Found ${charactersList.length} characters for account ID: ${socket.accountID}`);
                            
                            // Enviar os personagens ao cliente
                            sendPacket(socket, packets.packetCharactersList(charactersList));
                        } else {
                            console.log(`No characters found for account ID: ${socket.accountID}`);
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
                        const characterJsonString =(fetchedCharacter.characterinfo);
                        console.log(characterJsonString);
                        socket.character = new playerentiti.PlayerEntity(characterJsonString);
                        console.log(socket.character);
                    
                        

                        console.log(`Character found: ${socket.character.name} at position (${socket.character.gameplayVariables.transform.x})`);
                        

                        // Pega ou cria o mapa
                        socket.character.gameplayVariables.atualMap.toString();
                        mapaatual = mapas.get(socket.character.gameplayVariables.atualMap.toString());
                        if (!mapaatual) {
                            mapaatual = new Mapa(socket.mapNamespace);
                           // mapas.set(mapNamespace, mapa);
                           console.log('mapavazio:',mapa);
                        }else

                        console.log('socket.character.nome:',socket.character.name)
                        // Adiciona o jogador ao mapa com a posição correta
                        mapaatual.addPlayer(socket.character.name, socket);
                        DB.getContainerIdsByOwnerId(socket.characterId, (inventory, containerIds) => {
                            if (inventory) {
                               // console.log("Inventário carregado:", inventory);
                                socket.inventory = inventory;
                                
                                socket.conteinerids = containerIds;
                            } else {
                                console.log("Nenhum inventário encontrado ou erro ao carregar.");
                            }
                        });

                        //mapaatual.broadcast(packets.spawnproxy(socket.character.name,socket.character.characterinfo),socket.character.name);
                        // Enviar o pacote de entrada no mundo
                        sendPacket(socket, packets.entrarnomundo(socket.mapNamespace, socket));
                    } else {
                        console.log(`Character with ID ${socket.characterId} not found.`);
                    }
                });
            break;
            case 5: // Criar personagem
                    const characterName = message.getString(); // Nome do personagem
                    if (socket.accountID !== undefined && characterName) {
                        DB.createCharacter(socket.accountID, characterName, 0, (newCharacter) => {
                            if (newCharacter) {
                                console.log(`Character ${newCharacter.nome} created successfully.`);

                                // Enviar o novo personagem de volta ao cliente
                                //sendPacket(socket, packets.packetCharacterCreated(newCharacter));

                                // Opcionalmente, você pode adicionar o personagem ao mapa ou processar de outra forma
                            } else {
                                console.error(`Failed to create character for account ID ${socket.accountID}.`);
                                // Enviar resposta de erro de criação de personagem
                               // sendPacket(socket, packets.packetCharacterCreationFailed());
                            }
                        });
                    } else {
                        console.error("Account ID or character name is missing.");
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
                    const atualmapid: string = socket.character.gameplayVariables.atualMap;
                    //console.log(atualmapid,socket.character.gameplayVariables.atualMap)
                    //console.log(atualmapid);
                    const atualmap: Mapa | undefined = mapas.get(atualmapid); // Obtém o mapa atual
            
                    //console.log("Current map object:", atualmap);
                    
                    // Certifique-se de que o `characterId` foi atribuído
                    if (socket.characterId !== undefined) {
                        if (atualmap) {
                            atualmap.transportPlayer(mapa, '0', '0', '0',targetMapName,socket); // Teletransporta o jogador
                            // Atualize o map_id do personagem após o teletransporte
                            //console.log(`Teleporting player ${socket.characterId} to map ${targetMapName} at position (-360, -2150, 810).`);
                            //console.log('character.id:',socket.character.nome);
                           // console.log('socket.character:',socket.character,'br',socket.character);
                           // console.log('socket.character',socket.character)
                            sendPacket(socket, packets.entrarnomundo(targetMapName, socket));
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
                
                case 7: // collectGatherable
                const targetid = message.getString();
                if (targetid != '') {
                    console.log(targetid)
                    mapaatual?.coletaritem(socket, targetid);    
                    
                }
                
                
                break;
                
                case 8: // Query Inventory
                   // console.log(socket.containerIds);
                    sendPacket(socket,packets.packetInventory(socket.inventory,socket.conteinerids));  // Função para enviar os dados para o cliente (exemplo)
                break;
                case 8: // useitem
               //   handleUseItem(message, id);
                break;
                case 9:
                    chat.handleBroadcastMessage(socket, message);
                break;
                    
                case 10:
                    let Construcao;
                    let gatherabletype = message.getString();
                    if(gatherabletype === 'Construcao'){
                        Construcao = message.getString();
                        console.log(gatherabletype,Construcao)
                    }
                    
                    
                    let gathertransform = message.getString(); // Exemplo: "-8592,-3463,-79,0,0,173,1,1,1"

                    // Usar split para dividir a string em um array de valores
                    const [x, y, z, rx, ry, rz, ex, ey, ez]: number[] = gathertransform.split(',').map(Number);
                    
                    if (Construcao) {
                        mapaatual?.createGatherable(gatherabletype,{x,y,z,rx,ry,rz,ex,ey,ez},Construcao)
                    } else {
                        mapaatual?.createGatherable(gatherabletype,{x,y,z,rx,ry,rz,ex,ey,ez})
                    }
                    
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
        if(socket.character.name !== null){
            broadcast(packets.removecharacter(socket.character.name),socket.id)}
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
    const mapsDir = path.join(__dirname, 'datas');

    // Ler os arquivos na pasta 'datas'
    fs.readdir(mapsDir, (err, files) => {
        if (err) {
            console.error('Erro ao ler a pasta:', err);
            return;
        }

        // Filtrar apenas os arquivos JSON que começam com 'map'
        const mapFiles = files.filter(file => file.startsWith('map') && file.endsWith('.json'));

        mapFiles.forEach((file) => {
            const mapNamespace = file.replace('.json', '').replace('map', ''); // Extraindo o ID do arquivo
            const mapFilePath = path.join(mapsDir, file); // Caminho completo do arquivo
            console.log('inicializando mapa:', mapNamespace);

            try {
                // Ler o arquivo JSON do mapa
                const mapData = JSON.parse(fs.readFileSync(mapFilePath, 'utf-8'));

                // Extrair gatherables, npcs e respawns do JSON
                const gatherables = mapData.gatherables || [];
                const npcs = mapData.npcs || [];
                const respawns = mapData.respawns || [];

                // Passa os gatherables diretamente para o construtor do Mapa
                const mapa = new Mapa(mapNamespace, {
                    gatherables, // Passa os gatherables extraídos do JSON
                    npcs,
                    respawns,
                });
                
                mapas.set(mapNamespace, mapa);
            } catch (error) {
                console.error(`Error reading or parsing map file for map ${mapNamespace}:`, error);
            }
        });
    });
}





console.log(`Server Listem ${port}`);