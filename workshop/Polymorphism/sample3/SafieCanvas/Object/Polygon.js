class Polygon extends ObjectBase {
  vertices = []
  color = 'blue'
  bbox = { x: 0, y: 0, width: 0, height: 0 }
  mousePos = null;
  editState = null; // 'move', 'vertex-i'

  setVertices(vertices) {
    this.vertices = vertices;
    let minX = vertices[0].x;
    let minY = vertices[0].y;
    let maxX = vertices[0].x;
    let maxY = vertices[0].y;
    vertices.forEach((vertex) => {
      if (minX > vertex.x) minX = vertex.x;
      if (minY > vertex.y) minY = vertex.y;
      if (maxX < vertex.x) maxX = vertex.x;
      if (maxY < vertex.y) maxY = vertex.y;
    });
    this.bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  setColor(color) {
    this.color = color
  }

  isEditing() {
    return this.editState !== null;
  }

  mouseDown(x, y) {
    if (this.isSelected() === false) {
      return;
    }

    this.mousePos = { x, y };

    const handleSize = 12;
    const halfHandleSize = handleSize / 2;
    for (let i = 0; this.vertices.length > i; i++) {
      const vertex = this.vertices[i];
      if (vertex.x - halfHandleSize <= x && x <= vertex.x + halfHandleSize &&
          vertex.y - halfHandleSize <= y && y <= vertex.y + halfHandleSize) {
        this.editState = `vertex-${i}`;
        return;
      }
    }

    const center = { x: this.bbox.x + this.bbox.width / 2, y: this.bbox.y + this.bbox.height / 2 };
    if (center.x - halfHandleSize <= x && x <= center.x + halfHandleSize &&
        center.y - halfHandleSize <= y && y <= center.y + halfHandleSize) {
      this.editState = 'move';
      return;
    }

    this.editState = null;
  }

  mouseMove(x, y) {
    if (this.editState === null || this.mousePos === null) {
      return;
    }

    const dx = x - this.mousePos.x;
    const dy = y - this.mousePos.y;

    if (this.editState.startsWith('vertex-')) {
      const vertexIndex = parseInt(this.editState.split('-')[1]);
      this.vertices[vertexIndex].x += dx;
      this.vertices[vertexIndex].y += dy;
    } else if (this.editState === 'move') {
      this.vertices.forEach((vertex) => {
        vertex.x += dx;
        vertex.y += dy;
      });
    }

    // Update bbox
    this.setVertices(this.vertices); 

    this.mousePos = { x, y };
  }

  mouseUp() {
    this.editState = null
    this.mousePos = null;    
  }

  isPointInside(x, y) {
    let sumAngle = 0
    for (let i = 0; this.vertices.length > i; i++) {
      const v1 = {
        x: this.vertices[i].x - x,
        y: this.vertices[i].y - y,
      }
      const v2 = { x: 0, y: 0 }
      if (i !== this.vertices.length - 1) {
        v2.x = this.vertices[i + 1].x - x
        v2.y = this.vertices[i + 1].y - y
      } else {
        v2.x = this.vertices[0].x - x
        v2.y = this.vertices[0].y - y
      }
      const dot = v1.x * v2.x + v1.y * v2.y
      const abs =
        Math.sqrt(v1.x * v1.x + v1.y * v1.y) *
        Math.sqrt(v2.x * v2.x + v2.y * v2.y)
      const angle = Math.acos(dot / abs)
      const sign = Math.sign(v1.y * v2.x - v1.x * v2.y)
      sumAngle += sign * angle
    }
    return Math.abs(sumAngle) > 0.1
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    this.vertices.forEach((vertex, index) => {
      if (index === 0) return;
      ctx.lineTo(vertex.x, vertex.y);
    });
    ctx.closePath();
    ctx.fill();

    if (this.isHovered()) {
      ctx.strokeStyle = 'lightblue';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
      this.vertices.forEach((vertex, index) => {
        if (index === 0) return;
        ctx.lineTo(vertex.x, vertex.y);
      });
      ctx.closePath();
      ctx.stroke();
    }
  }

  drawController(ctx) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    this.vertices.forEach((vertex, index) => {
      if (index === 0) return;
      ctx.lineTo(vertex.x, vertex.y);
    });
    ctx.closePath();
    ctx.stroke();

    const handleSize = 12;
    const halfHandleSize = handleSize / 2;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    this.vertices.forEach((vertex) => {
      ctx.fillRect(vertex.x - halfHandleSize, vertex.y - halfHandleSize, handleSize, handleSize);
      ctx.strokeRect(vertex.x - halfHandleSize, vertex.y - halfHandleSize, handleSize, handleSize);
    });

    const centerX = this.bbox.x + this.bbox.width / 2;
    const centerY = this.bbox.y + this.bbox.height / 2;
    ctx.fillRect(centerX - halfHandleSize, centerY - halfHandleSize, handleSize, handleSize);
    ctx.strokeRect(centerX - halfHandleSize, centerY - halfHandleSize, handleSize, handleSize);

    ctx.strokeStyle = 'lightblue'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(this.bbox.x, this.bbox.y, this.bbox.width, this.bbox.height);
  }
}