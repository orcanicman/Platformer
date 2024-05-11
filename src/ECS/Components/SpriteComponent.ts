import { Component } from "../interfaces/Component";

export class SpriteComponent implements Component {
  readonly type = "sprite";
  constructor(public source: ImageBitmap) {}
}
