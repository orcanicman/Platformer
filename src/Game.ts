import { ColliderComponent } from "./ECS/Components/ColliderComponent";
import { ControllableComponent } from "./ECS/Components/ControllableComponent";
import { DimensionsComponent } from "./ECS/Components/DimensionsComponent";
import { GravityComponent } from "./ECS/Components/GravityComponent";
import { PositionComponent } from "./ECS/Components/PositionComponent";
import { VelocityComponent } from "./ECS/Components/VelocityComponent";
import { DefaultEntity } from "./ECS/Entities/DefaultEntity";
import { CollisionSystem } from "./ECS/Systems/CollisionSystem";
import { GravitySystem } from "./ECS/Systems/GravitySystem";
import { MovementSystem } from "./ECS/Systems/MovementSystem";
import { RenderSystem } from "./ECS/Systems/RenderSystem";
import { WindowManager } from "./WindowManager";
import { FPS } from "./config/FPS";
import { Entity } from "./ECS/interfaces/Entity";
import { System } from "./ECS/interfaces/System";

export class Game {
  private entities: Entity[] = [
    new DefaultEntity("0", [
      new PositionComponent({ x: 75, y: 530 }),
      new DimensionsComponent({ height: 25, width: 50 }),
      new ColliderComponent("rigid"),
    ]),
    new DefaultEntity("2", [
      new PositionComponent({ x: 150, y: 330 }),
      new DimensionsComponent({ height: 200, width: 50 }),
      new ColliderComponent("rigid"),
    ]),

    new DefaultEntity("1", [
      new PositionComponent({ x: 100, y: 300 }),
      new DimensionsComponent({ width: 10, height: 25 }),
      new VelocityComponent({ x: 0, y: 0 }, { x: 750, y: 500 }),
      new ControllableComponent(1000),
      new GravityComponent(80),
      new ColliderComponent("dynamic"),
    ]),
  ];

  private systems: System[] = [
    new MovementSystem(this.window),
    new CollisionSystem(),
    new GravitySystem(),
    new RenderSystem(this.gl),
  ];

  constructor(
    private window: Window,
    private gl: WebGL2RenderingContext,
    private windowManager = new WindowManager(window, gl.canvas as HTMLCanvasElement)
  ) {
    this.init();
  }

  init = () => {
    this.windowManager.init(this.loop);
  };

  loop = (timestamp: number) => {
    const frameTime = 1000 / FPS;
    const deltaTime = timestamp - this.windowManager.previousTimestamp;
    this.windowManager.previousTimestamp = timestamp;
    this.windowManager.accumulatedTime += deltaTime;

    while (this.windowManager.accumulatedTime >= frameTime) {
      this.update(frameTime);
      this.windowManager.accumulatedTime -= frameTime;
    }

    this.window.requestAnimationFrame(this.loop);
  };

  update = (timePassed: number) => {
    // Make sure window is always correct size.
    this.windowManager.resizeCanvasToDisplaySize();

    for (const system of this.systems) {
      system.update(timePassed, this.entities);
    }
  };
}
