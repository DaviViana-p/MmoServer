import { v4 as uuidv4 } from 'uuid';
import { ByteBuffer } from "./lib/bytebuffer";
import { QueueBuffer } from "./lib/queuebuffer";
import * as packets from './packets';
import { updateCharacterInfo, updateCharacterMapId } from './DB/db.connect';
import * as inventario from './inventario'
import { Gatherable } from './Gatherable';
import { sendPacket } from './server';


class Mapa {
    public id: string;
    public namespace: string; // Nome único do mapa
    public entities: Map<string, any>; // Armazena entidades (jogadores e NPCs)
    private gatherables: Gatherable []; // Adicione o tipo apropriado
    private npcs: any; // Adicione o tipo apropriado
    private respawns: any; // Adicione o tipo apropriado
    private tickInterval: NodeJS.Timeout | null = null; // Timer para ticks

    constructor(namespace: string, options?: { gatherables?: any; npcs?: any; respawns?: any }) {
        this.id = uuidv4(); // ID único para o mapa
        this.namespace = namespace;
        this.entities = new Map<string, any>(); // Entidades no mapa (jogadores, NPCs)
        this.npcs = options?.npcs || [];
        this.respawns = options?.respawns || [];
        this.gatherables = options?.gatherables?.map((gatherableData: Gatherable) => {
            // Verifique se gatherableData está definido e possui as propriedades necessárias
            if (!gatherableData || !gatherableData.type || !gatherableData.position) {
                console.error('Gatherable data is invalid:', gatherableData);
                return null; // Retorna null para dados inválidos
            }
            
            // Gerar um id único para cada gatherable
            const id = uuidv4();
            //console.log(gatherableData.position)
            
            return new Gatherable(
                gatherableData.type,
                gatherableData.position, // Usa a posição especificada no JSON de entrada
                this, // Mapa atual
                id    // Atribui o id gerado ao gatherable
            );
        }).filter((gatherable:any): gatherable is Gatherable => gatherable !== null);
        
        
        // Inicia o intervalo de ticks
        this.startTick()
    }

    // Adiciona um jogador no mapa
    addPlayer(clientId: string, socket: any) {
        this.entities.set(clientId, socket);
       // console.log(`Player ${character.nome} entrou no mapa ${this.namespace}`);
       this.broadcast(packets.spawnproxy(socket.character.name,JSON.stringify(socket.character.gameplayVariables.transform)),socket.character.name);
        console.log('socket.character.characterinfo:',socket.character.gameplayVariables.transform,socket.character.name);
       // console.log('clients:',this.clients);
       
    }

    // Remove um jogador do mapa
    removePlayer(clientId: string, socket:any) {
        this.entities.delete(clientId); // Remove a entidade do jogador
        this.broadcast(packets.removecharacter(socket.character.name),socket.id);
       // console.log(`Player ${clientId} saiu do mapa ${this.namespace}`);
    }

    // Envia uma mensagem (pacote) a todos os jogadores no mapa
    broadcast(message: ByteBuffer, exceptId: string) {
        
        this.entities.forEach((character, clientId) => {
            if (clientId !== exceptId) { // Não enviar para o jogador de origem
               // console.log('excepted',{exceptId},{clientId});
               character.send(message.getBuffer());
            }else
              //console.log('cliet',{clientId});
              ;
        });
        
    }


    // Atualiza a posição de um jogador no mapa e faz broadcast para os outros
    movePlayer(clientId: string, x: number, y: number, z: number, xr: number, yr: number, zr: number, velocity: string,socket:any) {
        //console.log('clientid:',clientId)
        const character = this.entities.get(clientId);
        const velocityString: string = velocity; // Exemplo de string de velocity
        const velocityArray: string[] = velocityString.split(","); // Divide a string por vírgula
        
        if (velocityArray.length === 3) { // Verifica se obteve três valores
            const vx: number = parseFloat(velocityArray[0]); // Converte o primeiro valor em número
            const vy: number = parseFloat(velocityArray[1]); // Converte o segundo valor em número
            const vz: number = parseFloat(velocityArray[2]); // Converte o terceiro valor em número
       
        
        if (character) {

            socket.character.gameplayVariables.transform.x = x; // Define a nova posição x
            socket.character.gameplayVariables.transform.y = y; // Define a nova posição y
            socket.character.gameplayVariables.transform.z = z; // Define a nova posição z
    
            // Converte o objeto de volta para uma string JSON
            const newCharacterInfo = JSON.stringify(socket.character);
            
            updateCharacterInfo(socket.characterId, newCharacterInfo, (success) => {
                if (success) {
                    //console.log(characterData); // Agora, este é um objeto válido
                   // console.log(socket.characterId,newCharacterInfo);
                } else {
                    console.log(`Failed to update character info.`);
                }
            });
            
          // console.log(`Player ${character.nome} moved to (${x}, ${y}, ${z},${vx}, ${vy}, ${vz})`);
    
            // Faz broadcast para os outros jogadores no mapa
            this.broadcast(packets.packetMove(clientId, { x, y, z, xr, yr, zr },vx,vy,vz), socket.character.name.toString());
        }
    }
        
    }

    // Função para transportar um jogador de um mapa para outro
    transportPlayer(newMap: Mapa, newPosX: string, newPosY: string, newPosZ: string,mapaid:string,socket:any) {
        const character = this.entities.get(socket.character.name);  // Obtém o personagem pelo clientId
    
        if (character) {
            // Remover o jogador do mapa atual
            this.removePlayer(socket.character.name,socket);                       
    
            // Atualizar a posição do jogador
            socket.character.gameplayVariables.transform.x = newPosX; // Define a nova posição x
            socket.character.gameplayVariables.transform.y = newPosY; // Define a nova posição y
            socket.character.gameplayVariables.transform.z = newPosZ; // Define a nova posição z
            socket.character.gameplayVariables.atualMap = mapaid;
        
            // Converte de volta para string JSON
            const newCharacterInfo = JSON.stringify(socket.character);
    
            // Atualizar o characterInfo no objeto `character`
            character.characterinfo = newCharacterInfo;
    
            // Atualiza as informações no banco de dados
            updateCharacterInfo(character.id, newCharacterInfo, (success) => {
                if (success) {
                    console.log(`Player ${socket.character.name} foi transportado para o mapa ${newMap.namespace}.`);
                    
                    // Adicionar o jogador ao novo mapa
                    newMap.addPlayer(socket.character.name, socket,);
                    
                    // Atualizar o ID do mapa no banco de dados, certifique-se de passar o ID correto
                    updateCharacterMapId(character.id, mapaid, (updateSuccess) => {
                        if (updateSuccess) {
                           // console.log(`Mapa do jogador atualizado no banco de dados para ${newMap.namespace}`);
                        } else {
                            console.error('Erro ao atualizar o ID do mapa no banco de dados');
                        }
                    });
                    
                    // Fazer broadcast para os outros jogadores no novo mapa
                    
                } else {
                    console.log(`Falha ao atualizar informações do personagem.`);
                }
            });
            
        } else {
            console.error(`Personagem não encontrado para o clientId: ${socket.character.name}`);
        }
    }
    
    coletaritem(socket: any, targetid: string) {    
        for (const gatherable of this.gatherables) {
            if (gatherable.id === targetid && gatherable.isAvailable) {
                gatherable.collect(socket);
                break;  
            }
        }
    }

    createGatherable(type: string, position: { x: number, y: number, z: number,rx: number, ry: number, rz: number,ex: number, ey: number, ez: number},Construcao?: string) {
        // Gera um ID único para o novo gatherable
        

        const id = uuidv4();
    
        // Cria um novo objeto Gatherable
        const newGatherable = new Gatherable(
            type,        // Tipo do gatherable (ex: 'tree', 'stone', etc.)
            position,    // Posição no mapa
            this,        // Referência ao mapa atual
            id,           // ID único
            Construcao
        );
    
        // Adiciona o novo gatherable à lista de gatherables do mapa
        this.gatherables.push(newGatherable);
    
        console.log(`Novo gatherable do tipo ${type} criado na posição (${position.x}, ${position.y}, ${position.z}).`);
    
        // Opcional: Envia o gatherable recém-criado para todos os jogadores no mapa
        const gatherableData = {
            id: newGatherable.getid(),
            type: newGatherable.type,
            position: newGatherable.position,
            isAvailable: newGatherable.isAvailable,
            Construcao: newGatherable.Contrucao
        };
    
        const result = JSON.stringify({
            length: 1, // Apenas um gatherable foi criado
            gatherables: [gatherableData]
        });
    
        this.broadcast(packets.spawngatherables(result), '');
    }
    
    
    sendgatherables() {
        const gatherableData: { id: string; type:string, transform: { x: number, y: number, z: number,rx: number, ry: number, rz: number,ex: number, ey: number, ez: number },isAvailable:string,Construcao?:string }[] = [];
    
        this.gatherables.forEach((gatherable: Gatherable) => {
            if(gatherable.isAvailable){
                const gatherableInfo = JSON.parse(gatherable.getid()); // Obtenha o ID e a posição
                
                // Adicionar o ID e a posição (transform) ao array
                gatherableData.push({
                    id: gatherableInfo.id,
                    type: gatherableInfo.type,
                    transform: gatherableInfo.position,
                    isAvailable: gatherableInfo.isAvailable,
                    Construcao:gatherableInfo.Construcao || ''
                });
            }

            
        });
        //console.log('gatherableInfo:',gatherableData)
        const result = JSON.stringify({
            length: gatherableData.length,
            gatherables: gatherableData
        });
       
        
        this.entities.forEach(entitie => {        
            this.broadcast(packets.spawngatherables(result),entitie.id);
            });

        return result;
    }
    

    getPlayers() {
        return Array.from(this.entities.values());
    }

    private startTick() {
        this.tickInterval = setInterval(() => {
            this.onTick();
        }, 200); // 200 milliseconds = 0.2 seconds
    }
    // Função para processar eventos periódicos (ticks)
    onTick() {
        // Aqui você pode adicionar lógica para NPCs ou eventos periódicos no mapa
        //console.log(`Mapa ${this.namespace} processando tick...`);
        // Exemplo: Atualizar estados dos personagens ou verificar respawns
      //console.log(this.namespace,this.getPlayers())
      //this.sendgatherables();
      //console.log(this.gatherables)
      this.sendgatherables();
    }
}


export { Mapa };
