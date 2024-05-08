import { Game } from "./Game";

const main = () => {
  // make renderer
  const canvas = window.document.createElement("canvas");
  const context = canvas.getContext("webgl2", {});
  const root = window.document.getElementById("root");
  if (!root) throw new Error("Root element not found, please specify it.");
  if (!context) throw new Error("Could not get the rendering context from the canvas.");
  root.appendChild(canvas);

  new Game(window, context);
};

main();
