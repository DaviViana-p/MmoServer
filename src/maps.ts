import { v4 as uuidv4 } from 'uuid';
import { ByteBuffer } from "./lib/bytebuffer";
import { QueueBuffer } from "./lib/queuebuffer";
import * as packets from './packets';
import { updateCharacterInfo, updateCharacterMapId } from './DB/db.connect';
import * as inventario from './inventario';
import { Gatherable } from './Gatherable';
import { Mob } from './entities/Mob'; // Certifique-se de importar a classe Mob
import { sendPacket } from './server';
import { Entity } from './entities/entity';

class Mapa {
    public id: string;
    public namespace: string; // Nome único do mapa
    public players: Map<string, any>; // Armazena entidades (jogadores e NPCs)
    private gatherables: Gatherable[]; // Gatherables
    private mobs: Mob[]; // Mobs
    private entities: Map<string, Entity>;
    private respawns: any[]; // Respawns
    private tickInterval: NodeJS.Timeout | null = null; // Timer para ticks

    constructor(namespace: string, options?: { gatherables?: any; Mob?: any; respawns?: any }) {
        this.id = uuidv4(); // ID único para o mapa
        this.namespace = namespace;
        this.players = new Map<string, any>(); // Entidades no mapa (jogadores, NPCs)
        this.entities = new Map<string, Entity>();

        // Inicializar mobs carregados do JSON
        this.mobs = options?.Mob?.map((mobData: any) => {
            const id = uuidv4();
            console.log(mobData)
            return new Mob(
              mobData.name,
              mobData.aparence,
              mobData.gameplayVariables, // Verifique se isso está definido
              this,             
              id,               
              mobData.attackPower,
              100,
              100,
              100,
              100,
              mobData.patrolPoints // Pontos de patrulha do mob
            );
          }) || [];
          
          this.mobs.forEach((mob: Mob) => {
            this.entities.set(mob.id, mob);
            console.log('enties:',this.entities)
        });
        

        // Inicializar gatherables carregados do JSON
        this.gatherables = options?.gatherables?.map((gatherableData: Gatherable) => {
            if (!gatherableData || !gatherableData.type || !gatherableData.position) {
                console.error('Gatherable data is invalid:', gatherableData);
                return null;
            }
            const id = uuidv4();
            return new Gatherable(
                gatherableData.type,
                gatherableData.position,
                this,
                id,
                ''
            );
        }).filter((gatherable: any): gatherable is Gatherable => gatherable !== null);

        this.respawns = options?.respawns || [];

        // Inicia o intervalo de ticks
        this.startTick();
    }

    // Adiciona um jogador no mapa
    addPlayer(clientId: string, socket: any) {
        this.players.set(clientId, socket);
        this.entities.set(clientId, socket.character);
       // console.log(`Player ${character.nome} entrou no mapa ${this.namespace}`);
       this.broadcast(packets.spawnproxy(socket.character.name,JSON.stringify(socket.character.gameplayVariables.transform)),socket.character.name);
        //console.log('socket.character.characterinfo:',socket.character.gameplayVariables.transform,socket.character.name);
       // console.log('clients:',this.clients);
       
    }

    // Remove um jogador do mapa
    removePlayer(clientId: string, socket:any) {
        this.players.delete(clientId); // Remove a entidade do jogador
        this.entities.set(clientId, socket.character);
        this.broadcast(packets.removecharacter(socket.character.name),socket.id);
       // console.log(`Player ${clientId} saiu do mapa ${this.namespace}`);
    }

    // Envia uma mensagem (pacote) a todos os jogadores no mapa
    broadcast(message: ByteBuffer, exceptId: string) {
        
        this.players.forEach((character, clientId) => {
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
        const character = this.players.get(clientId);
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
            const newCharacterInfo = JSON.stringify({ ...socket.character, socket: undefined });
            
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
        const character = this.players.get(socket.character.name);  // Obtém o personagem pelo clientId
    
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

    createGatherable(type: string, position: { x: number, y: number, z: number,rx: number, ry: number, rz: number,ex: number, ey: number, ez: number},itemtipo:string,Construcao?: string) {        

        const id = uuidv4();
        if(type === 'item'){
            type = itemtipo;
        }
        // Cria um novo objeto Gatherable
        const newGatherable = new Gatherable(
            type,        // Tipo do gatherable (ex: 'tree', 'stone', etc.)
            position,    // Posição no mapa
            this,        // Referência ao mapa atual
            id,         // ID único
            Construcao     //item tipo vazio
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
       
        
        this.players.forEach(entitie => {        
            this.broadcast(packets.spawngatherables(result),entitie.id);
            });

        return result;
    }
    

    getPlayers() {
        return this.players;
    }
    getentities() {
        //console.log('enties:',this.entities)
        return this.entities;
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
      //console.log(this.mobs)
      this.sendgatherables();
    }
}


export { Mapa };
