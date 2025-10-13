class SafieCanvas {
  canvas = null
  objects = []
  hoveredObject = null
  selectedObject = null

  constructor(parentElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = parentElement.clientWidth;
    this.canvas.style.height = parentElement.clientHeight;
    this.canvas.width = parentElement.clientWidth;
    this.canvas.height = parentElement.clientHeight;
    this.objects = [];
    parentElement.appendChild(this.canvas);

    this.canvas.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
    this.canvas.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    });
  }

  setCanvasSize(width, height) {
    this.canvas.style.width = width;
    this.canvas.style.height = height;
    this.canvas.width = width
    this.canvas.height = height
  }

  addObject(object) {
    const id = Math.random().toString(36).substring(2, 9);
    this.objects.push({ id, object });
  }

  handleMouseDown(e) {
    const x = e.offsetX;
    const y = e.offsetY;

    if (this.selectedObject) {
      this.selectedObject.object.mouseDown(x, y);
      if (this.selectedObject.object.isEditing()) {
        this.render();
        return;
      }
    }    

    let newSelectedObj = null;
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i].object;
      if (obj.isPointInside(x, y)) {
        newSelectedObj = this.objects[i];
        break;
      }
    }

    if (newSelectedObj) {
      if (this.selectedObject !== null && this.selectedObject.id !== newSelectedObj.id) {
        this.selectedObject.object.setSelected(false);
      }
      this.selectedObject = newSelectedObj;
      this.selectedObject.object.setSelected(true);
      this.selectedObject.object.mouseDown(x, y);
      this.render();
    } else {
      if (this.selectedObject) {
        this.selectedObject.object.setSelected(false);
        this.selectedObject = null;
        this.render();
      }
    }    
  }

  handleMouseMove(e) {
    const x = e.offsetX;
    const y = e.offsetY;

    if (this.selectedObject) {
      if (this.selectedObject.object.isEditing()) {
        this.selectedObject.object.mouseMove(x, y);
        this.render();
        return;
      }
    }

    let newHoveredObj = null;
    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i].object;
      if (obj.isPointInside(x, y)) {
        newHoveredObj = this.objects[i];
        break;
      }
    }

    if (newHoveredObj) {
      if (this.hoveredObject !== null && this.hoveredObject.id !== newHoveredObj.id) {
        this.hoveredObject.object.setHovered(false);
      }
      this.hoveredObject = newHoveredObj;
      this.hoveredObject.object.setHovered(true);
      this.render();      
    } else {
      if (this.hoveredObject) {
        this.hoveredObject.object.setHovered(false);
        this.hoveredObject = null;
        this.render();
      }
    }
  }

  handleMouseUp() {
    if (this.selectedObject) {
      this.selectedObject.object.mouseUp();
      this.render();
    }
  }

  render() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach((o) => {
      o.object.draw(ctx);
    });

    if (this.selectedObject) {
      this.selectedObject.object.drawController(ctx);
    }
  }
}