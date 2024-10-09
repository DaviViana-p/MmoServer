import { ByteBuffer } from "./lib/bytebuffer";
import * as server from './server'
import * as packets from './packets';

export function handleBroadcastMessage(socket:any, message:ByteBuffer) {
    try {
        // Extrair o nome do jogador e a mensagem do ByteBuffer
        const textMessage = message.getString();
        const playerName = message.getString();
        console.log(textMessage);

        server.broadcast(packets.packetBroadcastMessage(playerName,textMessage),socket.character.id.toString())

        console.log(`Mensagem transmitida de ${playerName}: ${textMessage}`);
    }
     catch (error) {
        console.error("Erro ao processar a mensagem do jogador:", error);
    }
}