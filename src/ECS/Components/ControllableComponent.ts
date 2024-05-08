import { Component } from "../interfaces/Component";

export class ControllableComponent implements Component {
  readonly type = "controllable";
  constructor(public speed: number) {}
}
