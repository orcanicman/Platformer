import { getComponent } from "../../helpers/getComponent";
import { loadImageBitmap } from "../../helpers/loadImageBitmap";
import RectShader from "../../shaders/rect.wgsl";
import { BoundingBox } from "../../types/BoundingBox";
import { DimensionsComponent } from "../Components/DimensionsComponent";
import { PositionComponent } from "../Components/PositionComponent";
import { Entity } from "../interfaces/Entity";
import { System } from "../interfaces/System";

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

    await this.makePipeline();
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

  async makePipeline() {
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
        ${RectShader.code}
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

    // TODO: REMOVE FROM HERE
    // create texture
    const testImage = await loadImageBitmap("/src/assets/red.png");

    const texture = this.device.createTexture({
      label: "/src/assets/character.png",
      size: [testImage.width, testImage.height],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    this.device.queue.copyExternalImageToTexture(
      {
        source: testImage,
      },
      { texture },
      { width: testImage.width, height: testImage.height }
    );

    // create sampler
    const sampler = this.device.createSampler();
    // TODO: REMOVE UNTIL HERE

    // create bindGroup
    const bindGroup = this.device.createBindGroup({
      label: "Cell renderer bind group",
      layout: cellPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffer },
        },
        {
          binding: 1,
          resource: texture.createView(),
        },
        {
          binding: 2,
          resource: sampler,
        },
      ],
    });

    this.bindGroup = bindGroup;

    this.uniformBuffer = uniformBuffer;
    this.uniformArray = uniformArray;

    // set the pipeline
    this.pipeline = cellPipeline;
  }

  update = (_timePassed: number, entities: Entity[]) => {
    // setup renderer
    const encoder = this.device.createCommandEncoder();

    // Update resolution
    this.uniformArray = new Float32Array([this.context.canvas.width, this.context.canvas.height]);

    // Clears the screen and begins rendering
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: { r: 0.121, g: 0.1125, b: 0.1125, a: 1 }, // dark
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
