export type EntityId = string;

// Base stats that any unit would have
// These directly affect how a unit performs in battle
export interface BaseStats {
  // STATS
  level: number; // Unit level
  exp: number; // Experience points
  hp: number; // Current HP. If 0, the unit is KO'd
  maxHp: number; // Max HP
  patk: number; // Physical attack power
  matk: number; // Magical attack power
  range: number; // Range of attack (how far the unit can attack)
  def: number; // Physical defense. Reduces damage from physical attacks(ex: 10def = 10% damage reduction)
  res: number; // Magical defense. Reduces damage from magical attacks(ex: 10res = 10% damage reduction)
  agi: number; // Agility (speed/turn order). If two units have the same agi, the one with higher luck goes first
  skill: number; // Skill (crit chance for physical attacks; critical hits never miss)
  luck: number; // Luck (chance to resist status effects, critical hits, and debuffs)
  wis: number; // Wisdom (crit chance for magical attacks; critical hits never miss)
  mov: number; // Movement (horizontal movement)
  jump: number; // Jump (vertical movement)
}

/**
 * More About Stats:
 *
 * AGI
 * If 2 units have the same agi and luck, the one with higher skill goes first.
 * This stat is used as a flat number and not a percentage. Units with higher agi
 * will move before units with lower agi. This is used to determine turn order.
 * Additionally, if a unit's agi is double that of another unit, it will move twice in a row
 * before the other unit moves!
 *
 * SKILL / WISDOM
 * This stat is used to determine the chance of a critical hit.
 * If a unit has 10 skill for example, it has a 10% chance to crit.
 * Critical hits deal 1.8 times more damage than normal hits and never miss regardless of the target's evasion rate.
 * Wisdom works the same way for magical attacks.
 * 
 * LUCK
 * This stat is used to determine the chance to resist status effects, critical hits, and debuffs.
 * If a unit has 10 luck for example, it has a 10% chance to resist a status effects, critical hits, and debuffs.
 * Critical hits deal 1.8 times more damage than normal hits and never miss regardless of the target's evasion rate,
 * but if a unit has 10 luck for example, it has a 10% chance to resist the damage boost from critical hits.
 * The 100% hit chance is not affected by luck, but the damage boost is.
 */

// Attributes of a unit
// These are modifiers that affect the unit's performance in battle
// They are not directly affected by stats but can be modified by items, skills, or abilities
export interface UnitAttributes {
  hitRate: number; // Chance to hit the target
  evasionRate: number; // Chance to evade an attack
  resolve: number; // Chance to survivie fatal damage
  // Add more as needed
}

// Types of units
export enum UnitType {
  WARRIOR = "warrior",
  ARCHER = "archer",
  MAGE = "mage",
  HEALER = "healer",
  ROGUE = "rogue",
  // Add more as needed
}

// Abilities/actions a unit can perform
export interface Ability {
  id: string;
  name: string;
  description: string;
  cost: number;
  range: number;
  area: number;
  effect: (target: EntityId) => void;
}

// The actual unit data
export interface UnitData {
  id: EntityId;
  name: string;
  type: UnitType;
  position: [number, number, number];
  stats: BaseStats;
  attributes: UnitAttributes;
  abilities: Ability[];
  modelPath?: string; // Path to 3D model if using custom models
  textureMap?: string; // Path to texture
  currentState: "idle" | "moving" | "attacking" | "defending" | "dead";
}

// Player type
export interface Player {
  id: EntityId;
  name: string;
  faction: "player" | "enemy" | "neutral";
  unitIds: EntityId[]; // References to units in the global unit store
  resources: {
    gold: number;
    // Other resources
  };
}

// Game cell types
export interface GridCell {
  x: number;
  y: number;
  z: number;
  traversable: boolean;
  terrain: TerrainType;
  occupiedBy: EntityId | null;
}

export enum TerrainType {
  GRASS = "grass",
  WATER = "water",
  MOUNTAIN = "mountain",
  FOREST = "forest",
  // Add more as needed
}

// Game actions
export type GameAction =
  | { type: "MOVE"; unitId: EntityId; targetPosition: [number, number, number] }
  | { type: "ATTACK"; unitId: EntityId; targetId: EntityId; abilityId: string }
  | { type: "END_TURN" }
  | { type: "SELECT_UNIT"; unitId: EntityId | null }
  | { type: "SELECT_ABILITY"; abilityId: string | null };
