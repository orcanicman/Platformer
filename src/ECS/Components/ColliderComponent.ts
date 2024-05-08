import { Component } from "../interfaces/Component";

export class ColliderComponent implements Component {
  readonly type = "collider";
  public isColliding = false;

  constructor(public colliderType: "rigid" | "static" | "dynamic") {}
}
