import { Game } from "./Game";

const main = () => {
  if (!navigator.gpu) return console.error("Where da gpu at?");
  // make renderer
  const canvas = window.document.createElement("canvas");

  // @ts-expect-error canvas.getContext() does not have GPUCanvasContext types yet.
  const context = <GPUCanvasContext>canvas.getContext("webgpu", {});
  const root = window.document.getElementById("root");
  if (!root) throw new Error("Root element not found, please specify it.");
  if (!context) throw new Error("Could not get the rendering context from the canvas.");
  root.appendChild(canvas);

  new Game(window, context);
};

main();
