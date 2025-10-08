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

  // Override this method in subclasses
  isPointInObject(x, y) {
    return false;
  }

  // Override this method in subclasses
  draw(ctx) {}
}