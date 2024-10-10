import * as DB from './DB/db.connect';
import * as packets from './packets';
import * as server from './server';

export function adicionaraoinventario(
    idtipo: string,
    amount: number,
    containerIds: number[], // Especifica que é um array de números
    props: string,
    socket: any
) {
    // Função auxiliar para verificar se o slot está ocupado em um determinado contêiner
    function isSlotOccupied(inventory: any[], containerId: number, slotId: number): boolean {
        return inventory.some(item => item.containerId === containerId && item.slotId === slotId);
    }

    // Função auxiliar para encontrar um slot vazio em um contêiner
    function findEmptySlot(inventory: any[], containerId: number): number {
        for (let slot = 0; slot < 12; slot++) { // Considerando 12 slots no inventário
            if (!isSlotOccupied(inventory, containerId, slot)) {
                return slot; // Retorna o slot vazio encontrado
            }
        }
        return -1; // Retorna -1 se todos os slots estiverem ocupados
    }
    // Verifica se o inventário foi carregado
    if (socket.inventory) {
        let itemAdded = false; // Flag para saber se o item foi adicionado

        // Tenta adicionar o item ao primeiro slot disponível em qualquer contêiner
        for (let containerId of containerIds) { // Usa const para melhor prática
            // Tenta encontrar um slot vazio neste contêiner
            const emptySlot = findEmptySlot(socket.inventory, containerId);
            if (emptySlot !== -1) {
                // Adiciona o item no slot vazio encontrado
                DB.createNewItem(idtipo, amount, containerId, emptySlot, props, (success) => {
                    if (success) {
                        console.log(`Novo item criado com sucesso no slot ${emptySlot} do container ${containerId}.`);
                        // Atualiza o inventário e envia para o cliente
                        DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                            if (updatedInventory) {
                                socket.inventory = updatedInventory;
                                server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                            } else {
                                console.log('Erro ao atualizar o inventário após adicionar item.');
                            }
                        });
                    } else {
                        console.log('Falha ao criar o item.');
                    }
                });
                itemAdded = true; // Item foi adicionado
                break; // Sai do loop porque o item foi adicionado
            } else {
                console.log(`Nenhum slot vazio disponível no container ${containerId}.`);
            }
        }

        // Se não houver nenhum slot disponível em nenhum dos contêineres
        if (!itemAdded) {
            console.log('Nenhum slot vazio disponível em todos os containers.');
        }
    } else {
        console.log('Nenhum inventário encontrado ou erro ao carregar.');
    }
}





export function removerdoinventario(id: string) {
    console.error("remover do inventario ainda nao implementado")
    return;
}

export function moverdeumslotprooutro(id: string) {
    console.error("moverdeumslotprooutro ainda nao implementado")
    return;
}
