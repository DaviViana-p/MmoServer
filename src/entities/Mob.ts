import { v4 as uuidv4 } from 'uuid';
import * as packets from '../packets';
import { Mapa } from '../maps';
import { broadcast } from '../server';
import { Socket } from '../lib/socket';
import { setInterval, clearInterval } from 'timers';
import { Entity } from './entity';
import { PlayerEntity } from './playerentiti';


export class Mob extends Entity {
    private interpolationTimer: NodeJS.Timeout | null = null;
    public attackPower: number;
    public patrolIndex: number = 0;
    public targetPlayer: any | null = null;
    public patrolPoints: { x: number, y: number, z: number }[];

    constructor(
        name: string,
        aparence: string,
        gameplayVariables: {
            transform: {
                x: number;
                y: number;
                z: number;
                xr: number;
                yr: number;
                zr: number;
                ex: number;
                ey: number;
                er: number;
            };
            velocity: {
                x: number;
                y: number;
                z: number;
            };
            atualMap: any;
            containers: { [containerId: string]: string[] };
        },
        map: Mapa,
        id: string,
        vidaActual: number,
        vidaMaxima: number,
        manaActual: number,
        manaMaxima: number,
        attackPower = 10,
        patrolPoints: { x: number, y: number, z: number }[]
    ) {
        super(map, name, aparence, gameplayVariables, true, vidaActual, vidaMaxima, manaActual, manaMaxima, id);
        this.attackPower = attackPower;
        this.patrolPoints = patrolPoints;

        this.startPatrol(map.getentities());
        this.map = super.getMapa();
    }

    // Método para o mob receber dano
    takeDamage(amount: number) {
        this.vidaActual -= amount;
        if (this.vidaActual <= 0) {
            this.die();
        } else {
            console.log(`${this.name} recebeu ${amount} de dano. Saúde restante: ${this.vidaActual}`);
        }
    }

    // Método para o mob morrer
    die() {
        super.setIsAlive(false);
        console.log(`${this.name} morreu.`);
        this.map.broadcast(packets.removeMob(this.id), '')
    }

    // Verifica se o mob está perto o suficiente do jogador para atacar
    isCloseEnough(targetTransform: { x: number, y: number, z: number }): boolean {
        const distance = Math.sqrt(
            Math.pow(super.getGameplayVariables().transform.x - targetTransform.x, 2) +
            Math.pow(super.getGameplayVariables().transform.y - targetTransform.y, 2) +
            Math.pow(super.getGameplayVariables().transform.z - targetTransform.z, 2)
        );
        return distance <= 1.5; // Considera 1.5 metros como distância suficiente para atacar
    }

    // Método para o mob atacar um jogador
    attackPlayer(player: any) {
        if (super.getIsAlive() === true && player.getIsAlive() === true) {
            this.targetPlayer = player;
            this.moveTowards(player.getGameplayVariables().transform);
            if (this.isCloseEnough(player.getGameplayVariables().transform)) {
                console.log(`${this.name} ataca ${player.name} causando ${this.attackPower} de dano.`);
                player.takeDamage(this.attackPower); // Aplica dano
                this.map.broadcast(packets.MobAttackPlayer(this.id, this.attackPower, player), '');
            }
        }
    }

    // MOVIMENTO: Move o mob para uma nova posição
    moveTo(x: number, y: number, z: number) {
        if (super.getIsAlive() === true) {
            const distanceX = x - super.getGameplayVariables().transform.x;
            const distanceY = y - super.getGameplayVariables().transform.y;
            const distanceZ = z - super.getGameplayVariables().transform.z;
            
            const steps = Math.ceil(Math.sqrt(distanceX ** 2 + distanceY ** 2 + distanceZ ** 2) / 10);
            const stepX = distanceX / steps;
            const stepY = distanceY / steps;
            const stepZ = distanceZ / steps;
    
            this.interpolationTimer = setInterval(() => {
                super.getGameplayVariables().transform.x += stepX;
                super.getGameplayVariables().transform.y += stepY;
                super.getGameplayVariables().transform.z += stepZ;
    
                this.broadcastMobMove();
    
                if (Math.abs(super.getGameplayVariables().transform.x - x) < 0.01 && Math.abs(super.getGameplayVariables().transform.y - y) < 0.01 && Math.abs(super.getGameplayVariables().transform.z - z) < 0.01) {
                    if (this.interpolationTimer !== null) {
                        clearInterval(this.interpolationTimer);
                    }
                }
            }, 200);
        }
    }


// Movimento: Função para mover o mob em direção a um ponto
moveTowards(targetTransform: { x: number, y: number, z: number }) {
    if (targetTransform) {
        const speed = 0.5; // Velocidade constante

        this.interpolationTimer = setInterval(() => {
            const currentX = super.getGameplayVariables().transform.x;
            const currentY = super.getGameplayVariables().transform.y;
            const currentZ = super.getGameplayVariables().transform.z;

            const targetX = targetTransform.x;
            const targetY = targetTransform.y;
            const targetZ = targetTransform.z;

            const distanceX = targetX - currentX;
            const distanceY = targetY - currentY;
            const distanceZ = targetZ - currentZ;

            const distanceTotal = Math.sqrt(distanceX ** 2 + distanceY ** 2 + distanceZ ** 2);

            // Recalcula a direção a cada intervalo
            if (distanceTotal > 0) {
                const directionX = distanceX / distanceTotal;
                const directionY = distanceY / distanceTotal;
                const directionZ = distanceZ / distanceTotal;

                const moveX = directionX * speed;
                const moveY = directionY * speed;
                const moveZ = directionZ * speed;

                // Atualiza a posição
                super.getGameplayVariables().transform.x += moveX;
                super.getGameplayVariables().transform.y += moveY;
                super.getGameplayVariables().transform.z += moveZ;

                this.broadcastMobMove();

                // Verifica se o mob chegou ao destino
                if (distanceTotal < 0.01) {
                    if (this.interpolationTimer !== null) {
                        clearInterval(this.interpolationTimer as NodeJS.Timeout);
                        this.interpolationTimer = null;  // Reseta para null após limpar
                    }

                    console.log(`${this.name} chegou ao jogador.`);
                }
            }
        }, 10); // Intervalo para movimentação
    } else {
        console.error(`${this.name} não tem um alvo definido para se mover.`);
    }
}



    // Envia a posição do mob para todos os jogadores no mapa
    broadcastMobMove() {
        const moveMessage = packets.mobMove(this.id, this.gameplayVariables.transform);
        this.map.broadcast(moveMessage, '');
    }

    // Método para o mob patrulhar
    startPatrol(players: Map<string, any>) {
        setInterval(() => {
            if (super.getIsAlive() === true) {
                if (!this.targetPlayer) {
                    const nextPoint = this.patrolPoints[this.patrolIndex];
                    this.moveTo(nextPoint.x, nextPoint.y, nextPoint.z);
                    console.log(`${this.name} patrulha para o ponto (${nextPoint.x}, ${nextPoint.y}, ${nextPoint.z})`);
                    this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
                } else {
                    this.attackPlayer(this.targetPlayer);
                }
                this.checkForPlayersInSight(players);
            }
        }, 5000);
    }

    // Método para verificar se há jogadores no campo de visão
    checkForPlayersInSight(players: Map<string, any>) {
        players.forEach((player, playerId) => {
          if (player instanceof PlayerEntity && player.getIsAlive() === true) {
            const playerTransform = player.getGameplayVariables().transform;
            console.log(`${this.name} verifica se ${player.name} está no campo de visão.`);
            const distance = this.calculateDistance(super.getGameplayVariables().transform, playerTransform);
            console.log(distance);
            if (distance < 1000) {
              this.targetPlayer = player;
            }
          }else{
              console.log(player.getName(),player.getIsAlive());
          }
        });
      }
    
    

    // STREIFAR: Move o mob em volta do jogador em um círculo de 2 metros
    strafeAroundPlayer(player: any) {
        if (super.getIsAlive() === true && player) {
            const angle = Math.random() * 2 * Math.PI; // Ângulo aleatório em torno do jogador
            const radius = 2; // Raio de 2 metros
            const strafeX = player.transform.x + radius * Math.cos(angle);
            const strafeY = player.transform.y + radius * Math.sin(angle);
            const strafeZ = player.transform.z; // Manter a altura igual

            this.moveTo(strafeX, strafeY, strafeZ);
            console.log(`${this.name} está streifando em volta do jogador para (${strafeX}, ${strafeY}, ${strafeZ})`);
        }
    }

    calculateDistance(pos1: { x: number, y: number, z: number }, pos2: { x: number, y: number, z: number }): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dz = pos2.z - pos1.z;
        return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
    }
}
