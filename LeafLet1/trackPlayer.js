var TrackPlayer = L.Control.extend({
    onAdd: function(map) {
        this.map = map;
        this._initLayer();
        this._pause = true;
        this.fx = new L.PosAnimation();
        return this._container;
    },
    _initLayer() {
        this._container = L.DomUtil.create('div', 'map-trackplayer');
        L.DomEvent.disableClickPropagation(this._container);
        this._playBtn = L.DomUtil.create('div', 'play-btn', this._container);
        L.DomEvent.on(this._playBtn, 'click', this._changePause, this);
        this._resetBtn = L.DomUtil.create('div', 'reset-btn', this._container);
        L.DomEvent.on(this._resetBtn, 'click', this._resetLayer, this)
        var processOuter = L.DomUtil.create('div', 'process-outer', this._container);
        L.DomEvent.on(processOuter, 'click', this._processClcik, this);
        this._processInner = L.DomUtil.create('div', 'process-inner', processOuter);
        this._pos = L.DomUtil.create('div', 'pos', processOuter);
        // L.DomEvent.disableClickPropagation(this._pos);
        // L.DomEvent.disableClickPropagation(processOuter);
        L.DomEvent.on(this._pos, 'mousedown', this._posMousedowm, this);
        L.DomEvent.on(this._container, 'mouseup', this._posMouseup, this);
        L.DomEvent.on(processOuter, 'mousemove', this._posMousemove, this);
        L.DomEvent.on(this._pos, 'mousemove', L.DomEvent.stopPropagation);
        this._speedBtn = L.DomUtil.create('select', 'speed-btn', this._container);
        // console.log(this._speedBtn);
        var speedList = ['x1倍速', 'x2倍速', 'x4倍速', 'x8倍速'];
        this._creatOption(this._speedBtn, speedList);
        // this._speedBtn.on('change', this._changeSpeed, this);
        L.DomEvent.on(this._speedBtn, 'change', this._changeSpeed, this);
        this.map.on('startDraw', this._showMarker, this);
        this.map.on('endDraw', this._endDraw, this);
        this.map.on('zoomstart ', this._mapZoom, this);
        this.markerEndIndex = 1;
        this.duration = 4;
        this._leftoverTime = this.duration;
        this._onceMove = true;
        this._posDrag = false;
    },
    _creatOption(selcet, list) {
        for (let i of list) {
            var options = document.createElement("option");
            options.text = i;
            selcet.add(options);
        }
    },
    _endDraw(e) {
        this._polylineCount = 200 / e.len;
        // console.log(this._polylineCount);
    },
    _changeSpeed(e) {
        // console.log(e.target.value);
        // this.duration = e.target.value;
        switch (e.target.value) {
            case 'x1倍速':
                this.duration = 4;
                break;
            case 'x2倍速':
                this.duration = 2;
                break;
            case 'x4倍速':
                this.duration = 1;
                break;
            case 'x8倍速':
                this.duration = 0.5;
                break;
        }
    },
    _showMarker(e) {
        if (!this.marker) {
            this.marker = L.marker(e.latlng).addTo(this.map);
        }
    },
    _changePause(e) {
        if (!this.poly) {
            console.log('未绘制线段');
            return;
        }
        if (this._pause) {
            //开始
            if (this.markerEndIndex == this.poly.getLatLngs().length) {
                this._resetLayer();
                return;
            }
            if (this._onceMove) {
                this._leftoverTime = this.duration;
                this._onceMove = false;
            }
            // console.log('开始');
            // console.log(this._leftoverTime);
            this.fx.on('start', this._fxStart, this)
                // if (!this._startAnimation) {
            this.pos = this.map.latLngToLayerPoint(this.poly.getLatLngs()[this.markerEndIndex]);
            this.fx.run(this.marker._icon, this.pos, this._leftoverTime, 1);
            // }
            this.fx.on('end', this._fxEnd, this)
            e.target.className = 'pause-btn play-btn'
        } else if (!this._pause) {
            //暂停
            this.fx.off('end', this._fxEnd, this)
            this.fx.stop();
            e.target.className = 'play-btn'
            this._leftoverTime = (this._leftoverTime * 1000 - (new Date()).valueOf() + this._startTime) / 1000;
            // console.log((new Date()).valueOf());
            if (this._finalEnd) {
                this._resetLayer();
                return;
            }
        }
        this._pause = !this._pause;
    },
    _fxEnd() {
        // console.log('ccc')
        if (this.markerEndIndex == this.poly.getLatLngs().length - 1) {
            this._finalEnd = true;
        }
        this._processInner.style.width = this.markerEndIndex * this._polylineCount + 'px';
        this._pos.style.left = (this.markerEndIndex * this._polylineCount - 10) + 'px';
        this._leftoverTime = this.duration;
        if (this.markerEndIndex < this.poly.getLatLngs().length - 1) {
            this.markerEndIndex++;
            this.pos = this.map.latLngToLayerPoint(this.poly.getLatLngs()[this.markerEndIndex]);
            this.fx.run(this.marker._icon, this.pos, this._leftoverTime, 1);
        } else {
            this.fx.off('end', this._fxEnd, this);
        }
        // this._leftoverTime = 1;
        // console.log('结束时' + this._leftoverTime)
    },
    _fxStart() {
        // this._leftoverTime = 1;
        this._startTime = (new Date()).valueOf();
        // console.log(this._startTime);
    },
    _resetLayer() {
        if (!this.poly) {
            console.log('未绘制线段');
            return;
        }
        // console.log('eee')
        this.pos = this.map.latLngToLayerPoint(this.poly.getLatLngs()[0]);
        this.fx.off('end', this._fxEnd, this)
        this.fx.run(this.marker._icon, this.pos, 0.1, 1);
        this.markerEndIndex = 1;
        this._speedBtn.value = 'x1倍速';
        this._leftoverTime = this.duration = 4;
        // this.fx.off(this.marker._icon, this.pos, 0.5, 1);
        this._pause = true;
        this._playBtn.className = 'play-btn';
        this._processInner.style.width = '0px';
        this._pos.style.left = '-10px';
        this._onceMove = true;
        this._finalEnd = false;
    },
    _processClcik(e) {
        // console.log('a');
        var rollPos = parseInt((e.offsetX + this._polylineCount / 2) / this._polylineCount);
        this._resetMoveLayer(rollPos)
    },
    _resetMoveLayer(rollPos) {
        if (!this.poly) {
            console.log('未绘制线段');
            return;
        }
        // console.log('bbb')
        this.pos = this.map.latLngToLayerPoint(this.poly.getLatLngs()[rollPos]);
        // this.fx.stop();
        this.fx.off('end', this._fxEnd, this);
        // this.marker.setLatLng(this.poly.getLatLngs()[rollPos])
        this.fx.run(this.marker._icon, this.pos, 0.1, 1);
        this.markerEndIndex = rollPos + 1;
        // this.fx.off(this.marker._icon, this.pos, 0.5, 1);
        this._pause = true;
        this._playBtn.className = 'play-btn';
        this._startAnimation = false;
        this._processInner.style.width = '0px';
        this._pos.style.left = '-10px';
        this._processInner.style.width = rollPos * this._polylineCount + 'px';
        this._pos.style.left = (rollPos * this._polylineCount - 10) + 'px';
        this._onceMove = true;
    },
    _posDrag(e) {
        // e.target.style.left = (this.offsetX - 10) + 'px';
        // console.log(e.target)
        // console.log(this.offsetX)
    },
    _mapZoom() {
        this.marker.setLatLng(this.poly.getLatLngs()[this.markerEndIndex - 1])
        this._resetMoveLayer(this.markerEndIndex - 1);
    },
    _posMousedowm() {
        this._posDrag = true;
    },
    _posMouseup() {
        this._posDrag = false;
    },
    _posMousemove(e) {

        if (this._posDrag) {
            // console.log(e.offsetX)
            this._pos.style.left = (e.offsetX - 10) + 'px';
        }
    }
})

function trackPlayer(options) {
    return new TrackPlayer(options);
}