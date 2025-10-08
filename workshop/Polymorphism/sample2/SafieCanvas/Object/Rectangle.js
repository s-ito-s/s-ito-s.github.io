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

  isPointInside(x, y) {
    const rect = this.rect;
    return rect.x <= x && x <= rect.x + rect.width && rect.y <= y && y <= rect.y + rect.height;
  }


  draw(ctx) {
    ctx.fillStyle = this.color;
    const {x, y, width, height} = this.rect
    ctx.fillRect(x, y, width, height);

    if (this.isSelected() || this.isHovered()) {
      if (this.isSelected()) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = 'lightblue';
        ctx.lineWidth = 4;
      }
      ctx.strokeRect(x, y, width, height);
    }    
  }
}