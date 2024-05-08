import { Entity } from "./Entity";

export type System = {
  update: (timePassed: number, entities: Entity[]) => void;
};
