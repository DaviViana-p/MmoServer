import * as DB from './DB/db.connect';
import * as server from './server';
import * as packets from './packets';
import * as inventario from './inventario';
import * as fs from 'fs';
import * as path from 'path';
import * as Baseitem from './interfaces/BaseItem';

class CraftingSystem {
    private static instance: CraftingSystem;

    // Singleton para garantir uma única instância
    private constructor() {}

    public static getInstance(): CraftingSystem {
        if (!CraftingSystem.instance) {
            CraftingSystem.instance = new CraftingSystem();
        }
        return CraftingSystem.instance;
    }

    // Função para carregar as receitas do arquivo JSON
    private loadRecipes(): any {
        const filePath = path.join(__dirname, 'datas', 'Tables', 'recipes.json');
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading recipes from ${filePath}:`, error);
            return {};
        }
    }

    // Função para buscar a receita com base no nome do item
    public getRecipe(itemName: string): any | null {
        const recipes = this.loadRecipes();
        return recipes.recipes[itemName] || null;
    }

    // Função principal para criar o item
    public craftItem(socket: any, itemName: string): boolean {
        const recipe = this.getRecipe(itemName);
        
        if (!recipe) {
            console.log(`Recipe for ${itemName} not found.`);
            return false; // Retorna false se a receita não for encontrada
        }

        // Verifica se o jogador tem todos os materiais necessários
        if (!this.hasRequiredItems(socket, recipe.items)) {
            console.log(`Não há materiais suficientes para criar ${itemName}.`);
            return false; // Retorna false se não houver materiais suficientes
        }

        console.log(`Crafting ${itemName}...`);
        
        // Consome os materiais do inventário
        this.consumeRequiredItems(socket, recipe.items);
        
        // Cria o item usando o ID da receita
        const itemId = recipe.output;
        const newItem = Baseitem.createItemFromId(itemId);
        
        if (newItem) {
            // Adiciona o item criado ao inventário
            this.addItemToInventory(socket, newItem.name, 1, JSON.stringify(newItem));
            console.log(`${itemName} crafted successfully!`);
            return true; // Retorna true se o item foi criado com sucesso
        } else {
            console.error(`Failed to create item from ID: ${itemId}`);
            return false; // Retorna false se houve um erro na criação do item
        }
    }

    public hasRequiredItems(socket: any, ingredients: any): boolean {
        // Iterar sobre as chaves do objeto ingredients
        for (const idtipo in ingredients) {
            if (ingredients.hasOwnProperty(idtipo)) {
                const requiredAmount = ingredients[idtipo];
                const itemAmount = this.getItemAmount(socket, idtipo); // Obtém a quantidade do item no inventário
                
                if (itemAmount < requiredAmount) {
                    console.log(`Faltam materiais: ${idtipo}. Necessário: ${requiredAmount}, disponível: ${itemAmount}`);
                    return false; // Retorna false se não houver quantidade suficiente
                }
            }
        }
        return true; // Retorna true se todos os itens necessários estão disponíveis
    }

    private getItemAmount(socket: any, idtipo: string): number {
        let totalAmount = 0;
    
       // console.log(`Verificando a quantidade do item: ${idtipo}`); // Log para depuração
    
        // Itera sobre os itens no inventário do socket
        for (const item of socket.inventory) {
           // console.log(`Item encontrado: ${item.idtipo}, quantidade: ${item.amount}`); // Log de cada item
    
            // Verifica se o idtipo do item corresponde ao idtipo procurado
            if (item.idtipo === idtipo) {
                totalAmount += item.amount; // Soma a quantidade do item encontrado
               // console.log(`Adicionando ${item.amount} de ${item.idtipo}. Total agora: ${totalAmount}`); // Log da quantidade total
            }
        }
    
        console.log(`Quantidade total de ${idtipo} encontrada: ${totalAmount}`); // Log do total encontrado
        return totalAmount; // Retorna a quantidade total do item encontrado
    }
    

    private getSlotIdForItem(socket: any, idtipo: string): number | null {
        // Itera sobre os IDs dos contêineres que o socket possui
        for (const containerId of socket.conteinerids) {
            for (let slot = 0; slot < 12; slot++) { // Considerando que há 12 slots por contêiner
                const item: Baseitem.Item | undefined = socket.inventory.find((item: Baseitem.Item) => 
                    item.containerId === containerId && item.slotId === slot && item.idtipo === idtipo
                );
                if (item) {
                    return item.slotId; // Retorna o slotId se o item for encontrado
                }
            }
        }
        return null; // Retorna null se o item não for encontrado
    }

// Função para consumir os materiais necessários do inventário
public consumeRequiredItems(socket: any, ingredients: any): boolean {
    // Iterar sobre as chaves do objeto ingredients
    for (const idtipo in ingredients) {
        if (ingredients.hasOwnProperty(idtipo)) {
            const requiredAmount = ingredients[idtipo];
            const slotId = this.getSlotIdForItem(socket, idtipo); // Obtém o slotId correspondente

            if (slotId !== null) {
                inventario.removerstack(idtipo, requiredAmount, socket); // Chama a função removerstack
                
            } else {
                console.log(`Slot ID não encontrado para o item: ${idtipo}`);
                return false; // Falha: não encontrou o slot ID
            }
        }
    }
    return true; // Caso a iteração sobre os ingredients termine sem sucesso
}


    // Função para adicionar o item criado ao inventário
    private addItemToInventory(socket: any, idtipo: string, amount: number, props: string) {
        inventario.adicionaraoinventario(idtipo, amount, socket.conteinerids, props, socket);
    }
}

export const craftingSystem = CraftingSystem.getInstance();
