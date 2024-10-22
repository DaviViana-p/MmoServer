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

  private mapa: Mapa;

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
      containers: { [containerId: string]: string[] }},
    isAlive: boolean,
    vidaActual: number,
    vidaMaxima: number,
    manaActual: number,
    manaMaxima: number,
    id: string,
  ) {
    this.mapa = mapa;
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
    return this.mapa;
  }

  setMapa(mapa: Mapa) {
    this.mapa = mapa;
  }

  getGameplayVariables(): {
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
  } {
    return this.gameplayVariables;
  }

  setGameplayVariables(gameplayVariables: {
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
  }) {
    this.gameplayVariables = gameplayVariables;
  }
  
}