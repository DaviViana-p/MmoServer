import { Mapa } from '../maps';
import * as packets from '../packets';
import { Entity } from './entity';

export class PlayerEntity extends Entity {
    socket: any;
  private equipamentos: {
    elmo: string;
    peitoral: string;
    calca: string;
    bota: string;
    aneis: string;
    capa: string;
    colar: string;
    amuleto: string;
  };
  private especializacaoCombate: {
    guerreiro: number;
    mago: number;
    sacerdote: number;
    assassino: number;
  };
  private profissoes: {
    pescador: number;
    pintor: number;
    bardo: number;
    dancarino: number;
    cozinheiro: number;
    herbalista: number;
    mestreDasBestas: number;
    alfaiate: number;
    construtor: number;
    alquimista: number;
    comerciante: number;
  };
  private tags: string[];
  private conjuracao: {
    magiaSagrada: number;
    magiaDeAgua: number;
    magiaDeFogo: number;
    magiaDeAr: number;
    necromancia: number;
    cura: number;
    metamagia: number;
  };

  constructor(characterJson: {
    mapa: Mapa;
    x: number;
    y: number;
    z: number;
    name: string;
    aparence: string;
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
        containers: { [containerId: string]: string[] }};
    isAlive: boolean;
    vidaActual: number;
    vidaMaxima: number;
    manaActual: number;
    manaMaxima: number;
    id: string;
    equipamentos: {
      elmo: string;
      peitoral: string;
      calca: string;
      bota: string;
      aneis: string;
      capa: string;
      colar: string;
      amuleto: string;
    };
    especializacaoCombate: {
      guerreiro: number;
      mago: number;
      sacerdote: number;
      assassino: number;
    };
    profissoes: {
      pescador: number;
      pintor: number;
      bardo: number;
      dancarino: number;
      cozinheiro: number;
      herbalista: number;
      mestreDasBestas: number;
      alfaiate: number;
      construtor: number;
      alquimista: number;
      comerciante: number;
    };
    tags: string[];
    conjuracao: {
      magiaSagrada: number;
      magiaDeAgua: number;
      magiaDeFogo: number;
      magiaDeAr: number;
      necromancia: number;
      cura: number;
      metamagia: number;
    };
  }, socket: any) {
    super(
      characterJson.mapa,
      characterJson.name,
      characterJson.aparence,
      characterJson.gameplayVariables,
      characterJson.isAlive,
      characterJson.vidaActual,
      characterJson.vidaMaxima,
      characterJson.manaActual,
      characterJson.manaMaxima,
      characterJson.id);
    this.equipamentos = characterJson.equipamentos;
    this.especializacaoCombate = characterJson.especializacaoCombate;
    this.profissoes = characterJson.profissoes;
    this.tags = characterJson.tags;
    this.conjuracao = characterJson.conjuracao;
  }


    // Getters e Setters
  getEquipamentos(): {
    elmo: string;
    peitoral: string;
    calca: string;
    bota: string;
    aneis: string;
    capa: string;
    colar: string;
    amuleto: string;
  } {
    return this.equipamentos;
  }

  setEquipamentos(equipamentos: {
    elmo: string;
    peitoral: string;
    calca: string;
    bota: string;
    aneis: string;
    capa: string;
    colar: string;
    amuleto: string;
  }) {
    this.equipamentos = equipamentos;
  }

  getEspecializacaoCombate(): {
    guerreiro: number;
    mago: number;
    sacerdote: number;
    assassino: number;
  } {
    return this.especializacaoCombate;
  }

  setEspecializacaoCombate(especializacaoCombate: {
    guerreiro: number;
    mago: number;
    sacerdote: number;
    assassino: number;
  }) {
    this.especializacaoCombate = especializacaoCombate;
  }

  getProfissoes(): {
    pescador: number;
    pintor: number;
    bardo: number;
    dancarino: number;
    cozinheiro: number;
    herbalista: number;
    mestreDasBestas: number;
    alfaiate: number;
    construtor: number;
    alquimista: number;
    comerciante: number;
  } {
    return this.profissoes;
  }

  setProfissoes(profissoes: {
    pescador: number;
    pintor: number;
    bardo: number;
    dancarino: number;
    cozinheiro: number;
    herbalista: number;
    mestreDasBestas: number;
    alfaiate: number;
    construtor: number;
    alquimista: number;
    comerciante: number;
  }) {
    this.profissoes = profissoes;
  }

  getTags(): string[] {
    return this.tags;
  }

  setTags(tags: string[]) {
    this.tags = tags;
  }

  getConjuracao(): {
    magiaSagrada: number;
    magiaDeAgua: number;
    magiaDeFogo: number;
    magiaDeAr: number;
    necromancia: number;
    cura: number;
    metamagia: number;
  } {
    return this.conjuracao;
  }

  setConjuracao(conjuracao: {
    magiaSagrada: number;
    magiaDeAgua: number;
    magiaDeFogo: number;
    magiaDeAr: number;
    necromancia: number;
    cura: number;
    metamagia: number;
  }) {
    this.conjuracao = conjuracao;
  }
}