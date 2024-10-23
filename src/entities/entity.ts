import { Mapa } from '../maps';

export class Entity {
    public name: string;
    public aparence: string;
    public isAlive: boolean;
    public vidaActual: number;
    public vidaMaxima: number;
    public manaActual: number;
    public manaMaxima: number;
    public id: string;
    public gameplayVariables: {
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
    };

    public map: Mapa;

    constructor(
        mapa: Mapa,
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
        isAlive: boolean,
        vidaActual: number,
        vidaMaxima: number,
        manaActual: number,
        manaMaxima: number,
        id: string,
    ) {
        this.map = mapa;
        this.name = name;
        this.aparence = aparence;
        this.isAlive = isAlive;
        this.vidaActual = vidaActual;
        this.vidaMaxima = vidaMaxima;
        this.manaActual = manaActual;
        this.manaMaxima = manaMaxima;
        this.id = id;
        this.gameplayVariables = gameplayVariables;
    }

    update(deltaTime: number) {
        // Método que deve ser implementado pelas subclasses
    }

    getName(): string {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
    }

    getAparance(): string {
        return this.aparence;
    }

    setAparance(aparence: string) {
        this.aparence = aparence;
    }

    getIsAlive(): boolean {
        return this.isAlive;
    }

    setIsAlive(isAlive: boolean) {
        this.isAlive = isAlive;
    }

    getVidaActual(): number {
        return this.vidaActual;
    }

    setVidaActual(vidaActual: number) {
        this.vidaActual = vidaActual;
    }

    getVidaMaxima(): number {
        return this.vidaMaxima;
    }

    setVidaMaxima(vidaMaxima: number) {
        this.vidaMaxima = vidaMaxima;
    }

    getManaActual(): number {
        return this.manaActual;
    }

    setManaActual(manaActual: number) {
        this.manaActual = manaActual;
    }

    getManaMaxima(): number {
        return this.manaMaxima;
    }

    setManaMaxima(manaMaxima: number) {
        this.manaMaxima = manaMaxima;
    }

    getId(): string {
        return this.id;
    }

    setId(id: string) {
        this.id = id;
    }

    getMapa(): Mapa {
        return this.map;
    }

    setMapa(mapa: Mapa) {
        this.map = mapa;
    }

    getGameplayVariables() {
        return this.gameplayVariables;
    }

    setGameplayVariables(gameplayVariables: any) {
        this.gameplayVariables = gameplayVariables;
    }

    setPosition(x: number, y: number, z: number) {
        if (this.gameplayVariables.transform) {
            this.gameplayVariables.transform.x = x;
            this.gameplayVariables.transform.y = y;
            this.gameplayVariables.transform.z = z;
            console.log(`${this.name} moved to (${x}, ${y}, ${z}).`);
        } else {
            console.error("Transform is undefined.");
        }
    }

    // Métodos para definir a posição individualmente
    setX(x: number) {
        if (this.gameplayVariables.transform) {
            this.gameplayVariables.transform.x = x;
            console.log(`${this.name} X position set to ${x}.`);
        } else {
            console.error("Transform is undefined.");
        }
    }

    setY(y: number) {
        if (this.gameplayVariables.transform) {
            this.gameplayVariables.transform.y = y;
            console.log(`${this.name} Y position set to ${y}.`);
        } else {
            console.error("Transform is undefined.");
        }
    }

    setZ(z: number) {
        if (this.gameplayVariables.transform) {
            this.gameplayVariables.transform.z = z;
            console.log(`${this.name} Z position set to ${z}.`);
        } else {
            console.error("Transform is undefined.");
        }
    }

    // Métodos para definir a velocidade
    setVelocity(x: number, y: number, z: number) {
        this.gameplayVariables.velocity.x = x;
        this.gameplayVariables.velocity.y = y;
        this.gameplayVariables.velocity.z = z;
        console.log(`${this.name} velocity set to (${x}, ${y}, ${z}).`);
    }

    setVelocityX(x: number) {
        this.gameplayVariables.velocity.x = x;
        console.log(`${this.name} velocity X set to ${x}.`);
    }

    setVelocityY(y: number) {
        this.gameplayVariables.velocity.y = y;
        console.log(`${this.name} velocity Y set to ${y}.`);
    }

    setVelocityZ(z: number) {
        this.gameplayVariables.velocity.z = z;
        console.log(`${this.name} velocity Z set to ${z}.`);
    }
    ////gameplay metodos

    takeDamage(amount: number) {
        // Verifica se a entidade está viva antes de aplicar o dano
        if (this.isAlive) {
            // Reduz a vida atual pelo valor do dano recebido
            this.vidaActual -= amount;
            console.log(`${this.name} recebeu ${amount} de dano. Vida restante: ${this.vidaActual}.`);
    
            // Verifica se a vida atual é menor ou igual a 0
            if (this.vidaActual <= 0) {
                this.vidaActual = 0; // Garante que a vida não seja negativa
                this.isAlive = false; // Marca a entidade como morta
                console.log(`${this.name} morreu.`);
            }
        } else {
            // Caso a entidade já esteja morta
            console.log(`${this.name} já está morto e não pode receber dano.`);
        }
    }
}    
