L.Control.DrawRect = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('div', 'draw-toolbar');
        // L.DomEvent.on(img,'click',function(){
        //   console.log('a')
        // })
        var drawRect = L.DomUtil.create('div', 'drawBox draw-rect')
        drawRect.title = '绘制线段'
        img.appendChild(drawRect)
        return img;

    },

    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.drawRect = function(opts) {
    return new L.Control.DrawRect(opts);
}