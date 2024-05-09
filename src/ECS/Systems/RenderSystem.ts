import { Entity } from "../interfaces/Entity";
import { System } from "../interfaces/System";

import VertexShader from "../../shaders/cell.vertex.wgsl";
import FragmentShader from "../../shaders/cell.fragment.wgsl";
import { BoundingBox } from "../../types/BoundingBox";
import { getComponent } from "../../helpers/getComponent";
import { PositionComponent } from "../Components/PositionComponent";
import { DimensionsComponent } from "../Components/DimensionsComponent";

export class RenderSystem implements System {
  // Device/Context objects
  adapter!: GPUAdapter;
  device!: GPUDevice;
  format!: GPUTextureFormat;

  // Pipeline objects
  pipeline!: GPURenderPipeline;
  bindGroup!: GPUBindGroup;
  uniformArray!: Float32Array;
  uniformBuffer!: GPUBuffer;

  constructor(public context: GPUCanvasContext) {}

  public async initialize() {
    await this.setupDevice();

    this.makePipeline();
  }

  async setupDevice() {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter?.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();

    if (!adapter || !device || !format) throw new Error("Renderer initialization error");
    this.adapter = adapter;
    this.device = device;
    this.format = format;

    this.context.configure({
      device,
      format,
    });
  }

  makePipeline() {
    // declare vertexBufferLayout
    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 8,
      attributes: [
        {
          format: "float32x2",
          offset: 0,
          shaderLocation: 0, // Position, see vertex shader
        },
      ],
    };

    // declare cellShaderModule
    const cellShaderModule = this.device.createShaderModule({
      label: "Cell shader",
      code: `
      ${VertexShader.code}
      
      ${FragmentShader.code}
      `,
    });

    // initialize cellPipeline
    const cellPipeline = this.device.createRenderPipeline({
      label: "Cell pipeline",
      layout: "auto",
      vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            format: this.format,
          },
        ],
      },
    });

    // initialize uniforms
    const uniformArray = new Float32Array([this.context.canvas.width, this.context.canvas.height]);
    const uniformBuffer = this.device.createBuffer({
      label: "Grid Uniforms",
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // create bindGroup
    const bindGroup = this.device.createBindGroup({
      label: "Cell renderer bind group",
      layout: cellPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
      ],
    });

    this.bindGroup = bindGroup;

    this.uniformBuffer = uniformBuffer;
    this.uniformArray = uniformArray;

    // set the pipeline
    this.pipeline = cellPipeline;
  }

  update = (timePassed: number, entities: Entity[]) => {
    // setup renderer
    const encoder = this.device.createCommandEncoder();

    // Update resolution
    this.uniformArray = new Float32Array([this.context.canvas.width, this.context.canvas.height]);

    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: { r: 0.121, g: 0.1125, b: 0.1125, a: 1 }, // dark
          // clearValue: { r: 1, g: 1, b: 1, a: 1 }, // white
          storeOp: "store",
        },
      ],
    });

    // declare verticies for each entity
    for (const entity of entities) {
      const positionComponent = getComponent<PositionComponent>(entity, "position");
      const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");

      // Don't draw anything if entity does not have a position or dimensions.
      if (!positionComponent || !dimensionsComponent) continue;

      // Put a rectangle in the position buffer
      const { height, width, x, y } = { ...positionComponent.position, ...dimensionsComponent.dimensions };
      const vertices = createRectFromBoundingBox({ height, width, x, y });

      const vertexBuffer = this.device.createBuffer({
        label: "Cell vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });

      this.device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);
      this.device.queue.writeBuffer(this.uniformBuffer, /*bufferOffset=*/ 0, this.uniformArray);

      // TODO: Translate (move with camera)

      // render
      renderPass.setPipeline(this.pipeline);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setBindGroup(0, this.bindGroup);

      renderPass.draw(vertices.length / 2);
    }

    // Finalize rendering
    renderPass.end();
    this.device.queue.submit([encoder.finish()]);
  };
}

const createRectFromBoundingBox = (boundingBox: BoundingBox) => {
  const x1 = boundingBox.x;
  const x2 = boundingBox.x + boundingBox.width;
  const y1 = boundingBox.y;
  const y2 = boundingBox.y + boundingBox.height;

  // prettier-ignore
  return new Float32Array([
    // X, Y,
      x1, y1, // Triangle 1 
      x2, y1, 
      x1, y2, 
      
      x1, y2, // Triangle 2
      x2, y1, 
      x2, y2
  ]);
};
