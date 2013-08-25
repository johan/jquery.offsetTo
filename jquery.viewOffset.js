jQuery.fn.viewOffset = function viewOffset(baseWindow) {
  var node = this && this[0];
  if (!node || typeof node != 'object' || node.nodeType != 1)
    throw new TypeError('viewOffset only gives coordinates to Element nodes');
  if (baseWindow) {
    if (typeof baseWindow != 'object' ||
        typeof baseWindow.constructor != 'function' ||
        baseWindow.constructor.name != 'Window')
      throw new TypeError("baseWindow, if provided, must be a Window object");
    var win = window;
    while (win && win !== baseWindow) win = win.frameElement;
    if (!win)
      throw new Error("baseWindow needs to be one of this window's ancestors");
  }

  function addOffset(node, coords, view) {
    var p = node.offsetParent;
    coords.left += node.offsetLeft - (p ? p.scrollLeft : 0);
    coords.top  += node.offsetTop - (p ? p.scrollTop : 0);

    if (p) {
      if (p.nodeType == 1) {
        var parentStyle = view.getComputedStyle(p, '');
        if (parentStyle.position != 'static') {
          coords.left += parseInt(parentStyle.borderLeftWidth);
          coords.top  += parseInt(parentStyle.borderTopWidth);

          if (p.localName == 'TABLE') {
            coords.left += parseInt(parentStyle.paddingLeft);
            coords.top  += parseInt(parentStyle.paddingTop);
          }
          else if (p.localName == 'BODY') {
            var style = view.getComputedStyle(node, '');
            coords.left += parseInt(style.marginLeft);
            coords.top  += parseInt(style.marginTop);
          }
        }
        else if (p.localName == 'BODY') {
          coords.left += parseInt(parentStyle.borderLeftWidth);
          coords.top  += parseInt(parentStyle.borderTopWidth);
        }

        var parent = node.parentNode;
        while (p != parent) {
          coords.left -= parent.scrollLeft;
          coords.top  -= parent.scrollTop;
          parent = parent.parentNode;
        }
        addOffset(p, coords, view);
      }
    }
    else {
      if (node.localName == 'BODY') {
        var style = view.getComputedStyle(node, '');
        coords.left += parseInt(style.borderLeftWidth);
        coords.top  += parseInt(style.borderTopWidth);

        var htmlStyle = view.getComputedStyle(node.parentNode, '');
        coords.left -= parseInt(htmlStyle.paddingLeft);
        coords.top  -= parseInt(htmlStyle.paddingTop);
      }

      if (node.scrollLeft)
        coords.left += node.scrollLeft;
      if (node.scrollTop)
        coords.top  += node.scrollTop;

      if ((win = node.ownerDocument.defaultView) && baseWindow &&
          win !== baseWindow && win.frameElement)
        addOffset(win.frameElement, coords, win);
    }
  }

  var coords = { left: 0, top: 0 };
  addOffset(node, coords, node.ownerDocument.defaultView);
  return coords;
};
