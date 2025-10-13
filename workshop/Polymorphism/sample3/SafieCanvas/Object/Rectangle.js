class Rectangle extends ObjectBase {
  rect = {
    x : 0,
    y : 0,
    width : 0,
    height : 0,
  }
  color = 'blue'
  mousePos = null;
  editState = null; // 'move', 'resize-lt', 'resize-rt', 'resize-lb', 'resize-rb'

  setVertices(x, y, width, height) {
    this.rect = { x, y, width, height }
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
    const cornerLT = { x: this.rect.x, y: this.rect.y };
    if (cornerLT.x - halfHandleSize <= x && x <= cornerLT.x + halfHandleSize &&
        cornerLT.y - halfHandleSize <= y && y <= cornerLT.y + halfHandleSize) {
      this.editState = 'resize-lt';
      return;
    }

    const cornerRT = { x: this.rect.x + this.rect.width, y: this.rect.y };
    if (cornerRT.x - halfHandleSize <= x && x <= cornerRT.x + halfHandleSize &&
        cornerRT.y - halfHandleSize <= y && y <= cornerRT.y + halfHandleSize) {
      this.editState = 'resize-rt';
      return;
    }

    const cornerLB = { x: this.rect.x, y: this.rect.y + this.rect.height };
    if (cornerLB.x - halfHandleSize <= x && x <= cornerLB.x + halfHandleSize &&
        cornerLB.y - halfHandleSize <= y && y <= cornerLB.y + halfHandleSize) {
      this.editState = 'resize-lb';
      return;
    }

    const cornerRB = { x: this.rect.x + this.rect.width, y: this.rect.y + this.rect.height };
    if (cornerRB.x - halfHandleSize <= x && x <= cornerRB.x + halfHandleSize &&
        cornerRB.y - halfHandleSize <= y && y <= cornerRB.y + halfHandleSize) {
      this.editState = 'resize-rb';
      return;
    }

    const center = { x: this.rect.x + this.rect.width / 2, y: this.rect.y + this.rect.height / 2 };
    if (center.x - halfHandleSize <= x && x <= center.x + halfHandleSize &&
        center.y - halfHandleSize <= y && y <= center.y + halfHandleSize) {
      this.editState = 'move';
      return;
    }

    this.editState = null
  }

  mouseMove(x, y) {
    if (this.editState === null || this.mousePos === null) {
      return;
    }

    const dx = x - this.mousePos.x;
    const dy = y - this.mousePos.y;
    if (this.editState === 'resize-lt') {
      this.rect.x += dx;
      this.rect.y += dy;
      this.rect.width -= dx;
      this.rect.height -= dy;
    } else if (this.editState === 'resize-rt') {
      this.rect.y += dy;
      this.rect.width += dx;
      this.rect.height -= dy;
    } else if (this.editState === 'resize-lb') {
      this.rect.x += dx;
      this.rect.width -= dx;
      this.rect.height += dy;
    } else if (this.editState === 'resize-rb') {
      this.rect.width += dx;
      this.rect.height += dy;
    } else if (this.editState === 'move') {
      this.rect.x += dx;
      this.rect.y += dy;
    }

    this.mousePos = { x, y };
  }

  mouseUp() {
    this.editState = null
    this.mousePos = null;
  }

  isPointInside(x, y) {
    return this.rect.x <= x && x <= this.rect.x + this.rect.width && this.rect.y <= y && y <= this.rect.y + this.rect.height;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    const {x, y, width, height} = this.rect
    ctx.fillRect(x, y, width, height);

    if (this.isHovered()) {
      ctx.strokeStyle = 'lightblue';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
    }    
  }

  drawController(ctx) {
    const {x, y, width, height} = this.rect
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);

    const handleSize = 12;
    const halfHandleSize = handleSize / 2;
    const corners = [
      { cx: x, cy: y }, 
      { cx: x + width, cy: y }, 
      { cx: x, cy: y + height },
      { cx: x + width, cy: y + height }
    ];

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    corners.forEach(corner => {
      ctx.fillRect(corner.cx - halfHandleSize, corner.cy - halfHandleSize, handleSize, handleSize);
      ctx.strokeRect(corner.cx - halfHandleSize, corner.cy - halfHandleSize, handleSize, handleSize);
    });

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.fillRect(centerX - halfHandleSize, centerY - halfHandleSize, handleSize, handleSize);
    ctx.strokeRect(centerX - halfHandleSize, centerY - halfHandleSize, handleSize, handleSize);
  }
}