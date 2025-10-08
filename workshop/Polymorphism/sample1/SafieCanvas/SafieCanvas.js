class SafieCanvas {
  canvas = null
  objects = []

  constructor(parentElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = parentElement.clientWidth;
    this.canvas.style.height = parentElement.clientHeight;
    this.canvas.width = parentElement.clientWidth;
    this.canvas.height = parentElement.clientHeight;
    this.objects = [];
    parentElement.appendChild(this.canvas);
  }

  setCanvasSize(width, height) {
    this.canvas.style.width = width;
    this.canvas.style.height = height;
    this.canvas.width = width
    this.canvas.height = height
  }

  addObject(object) {
    this.objects.push(object);
  }

  render() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach((obj) => {
      obj.draw(ctx);
    });
  }
}