import { Mapa } from './maps';
import * as inventario from './inventario';
import * as packets from './packets';
import gatherablesData from './datas/tables/gatherables.json';  // Importa o JSON
import * as Baseitem from './interfaces/BaseItem'

export class Gatherable {
    public id: string;
    public type: string; // Tipo de planta ou recurso coletável
    public Contrucao;
    public position: { x: number, y: number, z: number,rx: number, ry: number, rz: number,ex: number, ey: number, ez: number }; // Posição no mapa
    public respawnTime: number; // Tempo para a planta renascer
    public isAvailable: boolean; // Se a planta está disponível para coleta
    public gatherTime: number; // Tempo necessário para coletar
    public life: number;
    public weight: number; // Peso do recurso coletado
    private map: Mapa; // Referência ao mapa em que a planta está
    private gatherableInfo: any;

    constructor(type: string, position: {x: number, y: number, z: number,rx: number, ry: number, rz: number,ex: number, ey: number, ez: number  }, map: Mapa, id: string,Construcao?:string) {
        this.id = id; // ID único
        this.type = type;
        this.position = position;
        this.map = map;
        this.Contrucao = Construcao;
        

        // Busca os dados do gatherable do JSON com base no tipo
        const gatherableInfo = gatherablesData.gatherables.find(gatherable => gatherable.type === type);

        if (gatherableInfo) {
            this.gatherTime = gatherableInfo.gatherTime || 2; // Usa o tempo do JSON ou 2 como padrão
            this.respawnTime = gatherableInfo.respawnTime || 60; // Usa o respawn do JSON ou 60 como padrão
            this.weight = gatherableInfo.weight || 0.1; // Usa o peso do JSON ou 0.1 como padrão
            this.life = gatherableInfo.life || 0;
            this.gatherableInfo = gatherableInfo;
        } else {
            // Se o tipo não for encontrado no JSON, usar valores padrões
            console.error(`Gatherable type "${type}" not found in JSON.`);
            this.gatherTime = 2;
            this.respawnTime = 60;
            this.weight = 0.1;
            this.life = 0;
        }
        if (this.life > 0){
        this.isAvailable = true; 
        }else this.isAvailable = false; 
    }




    collect(socket: any) {
        if (!this.isAvailable) {
            console.log("O recurso não está disponível para coleta.");
            return;
        }
    
        const item = Baseitem.createItemFromId(this.type);
        console.log(`Vida atual: ${this.life}`);
    
        if (this.life > 0) {
            this.life--;
    
            if (item) {
                const iteminfo = JSON.stringify(item);
                this.addToInventory(socket, iteminfo);
                console.log(`Jogador ${socket.character.name} coletou ${item.name} na posição (${this.position.x}, ${this.position.y}, ${this.position.z}).`);
                
                
    
                // Verifica se a vida chegou a zero
                if (this.life <= 0) {
                    this.isAvailable = false; // Marca o recurso como coletado
                    this.map.broadcast(packets.removegatherable(this.id), '0'); // Enviar pacote para remover o coletável
                    this.startRespawn(); // Inicia o tempo de respawn
                    console.log(`O recurso ${this.type} foi totalmente coletado.`);
                }
            }
        } else {
            console.log(`O recurso ${this.type} já foi coletado.`);
        }
    
        return;
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
        this.life = this.gatherableInfo.life || 0;
        console.log(`${this.type} renasceu na posição (${this.position.x}, ${this.position.y}, ${this.position.z}).`);
    }

    public getid(): string {
        return JSON.stringify({
            id: this.id,
            type: this.type,
            position: this.position,
            isAvailable: this.isAvailable,
            Construcao: this.Contrucao 
        });
    }
    
    // Retorna se a planta está disponível para coleta
    isGatherable() {
        return this.isAvailable;
    }

    private addToInventory(socket: any, props: string) {
        // Certifique-se de que as aspas no props estão escapadas corretamente
        const formattedProps = JSON.stringify({
            Infos: JSON.parse(props) // Se props já é um JSON, você pode usar diretamente
        });

        // Chama a função adicionaraoinventario com os parâmetros corretos
        inventario.adicionaraoinventario(this.type, 1, socket.conteinerids, formattedProps, socket);
    }

}
