class Triangle extends ObjectBase {
  vertices = []
  color = 'blue'

  setVertices(vertices) {
    this.vertices = vertices;
  }

  setColor(color) {
    this.color = color
  }  

  isPointInside(x, y) {
    const cross = (p1, p2, p3) => {
      return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
    }

    const p = { x, y };
    const a = this.vertices[0];
    const b = this.vertices[1];
    const c = this.vertices[2];
    const d1 = cross(p, a, b);
    const d2 = cross(p, b, c);
    const d3 = cross(p, c, a);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
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