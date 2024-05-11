@group(0) @binding(0) var<uniform> resolution: vec2f;
@group(0) @binding(1) var myTexture: texture_2d<f32>;
@group(0) @binding(2) var mySampler: sampler;

struct VertexShaderOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) texcoord : vec2<f32>
};

@vertex
fn vertexMain(@location(0) position: vec2f) -> VertexShaderOutput {
  let relativePosition = position; // - translation
  let zeroToOne = relativePosition / resolution;

  let zeroToTwo = zeroToOne * 2.0;

  let clipSpace = zeroToTwo - 1.0;

  var output : VertexShaderOutput;
  output.position = vec4f(clipSpace * vec2(1, -1), 0, 1);
  output.texcoord = vec2(40, 100); // TODO: fix texture coordinate locations render

  return output;
}

@fragment
fn fragmentMain(@location(0) texcoord : vec2<f32>) -> @location(0) vec4f {
  return textureSample(myTexture, mySampler, texcoord);
}