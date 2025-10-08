class Polygon extends ObjectBase {
  vertices = []
  color = 'blue'

  setVertices(vertices) {
    this.vertices = vertices;
  }

  setColor(color) {
    this.color = color
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

    if (this.isSelected() || this.isHovered()) {
      if (this.isSelected()) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = 'lightblue';
        ctx.lineWidth = 4;
      }
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
}