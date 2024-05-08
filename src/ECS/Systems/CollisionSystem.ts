import { getComponent } from "../../helpers/getComponent";
import { intersects } from "../../helpers/intersects";
import { Entity } from "../../interfaces/Entity";
import { System } from "../../interfaces/System";
import { BoundingBox } from "../../types/BoundingBox";
import { Vector2 } from "../../types/Vector2";
import { ColliderComponent } from "../Components/ColliderComponent";
import { ControllableComponent } from "../Components/ControllableComponent";
import { DimensionsComponent } from "../Components/DimensionsComponent";
import { PositionComponent } from "../Components/PositionComponent";
import { VelocityComponent } from "../Components/VelocityComponent";

type Sides = { right: number; left: number; top: number; bottom: number };

export class CollisionSystem implements System {
  update = (timePassed: number, entities: Entity[]) => {
    const collisionObjects: { boundingBox: BoundingBox; entity: Entity; colliderComponent: ColliderComponent }[] = [];

    for (const entity of entities) {
      // Get components
      const colliderComponent = getComponent<ColliderComponent>(entity, "collider");
      const positionComponent = getComponent<PositionComponent>(entity, "position");
      const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");

      // Velocity component
      const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");

      if (!colliderComponent || !positionComponent || !dimensionsComponent) continue;

      const previousBoundingBox = { ...positionComponent.previousPosition, ...dimensionsComponent.dimensions };
      const boundingBox = { ...positionComponent.position, ...dimensionsComponent.dimensions };

      // If colliderType is not Dynamic e.g. movable. Just add it to collisionObjects.
      if (!(colliderComponent.colliderType === "dynamic")) {
        collisionObjects.push({
          boundingBox,
          entity,
          colliderComponent,
        });
        continue;
      }

      const collidingWith = collisionObjects.filter((collisionObject) =>
        intersects(collisionObject.boundingBox, boundingBox)
      );

      if (!velocityComponent) continue;

      for (const collisionObject of collidingWith) {
        const moveableObjectSides = getBoundingBoxSides(boundingBox);
        const previousMoveableObjectSides = getBoundingBoxSides(previousBoundingBox);

        const collisionObjectSides = getBoundingBoxSides(collisionObject.boundingBox);

        if (collisionObject.colliderComponent.colliderType === "rigid") {
          // check horizontal
          if (velocityComponent.velocity.x !== 0) {
            // collision on the left of collisionObject
            if (
              moveableObjectSides.right >= collisionObjectSides.left &&
              previousMoveableObjectSides.right <= collisionObjectSides.left
            ) {
              positionComponent.position.x = collisionObjectSides.left - boundingBox.width;
              velocityComponent.velocity.x = 0;
            }

            // collision on the right of collisionObject
            if (
              moveableObjectSides.left <= collisionObjectSides.right &&
              previousMoveableObjectSides.left >= collisionObjectSides.right
            ) {
              positionComponent.position.x = collisionObjectSides.right;
              velocityComponent.velocity.x = 0;
            }
          }

          if (velocityComponent.velocity.y !== 0) {
            // collision of the top of collisionObject
            if (
              moveableObjectSides.bottom >= collisionObjectSides.top &&
              previousMoveableObjectSides.bottom <= collisionObjectSides.top
            ) {
              positionComponent.position.y = collisionObjectSides.top - boundingBox.height;
              velocityComponent.velocity.y = 0;
            }

            // collision of the bottom of collisionObject
            if (
              moveableObjectSides.top <= collisionObjectSides.bottom &&
              previousMoveableObjectSides.top >= collisionObjectSides.bottom
            ) {
              positionComponent.position.y = collisionObjectSides.bottom;
              velocityComponent.velocity.y = 0;
            }
          }
          continue;
        }

        if (collisionObject.colliderComponent.colliderType === "static") {
          // Handle collision with static object
          continue;
        }
      }
    }
  };
}

const getCollisionSides = (box1: BoundingBox, box2: BoundingBox): ("left" | "right" | "up" | "down")[] => {
  const sides: ("left" | "right" | "up" | "down")[] = [];

  // Calculate the edges of each box
  const box1Left = box1.x;
  const box1Right = box1.x + box1.width;
  const box1Top = box1.y;
  const box1Bottom = box1.y + box1.height;

  const box2Left = box2.x;
  const box2Right = box2.x + box2.width;
  const box2Top = box2.y;
  const box2Bottom = box2.y + box2.height;

  // Check for collision on each side and add to the sides array
  if (box1Right > box2Left && box1Left < box2Left) {
    sides.push("left");
  }
  if (box1Left < box2Right && box1Right > box2Right) {
    sides.push("right");
  }
  if (box1Bottom > box2Top && box1Top < box2Top) {
    sides.push("up");
  }
  if (box1Top < box2Bottom && box1Bottom > box2Bottom) {
    sides.push("down");
  }

  return sides;
};

const getBoundingBoxSides = (boundingBox: BoundingBox): Sides => {
  return {
    right: boundingBox.x + boundingBox.width,
    left: boundingBox.x,
    top: boundingBox.y,
    bottom: boundingBox.y + boundingBox.height,
  };
};
