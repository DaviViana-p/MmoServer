import { Entity } from './entity';
import { Mapa } from '../maps';

export class Projectile extends Entity {
  private velocity: number;
  private direction: number;

  constructor(
    mapa: Mapa,
    x: number,
    y: number,
    z: number,
    velocity: number,
    direction: number,
    name: string,
    aparence: string,
    isAlive: boolean,
    vidaActual: number,
    vidaMaxima: number,
    manaActual: number,
    manaMaxima: number,
    id: string,
    socket: any
  ) {
    super(
      mapa,
      x,
      y,
      z,
      name,
      aparence,
      isAlive,
      vidaActual,
      vidaMaxima,
      manaActual,
      manaMaxima,
      id
    );
    this.velocity = velocity;
    this.direction = direction;
  }

  update(deltaTime: number) {
    this.setX(this.getX() + this.velocity * Math.cos(this.direction) * deltaTime);
    this.setY(this.getY() + this.velocity * Math.sin(this.direction) * deltaTime);

    // Verifique se o projetil colidiu com algum mob ou outro player
    this.getMapa().getEntities().forEach((entity: Entity) => {
      if (entity instanceof Mob && this.checkCollision(entity)) {
        // Colidiu com um mob
        console.log('Colidiu com um mob!');
        // Faça algo aqui
      } else if (entity instanceof PlayerEntity && this.checkCollision(entity)) {
        // Colidiu com outro player
        console.log('Colidiu com outro player!');
        // Faça algo aqui
      }
    });
  }

  checkCollision(entity: Entity) {
    // Verifique se o projetil colidiu com a entidade
    const distance = Math.sqrt((this.getX() - entity.getX()) ** 2 + (this.getY() - entity.getY()) ** 2);
    return distance < 10; // Ajuste o valor de colisão aqui
  }
}