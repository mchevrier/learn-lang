/* Pointer-based drag helper that works with both mouse and touch.
   Native HTML5 drag-and-drop is avoided because it is unreliable on tablets,
   which are the main target devices.

   Usage:
     makeDraggable(chipEl, {
       dropSelector: '.drop-box, .word-bank',
       onDrop(targetEl, chipEl) { ... },   // targetEl may be null (dropped nowhere)
       onHover(targetEl) { ... },          // optional: called as the drag moves
     });
*/
export function makeDraggable(element, { dropSelector, onDrop, onHover } = {}) {
  element.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return; // ignore right-click
    if (element.dataset.locked === 'true') return;
    e.preventDefault();

    const rect = element.getBoundingClientRect();
    const clone = element.cloneNode(true);
    clone.classList.add('drag-clone');
    clone.style.width = rect.width + 'px';
    clone.style.left = e.clientX + 'px';
    clone.style.top = e.clientY + 'px';
    document.body.append(clone);

    element.style.visibility = 'hidden';

    let lastTarget = null;

    const findTarget = (x, y) => {
      clone.style.display = 'none';
      const under = document.elementFromPoint(x, y);
      clone.style.display = '';
      return under ? under.closest(dropSelector) : null;
    };

    const move = (ev) => {
      clone.style.left = ev.clientX + 'px';
      clone.style.top = ev.clientY + 'px';
      const target = findTarget(ev.clientX, ev.clientY);
      if (target !== lastTarget) {
        if (lastTarget) lastTarget.classList.remove('hover');
        if (target) target.classList.add('hover');
        lastTarget = target;
        onHover?.(target);
      }
    };

    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      const target = findTarget(ev.clientX, ev.clientY);
      if (lastTarget) lastTarget.classList.remove('hover');
      clone.remove();
      element.style.visibility = '';
      onDrop?.(target, element);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
}
