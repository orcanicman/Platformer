import { getComponent } from "../../helpers/getComponent";
import { Entity } from "../../interfaces/Entity";
import { System } from "../../interfaces/System";
import { fragmentShaderSource } from "../../shaders/fragmentShader";
import { vertexShaderSource } from "../../shaders/vertexShader";
import { BoundingBox } from "../../types/BoundingBox";
import { DimensionsComponent } from "../Components/DimensionsComponent";
import { PositionComponent } from "../Components/PositionComponent";

export class RenderSystem implements System {
  private program!: WebGLProgram;

  private positionAttributeLocation!: number;
  private resolutionUniformLocation!: WebGLUniformLocation;
  private translationUniformLocation!: WebGLUniformLocation;
  private colorUniformLocation!: WebGLUniformLocation;

  private vao!: WebGLVertexArrayObject;

  constructor(public gl: WebGL2RenderingContext) {
    this.initShaders();
  }

  private initShaders() {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.program = this.createShaderProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);

    // set uniform/attrib locations
    const positionAttributeLocation = this.gl.getAttribLocation(this.program, "aPosition");
    this.positionAttributeLocation = positionAttributeLocation;

    const resolutionUniformLocation = this.gl.getUniformLocation(this.program, "uResolution");
    if (resolutionUniformLocation === null) throw new Error("could not find uniform!");
    this.resolutionUniformLocation = resolutionUniformLocation;

    const colorUniformLocation = this.gl.getUniformLocation(this.program, "uColor");
    if (colorUniformLocation === null) throw new Error("could not find uniform!");
    this.colorUniformLocation = colorUniformLocation;

    const translationUniformLocation = this.gl.getUniformLocation(this.program, "uTranslation");
    if (translationUniformLocation === null) throw new Error("could not find uniform!");
    this.translationUniformLocation = translationUniformLocation;

    this.initializeVertexArrayObjects();
  }

  initializeVertexArrayObjects() {
    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // prettier-ignore
    const bufferData = new Float32Array([
        10, 20,
        80, 20,
        10, 30,
        
        10, 30,
        80, 20,
        80, 30,
      ]);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, this.gl.STATIC_DRAW);

    const vao = this.gl.createVertexArray();
    if (vao === null) throw new Error("Vao initalization failed");

    this.gl.bindVertexArray(vao);

    this.gl.enableVertexAttribArray(this.positionAttributeLocation);

    this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.vao = vao;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("could not make shader");
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shader:", this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      throw new Error("Shader compilation failed.");
    }

    return shader;
  }

  private createShaderProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) throw new Error("could not make Program");
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program:", this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      throw new Error("Shader program initialization failed.");
    }

    return program;
  }

  update = (timePassed: number, entities: Entity[]) => {
    // Clear current canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Set the viewport
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Set resolution to current canvas resolution
    this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

    // For every entity, draw
    for (const entity of entities) {
      const positionComponent = getComponent<PositionComponent>(entity, "position");
      const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");
      // Don't draw anything if entity does not have a position or dimensions.
      if (!positionComponent || !dimensionsComponent) continue;

      // Put a rectangle in the position buffer
      const { height, width, x, y } = { ...positionComponent.position, ...dimensionsComponent.dimensions };
      setRectangle(this.gl, { height, width, x, y });

      // Set color to black
      this.gl.uniform4f(this.colorUniformLocation, 0, 0, 0, 1);

      // Translate (todo: move with camera)
      this.gl.uniform2f(this.translationUniformLocation, 0, 0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
  };
}

const setRectangle = (gl: WebGL2RenderingContext, position: BoundingBox) => {
  var x1 = position.x;
  var x2 = position.x + position.width;
  var y1 = position.y;
  var y2 = position.y + position.height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]), gl.STATIC_DRAW);
};
