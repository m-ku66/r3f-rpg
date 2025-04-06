import { Affinity } from "../types/game";

/**
 * Interface for ability templates
 */
export interface AbilityTemplate {
  id: string;
  name: string;
  description: string;
  costType: "mp" | "sp" | "hp" | "none";
  costValue: number;
  range: number;
  area: number;
  affinity: Affinity;
  targetType: "enemy" | "ally" | "self" | "tile";
  effects: string[]; // Effect IDs that this ability applies
  animationId: string;
  cooldown: number; // In turns
  unlockLevel: number; // Level required to unlock this ability
}

/**
 * Database of all abilities in the game
 */
export const abilityTemplates: Record<string, AbilityTemplate> = {
  // Basic Attacks
  basic_attack: {
    id: "basic_attack",
    name: "Attack",
    description: "A basic attack that deals physical damage based on PATK.",
    costType: "sp",
    costValue: 5,
    range: 1,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "enemy",
    effects: ["deal_physical_damage"],
    animationId: "anim_basic_attack",
    cooldown: 0,
    unlockLevel: 1,
  },

  // Warrior abilities
  shield_bash: {
    id: "shield_bash",
    name: "Shield Bash",
    description:
      "Strikes an enemy with your shield, dealing moderate damage and stunning them for 1 turn.",
    costType: "sp",
    costValue: 15,
    range: 1,
    area: 0,
    affinity: Affinity.EARTH,
    targetType: "enemy",
    effects: ["deal_physical_damage", "apply_stun"],
    animationId: "anim_shield_bash",
    cooldown: 3,
    unlockLevel: 3,
  },
  provoke: {
    id: "provoke",
    name: "Provoke",
    description:
      "Taunts nearby enemies, forcing them to target you for 2 turns.",
    costType: "sp",
    costValue: 10,
    range: 0,
    area: 2,
    affinity: Affinity.NEUTRAL,
    targetType: "enemy",
    effects: ["apply_taunt"],
    animationId: "anim_provoke",
    cooldown: 4,
    unlockLevel: 5,
  },

  // Archer abilities
  precise_shot: {
    id: "precise_shot",
    name: "Precise Shot",
    description:
      "A carefully aimed shot that deals high damage with increased critical hit chance.",
    costType: "sp",
    costValue: 12,
    range: 5,
    area: 0,
    affinity: Affinity.WIND,
    targetType: "enemy",
    effects: ["deal_physical_damage", "increased_crit"],
    animationId: "anim_precise_shot",
    cooldown: 2,
    unlockLevel: 2,
  },
  multishot: {
    id: "multishot",
    name: "Multishot",
    description:
      "Fires multiple arrows at nearby enemies, dealing damage to all targets in the area.",
    costType: "sp",
    costValue: 20,
    range: 4,
    area: 1,
    affinity: Affinity.WIND,
    targetType: "enemy",
    effects: ["deal_physical_damage"],
    animationId: "anim_multishot",
    cooldown: 3,
    unlockLevel: 5,
  },

  // Mage abilities
  fireball: {
    id: "fireball",
    name: "Fireball",
    description:
      "Launches a ball of fire that deals magical damage and can burn the target.",
    costType: "mp",
    costValue: 10,
    range: 3,
    area: 1,
    affinity: Affinity.FIRE,
    targetType: "enemy",
    effects: ["deal_magical_damage", "apply_burn"],
    animationId: "anim_fireball",
    cooldown: 2,
    unlockLevel: 1,
  },
  lightning_bolt: {
    id: "lightning_bolt",
    name: "Lightning Bolt",
    description:
      "Calls down a bolt of lightning, dealing high magical damage to a single target.",
    costType: "mp",
    costValue: 15,
    range: 4,
    area: 0,
    affinity: Affinity.LIGHTNING,
    targetType: "enemy",
    effects: ["deal_magical_damage"],
    animationId: "anim_lightning",
    cooldown: 3,
    unlockLevel: 4,
  },
  ice_shard: {
    id: "ice_shard",
    name: "Ice Shard",
    description:
      "Launches a shard of ice that deals magical damage and can slow the target.",
    costType: "mp",
    costValue: 12,
    range: 3,
    area: 0,
    affinity: Affinity.WATER,
    targetType: "enemy",
    effects: ["deal_magical_damage", "apply_slow"],
    animationId: "anim_ice_shard",
    cooldown: 2,
    unlockLevel: 3,
  },

  // Healer abilities
  heal: {
    id: "heal",
    name: "Heal",
    description: "Restores HP to a single ally based on MATK.",
    costType: "mp",
    costValue: 10,
    range: 3,
    area: 0,
    affinity: Affinity.WATER,
    targetType: "ally",
    effects: ["restore_hp"],
    animationId: "anim_heal",
    cooldown: 1,
    unlockLevel: 1,
  },
  mass_heal: {
    id: "mass_heal",
    name: "Mass Heal",
    description: "Restores HP to all allies in an area based on MATK.",
    costType: "mp",
    costValue: 20,
    range: 3,
    area: 2,
    affinity: Affinity.WATER,
    targetType: "ally",
    effects: ["restore_hp"],
    animationId: "anim_mass_heal",
    cooldown: 4,
    unlockLevel: 8,
  },
  revive: {
    id: "revive",
    name: "Revive",
    description: "Resurrects a fallen ally with 50% HP.",
    costType: "mp",
    costValue: 30,
    range: 2,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "ally",
    effects: ["revive"],
    animationId: "anim_revive",
    cooldown: 6,
    unlockLevel: 10,
  },
  protect: {
    id: "protect",
    name: "Protect",
    description:
      "Creates a barrier around an ally, reducing damage taken by 30% for 3 turns.",
    costType: "mp",
    costValue: 15,
    range: 3,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "ally",
    effects: ["apply_barrier"],
    animationId: "anim_protect",
    cooldown: 3,
    unlockLevel: 3,
  },

  // Rogue abilities
  backstab: {
    id: "backstab",
    name: "Backstab",
    description:
      "Strikes an enemy from behind, dealing high damage with guaranteed critical hit if attacking from behind.",
    costType: "sp",
    costValue: 15,
    range: 1,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "enemy",
    effects: ["deal_physical_damage", "positional_bonus"],
    animationId: "anim_backstab",
    cooldown: 2,
    unlockLevel: 2,
  },
  poison_strike: {
    id: "poison_strike",
    name: "Poison Strike",
    description:
      "Attacks with a poisoned weapon, dealing damage over time for 3 turns.",
    costType: "sp",
    costValue: 12,
    range: 1,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "enemy",
    effects: ["deal_physical_damage", "apply_poison"],
    animationId: "anim_poison_strike",
    cooldown: 3,
    unlockLevel: 4,
  },
  shadow_step: {
    id: "shadow_step",
    name: "Shadow Step",
    description:
      "Teleports to a nearby location, allowing you to move through obstacles.",
    costType: "sp",
    costValue: 18,
    range: 3,
    area: 0,
    affinity: Affinity.NEUTRAL,
    targetType: "tile",
    effects: ["teleport"],
    animationId: "anim_shadow_step",
    cooldown: 4,
    unlockLevel: 6,
  },
};

// Helper function to get an ability template by ID
export function getAbilityTemplate(id: string): AbilityTemplate | undefined {
  return abilityTemplates[id];
}

// Helper function to get multiple ability templates by IDs
export function getAbilityTemplates(ids: string[]): AbilityTemplate[] {
  return ids.map((id) => abilityTemplates[id]).filter(Boolean);
}

// Helper function to get abilities by affinity
export function getAbilitiesByAffinity(affinity: Affinity): AbilityTemplate[] {
  return Object.values(abilityTemplates).filter(
    (ability) => ability.affinity === affinity
  );
}

// Helper function to get abilities by minimum level
export function getAbilitiesByMinLevel(level: number): AbilityTemplate[] {
  return Object.values(abilityTemplates).filter(
    (ability) => ability.unlockLevel <= level
  );
}
