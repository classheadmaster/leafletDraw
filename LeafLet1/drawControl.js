L.Control.DrawRect = L.Control.extend({
  onAdd: function(map) {
      var img = L.DomUtil.create('div','draw-toolbar');
      // L.DomEvent.on(img,'click',function(){
      //   console.log('a')
      // })
      var drawRect= L.DomUtil.create('div','drawBox draw-rect')
      drawRect.title='绘制矩形'
      var drawPoly= L.DomUtil.create('div','drawBox draw-poly')
      drawPoly.title='绘制多边形'
      var drawCircle= L.DomUtil.create('div','drawBox draw-circle')
      drawCircle.title='绘制圆形'
      var delLayer= L.DomUtil.create('div','drawBox del-layer')
      delLayer.title='删除选中图层'
      // img.appendChild(btn)
      img.appendChild(drawRect)
      img.appendChild(drawPoly)
      img.appendChild(drawCircle)
      img.appendChild(delLayer)

      return img;

  },

  onRemove: function(map) {
      // Nothing to do here
  }
});

L.control.drawRect = function(opts) {
  return new L.Control.DrawRect(opts);
}
