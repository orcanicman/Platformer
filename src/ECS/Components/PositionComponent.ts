import { Component } from "../../interfaces/Component";
import { Vector2 } from "../../types/Vector2";

export class PositionComponent implements Component {
  readonly type = "position";
  public previousPosition: Vector2 = { x: this.position.x.valueOf(), y: this.position.y.valueOf() };

  constructor(public position: Vector2) {}
}
