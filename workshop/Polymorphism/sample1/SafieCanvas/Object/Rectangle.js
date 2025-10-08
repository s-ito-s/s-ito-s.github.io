class Rectangle extends ObjectBase {
  rect = {
    x : 0,
    y : 0,
    width : 0,
    height : 0,
  }
  color = 'blue'

  setVertices(x, y, width, height) {
    this.rect = { x, y, width, height }
  }

  setColor(color) {
    this.color = color
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    const {x, y, width, height} = this.rect
    ctx.fillRect(x, y, width, height);
  }
}