export class CharacterInfoFormat {
    private characterInfo: {
        name: string;
        aparence: string;
        status: {
            forca: number;
            destreza: number;
            vitalidade: number;
            magia: number;
        };
        tags: string[];
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
            velocity: { x: number; y: number; z: number };
            atualMap: string;
            containers: { [containerId: string]: string[] };
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
        especializacaoCombate: {
            guerreiro: number;
            mago: number;
            sacerdote: number;
            assassino: number;
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
        quests: { [questName: string]: string };
        craftsMemorizados: { [craftName: string]: string };
    };

    constructor(jsonString: string) {
        this.characterInfo = JSON.parse(jsonString);
    }

    getBaseCharacterInfo(): object {
        return {
            name: this.characterInfo.name,
            aparence: this.characterInfo.aparence,
            status: this.characterInfo.status,
            tags: this.characterInfo.tags,
            gameplayVariables: this.characterInfo.gameplayVariables,
            conjuracao: this.characterInfo.conjuracao,
            especializacaoCombate: this.characterInfo.especializacaoCombate,
            habilidades: this.characterInfo.habilidades,
            magias: this.characterInfo.magias,
            profissoes: this.characterInfo.profissoes,
            equipamentos: this.characterInfo.equipamentos,
            quests: this.characterInfo.quests,
            craftsMemorizados: this.characterInfo.craftsMemorizados
        };
    }
}

// Exemplo de uso
const jsonString = `{
    "name": "John",
    "aparence": "Cavaleiro",
    "status": {
        "forca": 10,
        "destreza": 8,
        "vitalidade": 12,
        "magia": 5
    },
    "tags": ["tag1", "tag2"],
    "gameplayVariables": {
        "transform": { 
            "x": 0, "y": 0, "z": 0, 
            "xr": 0, "yr": 0, "zr": 0, 
            "ex": 0, "ey": 0, "er": 0 
        },
        "velocity": { "x": 1, "y": 1, "z": 1 },
        "atualMap": "map1",
        "containers": { "container1": ["item1", "item2"] }
    },
    "conjuracao": {
        "magiaSagrada": 3,
        "magiaDeAgua": 4,
        "magiaDeFogo": 2,
        "magiaDeAr": 1,
        "necromancia": 0,
        "cura": 5,
        "metamagia": 1
    },
    "especializacaoCombate": {
        "guerreiro": 10,
        "mago": 5,
        "sacerdote": 3,
        "assassino": 7
    },
    "habilidades": ["habilidade1", "habilidade2"],
    "magias": { "magia1": 2, "magia2": 3 },
    "profissoes": {
        "pescador": 2,
        "pintor": 3,
        "bardo": 1,
        "dancarino": 1,
        "cozinheiro": 4,
        "herbalista": 2,
        "mestreDasBestas": 1,
        "alfaiate": 3,
        "construtor": 2,
        "alquimista": 3,
        "comerciante": 5
    },
    "equipamentos": {
        "elmo": "Elmo de Aço",
        "peitoral": "Peitoral de Ferro",
        "calca": "Calça de Couro",
        "bota": "Bota de Aço",
        "aneis": "Anel de Ouro",
        "capa": "Capa Mágica",
        "colar": "Colar de Pérolas",
        "amuleto": "Amuleto Místico"
    },
    "quests": { "quest1": "completa", "quest2": "incompleta" },
    "craftsMemorizados": { "craft1": "detalhe1", "craft2": "detalhe2" }
}`;

const characterInfo = new CharacterInfoFormat(jsonString);
console.log(characterInfo.getBaseCharacterInfo());
