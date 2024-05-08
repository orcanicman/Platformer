import { Component } from "../interfaces/Component";
import { Dimensions2D } from "../../types/Dimensions2D";

export class DimensionsComponent implements Component {
  readonly type = "dimensions";
  constructor(public dimensions: Dimensions2D) {}
}
