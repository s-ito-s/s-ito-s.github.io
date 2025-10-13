class ObjectBase {
  hovered = false;
  selected = false;

  setSelected(selected) {
    this.selected = selected;
  }

  isSelected() {
    return this.selected;
  }

  setHovered(hovered) {
    this.hovered = hovered;
  }

  isHovered() {
    return this.hovered;
  }

  ////////////////////////////////////////////
  // Override methods
  ////////////////////////////////////////////

  isEditing() {
    return false;
  }

  mouseDown(x, y) {}

  mouseMove(x, y) {}

  mouseUp() {}

  isPointInObject(x, y) {
    return false;
  }

  draw(ctx) {}

  drawController(ctx) {}
}