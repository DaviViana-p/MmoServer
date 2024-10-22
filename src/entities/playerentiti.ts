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
  private conjuracao: {
      magiaSagrada: number;
      magiaDeAgua: number;
      magiaDeFogo: number;
      magiaDeAr: number;
      necromancia: number;
      cura: number;
      metamagia: number;
  };
  private habilidades: string[];
  private magias: { [magia: string]: number };
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
  private quests: { [questName: string]: string };
  private craftsMemorizados: { [craftName: string]: string };
  private tags: string[];

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
          containers: { [containerId: string]: string[] }
      };
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
      conjuracao: {
          magiaSagrada: number;
          magiaDeAgua: number;
          magiaDeFogo: number;
          magiaDeAr: number;
          necromancia: number;
          cura: number;
          metamagia: number;
      };
      habilidades: string[];
      magias: { [magia: string]: number };
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
      quests: { [questName: string]: string };
      craftsMemorizados: { [craftName: string]: string };
      tags: string[];
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
          characterJson.id
      );
      this.equipamentos = characterJson.equipamentos;
      this.especializacaoCombate = characterJson.especializacaoCombate;
      this.conjuracao = characterJson.conjuracao;
      this.habilidades = characterJson.habilidades;
      this.magias = characterJson.magias;
      this.profissoes = characterJson.profissoes;
      this.quests = characterJson.quests;
      this.craftsMemorizados = characterJson.craftsMemorizados;
      this.tags = characterJson.tags;
  }

  // Getters e Setters
  getEquipamentos() {
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

  getEspecializacaoCombate() {
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

  getConjuracao() {
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

  getHabilidades() {
      return this.habilidades;
  }

  setHabilidades(habilidades: string[]) {
      this.habilidades = habilidades;
  }

  getMagias() {
      return this.magias;
  }

  setMagias(magias: { [magia: string]: number }) {
      this.magias = magias;
  }

  getProfissoes() {
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

  getQuests() {
      return this.quests;
  }

  setQuests(quests: { [questName: string]: string }) {
      this.quests = quests;
  }

  getCraftsMemorizados() {
      return this.craftsMemorizados;
  }

  setCraftsMemorizados(craftsMemorizados: { [craftName: string]: string }) {
      this.craftsMemorizados = craftsMemorizados;
  }

  getTags() {
      return this.tags;
  }

  setTags(tags: string[]) {
      this.tags = tags;
  }
}
