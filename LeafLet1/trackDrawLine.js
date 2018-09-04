function DrawLine(map) {
    this.map = map;
    this.poly = L.polyline([]);
    this.len = 0;
}

DrawLine.prototype = {
    show() {
        this.poly.addTo(this.map);
        this.map.on('click', this._mapClick, this);
        this.map.on('mousemove', this._mapMove, this);
        this.map.on('dblclick', this._mapDbClick, this);
    },
    _mapClick(e) {
        if (this.poly.getLatLngs().length == 0) {
            this.map.fire('startDraw', { latlng: e.latlng })
        }
        this.poly.addLatLng(e.latlng);
        this.len++;
    },
    _mapDbClick(e) {

        this.poly.getLatLngs().pop();
        this.poly.getLatLngs().pop();
        this.map.off('click', this._mapClick, this);
        this.map.off('mousemove', this._mapMove, this);
        this.map.off('dblclick', this._mapDbClick, this);
        this.map.fire('endDraw', { len: this.poly.getLatLngs().length - 1 })
    },
    _mapMove(e) {
        if (this.len > 0) {
            var arr = this.poly.getLatLngs();
            arr[this.len] = e.latlng;
            this.poly.setLatLngs(arr);
        }
    }
}