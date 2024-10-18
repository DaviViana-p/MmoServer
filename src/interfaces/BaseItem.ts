import { readFileSync } from 'fs';

export enum ItemType {
    Consumable = "Consumable",
    Equipable = "Equipable",
    CraftingMaterial = "CraftingMaterial"
}

export interface Item {
    id: number;              // ID do item
    idtipo: string;         // Tipo do item
    amount: number;         // Quantidade do item
    containerId: number;    // ID do contêiner
    slotId: number;         // Slot do inventário
    props: string;          // Propriedades do item em formato JSON
}

export interface BaseItem {
    id: string;                    // Unique identifier for the item
    name: string;                  // Name of the item
    description: string;           // Description or lore about the item
    itemType: string;              // General type (e.g., "Consumable", "Equipable", "CraftingMaterial")
    rarity: string;                // Rarity level (e.g., "Common", "Rare", "Epic")
    weight: number;                // Weight of the item
    value: number;                 // Monetary value of the item
    stackable: boolean;            // Whether the item can stack in the inventory
    maxStackSize: number;          // Maximum number of items in a stack
    icon: string;                  // Path to the item's icon
    tags?: string[];               // Tags for categorization (e.g., "Weapon", "Potion")
}

// Define outras interfaces como ConsumableItem, EquipableItem, etc. como antes

// Carregando itens do JSON
const itemsData: Record<string, BaseItem> = JSON.parse(readFileSync('src/datas/Tables/itens.json', 'utf-8'));

export function createItemFromId(idtipo: string): BaseItem | null {
    const item = itemsData[idtipo];

    if (!item) {
        console.error(`Item type ${idtipo} not recognized.`);
        return null; // Return null if the item type is not recognized
    }

    return item;
}
