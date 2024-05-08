import { GRAVITY } from "../../config/GRAVITY";
import { getComponent } from "../../helpers/getComponent";
import { Entity } from "../../interfaces/Entity";
import { System } from "../../interfaces/System";
import { GravityComponent } from "../Components/GravityComponent";
import { VelocityComponent } from "../Components/VelocityComponent";

export class GravitySystem implements System {
  update = (timePassed: number, entities: Entity[]) => {
    for (const entity of entities) {
      const gravityComponent = getComponent<GravityComponent>(entity, "gravity");
      const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");

      if (!gravityComponent || !velocityComponent) continue;

      velocityComponent.velocity.y += GRAVITY * gravityComponent.mass * (timePassed / 1000);
    }
  };
}
