export class PlayerEntity {
    private name: string;
    private aparence: string;
    private status: {
        forca: number;
        destreza: number;
        vitalidade: number;
        magia: number;
    };
    private tags: string[];
    private gameplayVariables: {
        transform: {
            x: number, y: number, z: number,
            xr: number, yr: number, zr: number,
            ex: number, ey: number, er: number
        };
        velocity: { x: number, y: number, z: number };
        atualMap: string;
        containers: { [containerId: string]: string[] };
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
    private especializacaoCombate: {
        guerreiro: number;
        mago: number;
        sacerdote: number;
        assassino: number;
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
    private quests: { [questName: string]: string };
    private craftsMemorizados: { [craftName: string]: string };

    constructor(jsonString: string) {
        const data = JSON.parse(jsonString);
        this.name = data.name;
        this.aparence = data.aparence;
        this.status = data.status;
        this.tags = data.tags;
        this.gameplayVariables = data.gameplayVariables;
        this.gameplayVariables = data.gameplayVariables;
        this.conjuracao = data.conjuracao;
        this.especializacaoCombate = data.especializacaoCombate;
        this.habilidades = data.habilidades;
        this.magias = data.magias;
        this.profissoes = data.profissoes;
        this.equipamentos = data.equipamentos;
        this.quests = data.quests;
        this.craftsMemorizados = data.craftsMemorizados;
    }

    // Getters
    getName(): string {
        return this.name;
    }

    getAparence(): string {
        return this.aparence;
    }

    getStatus(): { forca: number; destreza: number; vitalidade: number; magia: number } {
        return this.status;
    }

    getTags(): string[] {
        return this.tags;
    }

    getTransform(): { x: number, y: number, z: number, xr: number, yr: number, zr: number, ex: number, ey: number, er: number } {
        return this.gameplayVariables.transform;
    }

    getGameplayVariables(): {
        transform: { x: number, y: number, z: number };
        velocity: { x: number, y: number, z: number };
        atualMap: string;
        containers: { [containerId: string]: string[] };
    } {
        return this.gameplayVariables;
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

    getEspecializacaoCombate(): {
        guerreiro: number;
        mago: number;
        sacerdote: number;
        assassino: number;
    } {
        return this.especializacaoCombate;
    }

    getHabilidades(): string[] {
        return this.habilidades;
    }

    getMagias(): { [magia: string]: number } {
        return this.magias;
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

    getQuests(): { [questName: string]: string } {
        return this.quests;
    }

    getCraftsMemorizados(): { [craftName: string]: string } {
        return this.craftsMemorizados;
    }

    // Setters
    setName(name: string): void {
        this.name = name;
    }

    setAparence(aparence: string): void {
        this.aparence = aparence;
    }

    setStatus(status: { forca: number; destreza: number; vitalidade: number; magia: number }): void {
        this.status = status;
    }

    setTags(tags: string[]): void {
        this.tags = tags;
    }


    setTransform(x: number, y: number, z: number, xr: number, yr: number, zr: number, ex: number, ey: number, er: number): void {
        this.gameplayVariables.transform = { x, y, z, xr, yr, zr, ex, ey, er };
    }

    setPosition(x: number, y: number, z: number): void {
        this.gameplayVariables.transform.x = x;
        this.gameplayVariables.transform.y = y;
        this.gameplayVariables.transform.z = z;
    }

    setRotation(xr: number, yr: number, zr: number): void {
        this.gameplayVariables.transform.xr = xr;
        this.gameplayVariables.transform.yr = yr;
        this.gameplayVariables.transform.zr = zr;
    }

    seteEscale(ex: number, ey: number, er: number): void {
        this.gameplayVariables.transform.ex = ex;
        this.gameplayVariables.transform.ey = ey;
        this.gameplayVariables.transform.er = er;
    }
    setGameplayVariables(gameplayVariables: {
        transform: { 
            x: number, y: number, z: number, 
            xr: number, yr: number, zr: number, 
            ex: number, ey: number, er: number 
        };
        velocity: { x: number, y: number, z: number };
        atualMap: string;
        containers: { [containerId: string]: string[] };
    }): void {
        this.gameplayVariables = gameplayVariables;
    }
    

    setConjuracao(conjuracao: {
        magiaSagrada: number;
        magiaDeAgua: number;
        magiaDeFogo: number;
        magiaDeAr: number;
        necromancia: number;
        cura: number;
        metamagia: number;
    }): void {
        this.conjuracao = conjuracao;
    }

    setEspecializacaoCombate(especializacaoCombate: {
        guerreiro: number;
        mago: number;
        sacerdote: number;
        assassino: number;
    }): void {
        this.especializacaoCombate = especializacaoCombate;
    }

    setHabilidades(habilidades: string[]): void {
        this.habilidades = habilidades;
    }

    setMagias(magias: { [magia: string]: number }): void {
        this.magias = magias;
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
    }): void {
        this.profissoes = profissoes;
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
    }): void {
        this.equipamentos = equipamentos;
    }

    setQuests(quests: { [questName: string]: string }): void {
        this.quests = quests;
    }

    setCraftsMemorizados(craftsMemorizados: { [craftName: string]: string }): void {
        this.craftsMemorizados = craftsMemorizados;
    }
}
