// connection.ts
import { ByteBuffer } from './lib/bytebuffer';
import { characters } from './interfaces/characters.interface';

// Função para criar pacote de sessão
export function packetSession(id: string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(0);
    buffer.putString(id);
    return buffer;
}

// Função para criar pacote de conta criada
export function packetAccountCreated(userId: number): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(1); // Defina um novo byte para o pacote de conta criada
    buffer.putInt32(userId); // Adiciona o ID do novo usuário
    return buffer;
}
//falha ao criar conta
export function packetAccountCreationFailed(): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(2); // Defina um novo byte para o pacote de conta criada
    buffer.putString("falha ao criar conta");
    return buffer;
}


// Função para criar pacote de movimento
export function packetMove(id: string, position: { x: number, y: number, z: number,xr: number, yr: number, zr: number,},vx: number, vy: number, vz: number ): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(6);
    buffer.putString(id);
    buffer.putInt32(position.x);
    buffer.putInt32(position.y);
    buffer.putInt32(position.z);
    buffer.putInt32(position.xr);
    buffer.putInt32(position.yr);
    buffer.putInt32(position.zr);
    buffer.putInt32(vx);
    buffer.putInt32(vy);
    buffer.putInt32(vz);
    return buffer;
}

// Função para criar pacote de salto
export function packetJump(id: string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(3);
    buffer.putString(id);
    return buffer;
}

// Função para criar pacote de criação de jogador
export function packetCreatePlayer(id: string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(1);
    buffer.putString(id);
    return buffer;
}

// Função para avisar que o login foi um sucesso
export function packetLoginSuccess(): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(2);
    return buffer;
}

export function packetLoginError(text:string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(3);
    buffer.putString(text);
    return buffer;
}

export function packetCharactersList(charactersList: characters[]): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(4); // Exemplo de tipo de pacote para lista de personagens

    buffer.putInt32(charactersList.length); // Adiciona o número de personagens

    charactersList.forEach((character: characters) => {
        buffer.putInt32(character.id);
        buffer.putString(character.nome);
        buffer.putString(character.characterinfo);
        buffer.putInt32(character.accountID);
    });

    return buffer;
}

export function entrarnomundo(mapNamespace:string, character:any): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(5);
    buffer.putString(mapNamespace);
    buffer.putInt32(character.id);
    buffer.putString(character.nome);
    buffer.putString(character.characterinfo);
    buffer.putInt32(character.accountID);
    return buffer;
}

export function spawnproxy(characterName:number, characterInfo:string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(7);
    buffer.putInt32(characterName);
    buffer.putString(characterInfo);
    return buffer;
}

export function removecharacter(characterName:number,): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(8);
    buffer.putInt32(characterName);
    return buffer;
}

export function packetInventory(inventory: any[],containerIds: any[]): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(9); // Define um código de pacote para o inventário (o número 8 é apenas um exemplo)

    buffer.putInt32(containerIds.length);
    containerIds.forEach(conteinerid =>{
        buffer.putInt32(conteinerid);
    })
    // Primeiro, enviamos o número total de itens no inventário
    buffer.putInt32(inventory.length);

    // Iterar por cada item no inventário e adicionar seus dados ao buffer
    inventory.forEach(item => {
        buffer.putInt32(item.id);
        buffer.putString(item.idtipo);
        buffer.putInt32(item.amount);
        buffer.putString(item.containerId);
        buffer.putInt32(item.slotId);
        buffer.putString(item.props); 
    });

    return buffer;
}


export function packetBroadcastMessage(playerName:string,textMessage: string): ByteBuffer {
    let buffer = new ByteBuffer();
    buffer.putByte(10);  // Tipo de mensagem para broadcast
    buffer.putString(playerName);
    buffer.putString(textMessage);
    return buffer;
}


