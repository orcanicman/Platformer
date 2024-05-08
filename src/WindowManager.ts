export class WindowManager {
  previousTimestamp = 0;
  accumulatedTime = 0;
  animationFrameId: number | null = null;

  constructor(private window: Window, private canvas: HTMLCanvasElement) {}

  init = (callback: (timestamp: number) => void) => {
    this.initializeCanvas();
    this.initializeLoop(callback);
    this.resizeCanvasToDisplaySize();
  };

  initializeCanvas = () => {
    this.canvas.style.display = "block";
    this.canvas.style.width = "100vw";
    this.canvas.style.height = "100vh";
  };

  initializeLoop = (loop: (timestamp: number) => void) => {
    const onFocus = () => {
      if (!this.animationFrameId) {
        // Resume the game loop
        this.previousTimestamp = performance.now();
        this.window.requestAnimationFrame(loop);
      }
    };

    const onBlur = () => {
      // Pause the game loop
      if (this.animationFrameId) {
        this.window.cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    };

    this.window.addEventListener("focus", onFocus);
    this.window.addEventListener("blur", onBlur);

    // initialize first loop
    onFocus();
  };

  resizeCanvasToDisplaySize = () => {
    const canvas = this.canvas;

    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  };
}
