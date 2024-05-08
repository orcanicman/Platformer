export const vertexShaderSource = /*glsl*/ `#version 300 es
 
in vec2 aPosition;

uniform vec2 uResolution;
uniform vec2 uTranslation;

void main() {
  vec2 position = aPosition - uTranslation;

  vec2 zeroToOne = position / uResolution;

  vec2 zeroToTwo = zeroToOne * 2.0;

  vec2 clipSpace = zeroToTwo - 1.0;
  
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

}`;
