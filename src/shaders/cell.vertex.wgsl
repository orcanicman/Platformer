@group(0) @binding(0) var<uniform> resolution: vec2f;

@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
  let relativePosition = pos; // - translation
  let zeroToOne = relativePosition / resolution;

  let zeroToTwo = zeroToOne * 2.0;

  let clipSpace = zeroToTwo - 1.0;

  return vec4f(clipSpace * vec2(1, -1), 0, 1); // (x, y, z, w)
}