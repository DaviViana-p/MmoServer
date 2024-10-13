import { Mapa } from './maps';
import * as inventario from './inventario';
import * as packets from './packets';
import gatherablesData from './datas/gatherables.json';  // Importa o JSON

export class Gatherable {
    public id: string;
    public type: string; // Tipo de planta ou recurso coletável
    public position: { x: number, y: number, z: number }; // Posição no mapa
    public respawnTime: number; // Tempo para a planta renascer
    public isAvailable: boolean; // Se a planta está disponível para coleta
    public gatherTime: number; // Tempo necessário para coletar
    public weight: number; // Peso do recurso coletado
    private map: Mapa; // Referência ao mapa em que a planta está

    constructor(type: string, position: { x: number, y: number, z: number }, map: Mapa, id: string) {
        this.id = id; // ID único
        this.type = type;
        this.position = position;
        this.map = map;

        // Busca os dados do gatherable do JSON com base no tipo
        const gatherableInfo = gatherablesData.gatherables.find(gatherable => gatherable.type === type);

        if (gatherableInfo) {
            this.gatherTime = gatherableInfo.gatherTime || 2; // Usa o tempo do JSON ou 2 como padrão
            this.respawnTime = gatherableInfo.respawnTime || 60; // Usa o respawn do JSON ou 60 como padrão
            this.weight = gatherableInfo.weight || 0.1; // Usa o peso do JSON ou 0.1 como padrão
        } else {
            // Se o tipo não for encontrado no JSON, usar valores padrões
            console.error(`Gatherable type "${type}" not found in JSON.`);
            this.gatherTime = 2;
            this.respawnTime = 60;
            this.weight = 0.1;
        }

        this.isAvailable = true; 
    }



    // Método para coletar a planta
    collect(socket: any) {
        if (!this.isAvailable) {
            console.log("Planta não está disponível para coleta.");
            return;
        }

        console.log(`Jogador ${socket.character.name} coletou ${this.type} na posição (${this.position.x}, ${this.position.y}, ${this.position.z}).`);

        // Adicionar o item coletado ao inventário do jogador
        inventario.adicionaraoinventario(this.type, 1, socket.conteinerids, `{
            "itemName": "${this.type}",
            "description": "Uma planta rara coletada do ambiente.",
            "weight": 0.1
        }`, socket);

        this.isAvailable = false; // Marca a planta como coletada
        this.map.broadcast(packets.removegatherable(this.id),'0');
        console.log(this.id)
        this.startRespawn(); // Inicia o tempo de respawn
    }

    // Método para iniciar o respawn da planta
    private startRespawn() {
        setTimeout(() => {
            this.respawn();
        }, this.respawnTime * 1000); // Converte respawnTime para milissegundos
    }

    // Método chamado quando a planta renasce
    private respawn() {
        this.isAvailable = true;
        console.log(`${this.type} renasceu na posição (${this.position.x}, ${this.position.y}, ${this.position.z}).`);
    }

    public getid(): string {
        return JSON.stringify({
            id: this.id,
            type: this.type,
            position: this.position,
            isAvailable: this.isAvailable
        });
    }
    
    // Retorna se a planta está disponível para coleta
    isGatherable() {
        return this.isAvailable;
    }
}

;
