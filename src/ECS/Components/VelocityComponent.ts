import { Component } from "../interfaces/Component";
import { Vector2 } from "../../types/Vector2";

export class VelocityComponent implements Component {
  readonly type = "velocity";
  constructor(public velocity: Vector2, public maxVelocity: Vector2 = { x: Infinity, y: Infinity }) {}
}
