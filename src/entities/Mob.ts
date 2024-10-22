import { v4 as uuidv4 } from 'uuid';
import * as packets from '../packets';
import { Mapa } from '../maps';
import { broadcast } from '../server';
import { Socket } from '../lib/socket';
import { setInterval, clearInterval } from 'timers';
import { Entity } from './entity';

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
        super(
          map,
          name,
          aparence,
          gameplayVariables,
          true,          
          vidaActual,
          vidaMaxima,
          manaActual,
          manaMaxima,
          id,
        );
        this.id = id; // inicialize a propriedade id
        this.name = name; // inicialize a propriedade name
        this.attackPower = attackPower;
        this.isAlive = true;
        this.patrolPoints = patrolPoints;
      
        // Iniciar patrulha
        this.startPatrol(map.getPlayers());
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
        this.isAlive = false;
        console.log(`${this.name} morreu.`);
    }

    // Método para o mob atacar um jogador
    attackPlayer(player: any) {
        // Implemente a lógica de ataque aqui
    }

    // Método para o mob patrulhar
    startPatrol(players: Map<string, any>) {
        setInterval(() => {
            if (this.isAlive) {
                if (!this.targetPlayer) {
                    const nextPoint = this.patrolPoints[this.patrolIndex];
                    // substituí this.move por um método que você tenha definido na classe Entity
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
        // Implemente a lógica de verificação de jogadores no campo de visão aqui
    }

    // Método para mover o mob
    moveTo(x: number, y: number, z: number) {
        // Implemente a lógica de movimento aqui
    }
}