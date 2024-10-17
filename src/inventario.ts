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

    function findStack(inventory: any[], containerId: number, idtipo: string): number {
        // Procura por um item empilhável com quantidade menor que maxStackSize
        for (let slot = 0; slot < 12; slot++) { // Considerando 12 slots no inventário
            const item = inventory.find((i: any) => i.containerId === containerId && i.idtipo === idtipo && i.slotId === slot);
            
            // Se o item existe, verifica se é empilhável e se a quantidade é menor que maxStackSize
            if (item) {
                try {
                    //console.log('Item encontrado:', item.containerId, item.slotId, item.idtipo);
                    const itemProps = JSON.parse(item.props);
                    
                    // Verifica se o item é empilhável e se a quantidade é menor que maxStackSize
                    if (itemProps.Infos.stackable && item.amount < itemProps.Infos.maxStackSize) {
                        return item.slotId; // Retorna o slot onde o item pode ser atualizado
                    }
                } catch (error) {
                    console.error(`Erro ao analisar props do item no slot ${slot}: `, error);
                }
            }
        }
    
        // Se não encontrar um item empilhável com espaço disponível, retorna -1
        console.log(`Nenhum item empilhável disponível para ${idtipo} com quantidade menor que o máximo.`);
        return -1; // Retorna -1 se não encontrar um item empilhável com espaço disponível
    }
    

    // Verifica se o inventário foi carregado
    if (!socket.inventory) {
        console.log('Nenhum inventário encontrado ou erro ao carregar.');
        return;
    }

    let itemAdded = false; // Flag para saber se o item foi adicionado

    // Tenta adicionar o item ao primeiro slot disponível em qualquer contêiner
    for (let containerId of containerIds) {
        const stackSlot: number = findStack(socket.inventory, containerId, idtipo); // Atualizado para considerar o containerId
        console.log("Stack slot encontrado:", stackSlot);

        if (stackSlot !== -1) {
            // Se encontrou um slot para empilhar
            DB.updateItemAmount(idtipo, containerId, stackSlot, amount, (success) => {
                if (success) {
                    console.log(`Item empilhado com sucesso no slot ${stackSlot} do container ${containerId}.`);
                    itemAdded = true;
                    DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                        if (updatedInventory) {
                            socket.inventory = updatedInventory;
                            server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                        } else {
                            console.log('Erro ao atualizar o inventário após adicionar item.');
                        }
                    });
                } else {
                    console.log('Erro ao atualizar o item empilhado.');
                }
            });
            return; // Saída do loop principal após o sucesso da empilhagem
        } else {
            // Tenta encontrar um slot vazio neste contêiner
            const emptySlot = findEmptySlot(socket.inventory, containerId);
            console.log(`Slot vazio encontrado no container ${containerId}:`, emptySlot);

            if (emptySlot !== -1) {
                // Adiciona o item no slot vazio encontrado
                DB.createNewItem(idtipo, amount, containerId, emptySlot, props, (success) => {
                    if (success) {
                        itemAdded = true;
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
                return; // Saída do loop principal após a criação de um novo item
            } else {
               // console.log('idtipo',idtipo)
                socket.mapaatual?.createGatherable('item', socket.character.gameplayVariables.transform,idtipo);
            }
        }
    }

    // Se não houver nenhum slot disponível em nenhum dos contêineres
    if (!itemAdded) {
        console.log('Nenhum slot vazio disponível em todos os containers.');
    }
}



export function removerdoinventario(idtipo: string, slotId: number, socket: any) {
    DB.deleteItem(idtipo, socket.conteinerids, slotId, (deleteSuccess) => {
        if (deleteSuccess) {
            console.log('Item removido com sucesso do inventário.');
            // Atualiza o inventário do jogador e envia o pacote atualizado
            DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                if (updatedInventory) {
                    socket.inventory = updatedInventory;
                    server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                } else {
                    console.log('Erro ao atualizar o inventário após remover item.');
                }
            });
        } else {
            console.log('Erro ao remover item do inventário.');
        }
    });
}


export function moverdeumslotprooutro(idtipo: string, fromSlotId: number, toSlotId: number, containerId: number, socket: any) {
    // Verifica se o inventário está carregado
    if (!socket.inventory) {
        console.log('Nenhum inventário encontrado ou erro ao carregar.');
        return;
    }

    // Procura o item no slot de origem
    const item = socket.inventory.find((i: any) => i.containerId === containerId && i.slotId === fromSlotId && i.idtipo === idtipo);

    if (!item) {
        console.log(`Item com idtipo ${idtipo} no slot ${fromSlotId} não encontrado no container ${containerId}.`);
        return;
    }

    // Verifica se o slot de destino já está ocupado
    const destinationSlot = socket.inventory.find((i: any) => i.containerId === containerId && i.slotId === toSlotId);
    if (destinationSlot) {
        console.log(`Slot de destino ${toSlotId} no container ${containerId} já está ocupado.`);
        return;
    }

    // Usa a função updateslot para mover o item
    DB.updateslot(idtipo, containerId, toSlotId, (success) => {
        if (success) {
            console.log(`Item movido com sucesso do slot ${fromSlotId} para o slot ${toSlotId} no container ${containerId}.`);

            // Atualiza o inventário no socket
            DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                if (updatedInventory) {
                    socket.inventory = updatedInventory;
                    server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                } else {
                    console.log('Erro ao atualizar o inventário após mover item.');
                }
            });
        } else {
            console.log('Erro ao mover o item.');
        }
    });
}


export function adicionarstack(idtipo: string, amount: number, slotid: number, socket: any) {
    DB.updateItemAmount(idtipo, socket.conteinerids, slotid, amount, (success) => {  // Para retirar 1 do amount
        if (success) {
            console.log('Item atualizado com sucesso no inventário.');
        } else {
            console.log('Erro ao atualizar item no inventário.');
        }
    });
}

export function removerstack(idtipo: string, amount: number, slotId: number, socket: any) {
    // Atualiza o amount do item, subtraindo a quantidade
    DB.updateItemAmount(idtipo, socket.conteinerids, slotId, -amount, (success) => {
        if (success) {
            // Verifica se o amount foi atualizado para 0
            const currentAmount = getItemAmount(idtipo, socket.conteinerids, slotId, socket);
            if (currentAmount === 0) {
                // Remove o item do inventário se o amount for 0
                DB.deleteItem(idtipo, socket.conteinerids, slotId, (deleteSuccess) => {
                    if (deleteSuccess) {
                        console.log('Item removido com sucesso do inventário.');
                        // Atualiza o inventário do jogador e envia o pacote atualizado
                        DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                            if (updatedInventory) {
                                socket.inventory = updatedInventory;
                                server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                            } else {
                                console.log('Erro ao atualizar o inventário após remover item.');
                            }
                        });
                    } else {
                        console.log('Erro ao remover item do inventário.');
                    }
                });
            } else {
                console.log('Item atualizado com sucesso no inventário.');
                // Atualiza o inventário após a redução do stack
                DB.getContainerIdsByOwnerId(socket.characterId, (updatedInventory) => {
                    if (updatedInventory) {
                        socket.inventory = updatedInventory;
                        server.sendPacket(socket, packets.packetInventory(socket.inventory, socket.conteinerids));
                    } else {
                        console.log('Erro ao atualizar o inventário após remover stack.');
                    }
                });
            }
        } else {
            console.log('Erro ao remover stack do inventário.');
        }
    });
}


export function getItemAmount(idtipo: string, containerId: number, slotId: number, socket: any): number | null {
    const inventory = socket.inventory;

    // Procura o item no inventário do socket
    const item = inventory.find((i: any) => i.idtipo === idtipo && i.containerId === containerId && i.slotId === slotId);

    if (item) {
        return item.amount; // Retorna a quantidade de itens encontrados
    } else {
        console.log(`Item com idtipo ${idtipo}, containerId ${containerId}, e slotId ${slotId} não encontrado no inventário.`);
        return null; // Retorna null se o item não for encontrado
    }
}


/*export function dropar(idtipo: string, amount: number, containerId: number, slotId: number, socket: any) {
    // Primeiro, verificamos se o item existe no inventário do jogador
    const item = socket.inventory.find((i: any) => i.idtipo === idtipo && i.containerId === containerId && i.slotId === slotId);

    if (!item) {
        console.log(`Item com idtipo ${idtipo} não encontrado no slot ${slotId} do container ${containerId}.`);
        return;
    }

    // Atualiza o stack do item ou remove o item completamente se o amount for igual ao item.amount
    if (item.amount > amount) {
        // Reduz o stack do item no inventário
        removerstack(idtipo, amount, slotId, socket);
    } else {
        // Remove o item completamente do inventário
        removerdoinventario(idtipo, slotId, socket);
    }

    // Agora precisamos criar o item no mundo, ou seja, gerar o "drop" no mapa
    const dropPosition = socket.position; // Supondo que a posição do jogador seja conhecida no socket
    const dropData = {
        idtipo: idtipo,
        amount: amount,
        position: dropPosition, // Posição onde o item será droppado
        droppedBy: socket.characterId // Para identificar quem droppou o item, caso necessário
    };

    socket.mapaatual?.createGatherable(dropData.idtipo,socket.position)
    // Envia o pacote de criação do item para os jogadores próximos
    //server.sendPacketToNearbyPlayers(socket, packets.packetDropItem(dropData));

    console.log(`Item ${idtipo} com quantidade ${amount} droppado no mapa na posição ${JSON.stringify(dropPosition)}.`);
}
*/
