export type EntityId = string;

// Base stats that any unit would have
// These directly affect how a unit performs in battle
export interface BaseStats {
  // STATS
  level: number; // Unit level
  exp: number; // Experience points
  hp: number; // Current HP
  maxHp: number; // Max HP
  patk: number; // Physical attack power
  matk: number; // Magical attack power
  def: number; // Physical defense
  res: number; // Magical defense
  agi: number; // Agility (speed/turn order)
  skill: number; // Skill (crit chance for physical attacks; critical hits never miss)
  luck: number; // Luck (chance to resist status effects, critical hits, and debuffs)
  wis: number; // Wisdom (crit chance for magical attacks; critical hits never miss)
  mov: number; // Movement (horizontal movement)
  jump: number; // Jump (vertical movement)
}

// Attributes of a unit
// These are modifiers that affect the unit's performance in battle
// They are not directly affected by stats but can be modified by items, skills, or abilities
export interface UnitAttributes {
  hitRate: number; // Chance to hit the target
  evasionRate: number; // Chance to evade an attack
  resolve: number; // Chance to survivie fatal damage
}

// Types of units
export enum UnitType {
  WARRIOR = "warrior",
  ARCHER = "archer",
  MAGE = "mage",
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
