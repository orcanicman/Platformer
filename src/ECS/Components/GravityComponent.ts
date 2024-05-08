import { Component } from "../interfaces/Component";

export class GravityComponent implements Component {
  readonly type = "gravity";
  constructor(public mass: number) {}
}
