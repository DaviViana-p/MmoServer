import { v4 as uuidv4 } from 'uuid';
import * as packets from '../packets';
import { Mapa } from '../maps';
import { broadcast } from '../server';
import { Socket } from '../lib/socket';

export class Mob {
    public id: string;
    public name: string;
    public health: number;
    public maxHealth: number;
    public attackPower: number;
    public atackindex = 0;
    public isAlive: boolean;
    public map: Mapa; // Referência ao mapa onde o mob está
    public patrolPoints: { x: number, y: number, z: number }[]; // Pontos de patrulha
    public patrolIndex: number = 0; // Controle de qual ponto de patrulha
    public targetPlayer: any | null = null; // Alvo para atacar ou streifar
    public transform: {
        x: number, y: number, z: number,
        xr: number, yr: number, zr: number,
        ex: number, ey: number, ez: number
    };

    constructor(
        name: string,
        transform: { x: number, y: number, z: number, xr: number, yr: number, zr: number, ex: number, ey: number, ez: number },
        map: Mapa,
        id: string,
        health = 100,
        attackPower = 10,
        patrolPoints: { x: number, y: number, z: number }[]
    ) {
        this.id = id;
        this.name = name;
        this.transform = transform; // Usar o transform ao invés do position
        this.health = health;
        this.maxHealth = health;
        this.attackPower = attackPower;
        this.isAlive = true;
        this.map = map;
        this.patrolPoints = patrolPoints; // Defina os pontos de patrulha

        // Iniciar patrulha
        this.startPatrol();
    }

    // PATRULHAR: Mover o mob entre os pontos de patrulha a cada 20 segundos
    startPatrol() {
        setInterval(() => {
            if (this.isAlive) {
                const nextPoint = this.patrolPoints[this.patrolIndex];
                this.move(nextPoint.x, nextPoint.y, nextPoint.z);
                console.log(`${this.name} patrulha para o ponto (${nextPoint.x}, ${nextPoint.y}, ${nextPoint.z})`);
                this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
                console.log(this.patrolIndex)
            }
        }, 10000); // Intervalo de 20 segundos
    }

    // ATACAR: Move-se em direção ao jogador-alvo e aplica dano
    public attackPlayer(player: any) {
        if (this.isAlive && player) {
            this.targetPlayer = player;
            this.moveTowards(player.transform); // Usa o transform ao invés de position
            if (this.isCloseEnough(player.transform)) {
                console.log(`${this.name} ataca ${player.character.name} causando ${this.attackPower} de dano.`);
                player.takeDamage(this.attackPower); // Aplica dano
                this.map.broadcast(packets.MobAttackPlayer(this.id, this.atackindex, player), '');
                this.atackindex++;
            }
        }
    }

    // MOVIMENTO: Função para mover o mob em direção a um ponto
    moveTowards(targetTransform: { x: number, y: number, z: number }) {
        console.log(`${this.name} se move em direção ao jogador.`);
        // Atualiza a posição (parte do transform) para simplificar
        this.transform.x = targetTransform.x;
        this.transform.y = targetTransform.y;
        this.transform.z = targetTransform.z;
        this.broadcastMobMove();
    }

    // STREIFAR: Move o mob em volta do jogador em um círculo de 2 metros
    strafeAroundPlayer(player: any) {
        if (this.isAlive && player) {
            const angle = Math.random() * 2 * Math.PI; // Ângulo aleatório em torno do jogador
            const radius = 2; // Raio de 2 metros
            const strafeX = player.transform.x + radius * Math.cos(angle);
            const strafeY = player.transform.y + radius * Math.sin(angle);
            const strafeZ = player.transform.z; // Manter a altura igual

            this.move(strafeX, strafeY, strafeZ);
            console.log(`${this.name} está streifando em volta do jogador para (${strafeX}, ${strafeY}, ${strafeZ})`);
        }
    }

    // Verifica se o mob está perto o suficiente do jogador para atacar
    isCloseEnough(targetTransform: { x: number, y: number, z: number }): boolean {
        const distance = Math.sqrt(
            Math.pow(this.transform.x - targetTransform.x, 2) +
            Math.pow(this.transform.y - targetTransform.y, 2) +
            Math.pow(this.transform.z - targetTransform.z, 2)
        );
        return distance <= 1.5; // Considera 1.5 metros como distância suficiente para atacar
    }

    // MOVIMENTO: Move o mob para uma nova posição
    move(x: number, y: number, z: number) {
        if (this.isAlive) {
            this.transform.x = x;
            this.transform.y = y;
            this.transform.z = z;
            console.log(`${this.name} se moveu para (${x}, ${y}, ${z}).`);
            this.broadcastMobMove();
        }
    }

    // Envia a posição do mob para todos os jogadores no mapa
    broadcastMobMove() {
        const moveMessage = packets.mobMove(this.id, this.transform);
        this.map.broadcast(moveMessage, '');
    }

    // Método para o mob morrer
    die() {
        this.isAlive = false;
        console.log(`${this.name} morreu.`);
        this.map.broadcast(packets.removeMob(this.id), '');
    }

    // Método para o mob receber dano
    takeDamage(amount: number) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        } else {
            console.log(`${this.name} recebeu ${amount} de dano. Saúde restante: ${this.health}`);
        }
    }
}
