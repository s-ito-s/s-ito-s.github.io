class Polygon extends ObjectBase {
  vertices = []
  color = 'blue'

  setVertices(vertices) {
    this.vertices = vertices;
  }

  setColor(color) {
    this.color = color
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
  }
}