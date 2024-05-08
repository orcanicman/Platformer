import { Component } from "../interfaces/Component";
import { Entity } from "../interfaces/Entity";

export class DefaultEntity implements Entity {
  constructor(public id: string, public components: Component[]) {}
}
