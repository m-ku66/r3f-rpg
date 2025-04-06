import {
  UnitData,
  UnitTemplate,
  BaseStats,
  UnitAttributes,
  UnitType,
  UnitRarity,
  EntityId,
} from "../types/game";
import { getUnitTemplate } from "../data/unitData";
import { getAbilityTemplates } from "../data/abilityData";

/**
 * UnitService - Manages unit-related operations
 *
 * This service acts as an abstraction layer between the game and unit data,
 * making it easier to switch from local file-based data to a server/database later.
 */
class UnitService {
  private cache: Map<string, UnitTemplate> = new Map();

  constructor() {
    // Initialize cache with templates
    this.initializeCache();
  }

  private initializeCache(): void {
    // In a real implementation, this would download and cache data from the server
    // For now, we'll just simulate it by pre-loading from our local data files
    console.log("Initializing unit template cache...");
  }

  /**
   * Get a unit template by ID
   */
  public getUnitTemplate(templateId: string): UnitTemplate | undefined {
    // First check cache
    if (this.cache.has(templateId)) {
      return this.cache.get(templateId);
    }

    // If not in cache, try to get from data file
    const template = getUnitTemplate(templateId);

    // If found, add to cache for future use
    if (template) {
      this.cache.set(templateId, template);
    }

    return template;
  }

  /**
   * Create a unit instance from a template
   */
  public createUnitFromTemplate(
    id: string,
    templateId: string,
    position: [number, number, number],
    customName?: string
  ): UnitData | null {
    const template = this.getUnitTemplate(templateId);

    if (!template) {
      console.error(`Cannot create unit: Template ${templateId} not found`);
      return null;
    }

    // Get abilities for this unit
    const abilities = getAbilityTemplates(template.abilityIds);

    // Create unit data from template
    const unitData: UnitData = {
      id,
      templateId,
      name: customName || template.name,
      type: template.type,
      position,
      stats: { ...template.baseStats },
      attributes: { ...template.attributes },
      abilities: getAbilityTemplates(template.abilityIds).map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        cost: template.costValue,
        range: template.range,
        area: template.area,
        effect: (target: EntityId) => {
          // Implement the effect logic here
        },
      })),
      level: template.baseStats.level,
      exp: template.baseStats.exp,
      affinity: template.affinity,
      modelId: template.modelId,
      currentState: "idle",
    };

    return unitData;
  }

  /**
   * Level up a unit
   */
  public levelUpUnit(unit: UnitData): UnitData {
    const template = this.getUnitTemplate(unit.templateId);

    if (!template) {
      console.error(
        `Cannot level up unit: Template ${unit.templateId} not found`
      );
      return unit;
    }

    // Calculate new stats based on growth rates
    const newStats = { ...unit.stats };
    newStats.level += 1;

    // Apply growth rates to stats
    for (const [key, growthRate] of Object.entries(template.growthRates)) {
      if (key in newStats) {
        // Apply growth based on rates
        // Using a random factor for some variability in growth
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const growth = Math.round(growthRate * randomFactor);

        // Apply to stats
        newStats[key as keyof BaseStats] += growth;
      }
    }

    // Return updated unit
    return {
      ...unit,
      stats: newStats,
    };
  }

  /**
   * Calculate unit's derived stats (could be used after equipment changes, buffs, etc.)
   */
  public recalculateUnitAttributes(unit: UnitData): UnitAttributes {
    const attributes = { ...unit.attributes };

    // These would be calculated based on base attributes plus any
    // bonuses from equipment, buffs, etc.

    return attributes;
  }

  /**
   * Get filtered list of unit templates
   */
  public getUnitTemplates(filters?: {
    type?: UnitType;
    rarity?: UnitRarity;
    minLevel?: number;
    maxLevel?: number;
  }): UnitTemplate[] {
    // Implement filtering logic
    // In a real implementation, this might hit a server API

    // For now, just return templates from the data file
    // Filtering would happen here
    const templates = Object.values(
      getUnitTemplate("") ? {} : {}
    ) as UnitTemplate[];

    return templates;
  }

  /**
   * Simulate API call to fetch a unit by ID
   */
  public async fetchUnitById(unitId: string): Promise<UnitData | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would make an API call
    // For now, return null as this is just a skeleton
    return null;
  }

  /**
   * Simulate API call to save a unit
   */
  public async saveUnit(unit: UnitData): Promise<boolean> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would make an API call
    console.log("Saving unit:", unit.id);

    return true;
  }
}

// Export a singleton instance
export const unitService = new UnitService();

export default unitService;
