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

export interface ConsumableItem extends BaseItem {
    itemType: "Consumable";        // Specifies the type
    effects: Effect[];             // List of effects when consumed
    usageLimit?: number;           // Number of times the item can be used (for multi-use items)
    cooldownTime?: number;         // Time in seconds before it can be used again
}

export interface Effect {
    effectType: string;            // Type of effect (e.g., "HealthRegen", "ManaRegen", "Buff")
    magnitude: number;             // Power of the effect (e.g., +50 health)
    duration?: number;             // How long the effect lasts (in seconds)
}

export interface EquipableItem extends BaseItem {
    itemType: "Equipable";         // Specifies the type
    slot: string;                  // Slot where the item is equipped (e.g., "Helmet", "Weapon", "Ring")
    stats: StatModifiers;          // Modifiers for character stats (e.g., strength, agility)
    durability: number;            // Durability of the item, decreases with use
    maxDurability: number;         // Maximum durability
    requiredLevel: number;         // Minimum level required to equip
    classRestrictions?: string[];  // Classes that can equip this item
}

export interface StatModifiers {
    strength?: number;
    dexterity?: number;
    vitality?: number;
    magic?: number;
    defense?: number;
    attackPower?: number;
    speed?: number;
}

export interface CraftingMaterialItem extends BaseItem {
    itemType: "CraftingMaterial";  // Specifies the type
    usedInRecipes: string[];       // List of recipes where this material is required
    rarity: string;                // Rarity level for crafting (common, rare, etc.)
}

export interface SocketableItem extends EquipableItem {
    sockets: Socket[];             // List of socket slots available in the item
}

export interface Socket {
    socketType: string;            // Type of socket (e.g., "Gem", "Enchantment")
    isEmpty: boolean;              // Whether the socket is currently empty
    insertedItemId?: string;       // ID of the item (gem, enchantment) inserted
}


export function createItemFromId(idtipo: string): BaseItem | null {

    switch (idtipo) {
        case "consumable_health_potion":
            return {
                id: "item001",
                name: "Health Potion",
                description: "Restores 50 health over 10 seconds.",
                itemType: "Consumable",
                rarity: "Common",
                weight: 0.1,
                value: 25,
                stackable: true,
                maxStackSize: 10,
                icon: "path/to/health_potion.png",
                effects: [
                    {
                        effectType: "HealthRegen",
                        magnitude: 50,
                        duration: 10
                    }
                ]
            } as ConsumableItem;

        case "equipable_steel_sword":
            return {
                id: "item002",
                name: "Steel Sword",
                description: "A sturdy sword made of steel.",
                itemType: "Equipable",
                rarity: "Uncommon",
                weight: 5,
                value: 100,
                stackable: false,
                maxStackSize: 1,
                icon: "path/to/steel_sword.png",
                slot: "Weapon",
                stats: {
                    strength: 10,
                    attackPower: 15,
                    speed: -1
                },
                durability: 100,
                maxDurability: 100,
                requiredLevel: 5,
                classRestrictions: ["Warrior", "Paladin"]
            } as EquipableItem;

        case "crafting_iron_ore":
            return {
                id: "item003",
                name: "Iron Ore",
                description: "A raw material used for crafting weapons and armor.",
                itemType: "CraftingMaterial",
                rarity: "Common",
                weight: 2,
                value: 10,
                stackable: true,
                maxStackSize: 20,
                icon: "path/to/iron_ore.png",
                usedInRecipes: ["Steel Sword", "Iron Shield"]
            } as CraftingMaterialItem;

            case 'Tree':
                return {
                    id: "craft001",
                    name: "Árvore Comum22222",
                    description: "Uma árvore comum do ambiente1.",
                    itemType: ItemType.CraftingMaterial,
                    rarity: "Common",
                    weight: 0.1,
                    value: 5,
                    stackable: true,
                    maxStackSize: 5,
                    icon: "path/to/tree_icon.png",
                };
    
            case 'Pedra':
                return {
                        id: "craft002",
                        name: "Pedra Básica3333",
                        description: "Uma pedra extraída do ambiente.",
                        itemType: "CraftingMaterial",
                        rarity: "Common",
                        weight: 0.2,
                        value: 8,
                        stackable: true,
                        maxStackSize: 30,
                        icon: "path/to/stone_icon.png"
                    }
    
            case 'Crystal_Shard':
                return {
                    id: "craft003",
                    name: "Fragmento de Cristal",
                    description: "Um fragmento de cristal mágico.",
                    itemType: ItemType.CraftingMaterial,
                    rarity: "Uncommon",
                    weight: 0.5,
                    value: 50,
                    stackable: true,
                    maxStackSize: 10,
                    icon: "path/to/crystal_shard_icon.png",
                };
    
            default:
            console.error(`Item type ${idtipo} not recognized.`);
            return null; // Return null if the item type is not recognized
    }
}