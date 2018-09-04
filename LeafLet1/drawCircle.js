function DrawCircle(map){
  this._map=map;
  this._myIcon =new L.DivIcon({
    iconSize: new L.Point(15, 15),
    className: 'leaflet-div-icon'
  });
};
DrawCircle.prototype={
  draw(){
    this._circle=undefined;
    this._map.on('click',this._mapClick,this)
              .on('mousemove',this._mapMove,this);
    if(!this._map.hasLayer(myCursor)) myCursor.addTo(this._map);
  },
  stopDraw(){
    this._map.off('click',this._mapClick,this)
            .off('mousemove',this._mapMove,this);
  },
  _mapClick(e){
    if(!this._circle){
      this._circle=L.circle(e.latlng,0,{draggable:true});
      this._circle.addTo(this._map);
      this._circle._mapEdit=true;
      this._map.fire('drawLayer',{layer:this._circle});
    }else{
      this._map.fire('stopLayer',{layer:this._circle});
      this._map.off('click',this._mapClick,this)
              .off('mousemove',this._mapMove,this);
      this._circle.on('click',this._editCircle,this);
      this._circle.on('drag',this._circleDrag,this);
      this._circle.on('dragend',this._circleDragEnd,this);
      this._circle.dragging.disable();
      this._circle.markers=this._creatCircleMarker(this._circle)
      this._map.removeLayer(myCursor);
      // console.log(this._circle.markers);
      
      // this._circle.marker=this._creatMarker();
      // console.log(this._circle);
      // console.log(this._circle._latlng.distanceTo(e.latlng))
    }
  },
  _mapMove(e){
    myCursor.setLatLng(e.latlng);
    if(this._circle){
      var radius=this._circle._latlng.distanceTo(e.latlng);
      this._circle.setRadius(radius);
    }
  },
  _editCircle(e){
    if(e.target._mapEdit){
      this._showMarker(e.target.markers)
      e.target.setStyle({color: "red",dashArray:'10,10'});
      e.target.dragging.enable();
      this._map.fire('editLayer',{layer:e.target});
    }else{
      this._removeLayer(e.target.markers)
      e.target.setStyle({color:'#3388ff',dashArray:'0,0'});
      e.target.dragging.disable();
      this._map.fire('notEditLayer',{layer:e.target});
    };
    e.target._mapEdit=!e.target._mapEdit;
  },
  _circleDrag(e){
    e.target.markers[0].setLatLng(e.target.getLatLng());
    e.target.markers[1].setOpacity(0);
    // e.target.markers[1].setLatLng
    // console.log(e.target)
  },
  _circleDragEnd(e){
    e.target.markers[1].setLatLng(L.latLng(e.target.getLatLng().lat,e.target.getBounds().getEast()))
    e.target.markers[1].setOpacity(1);
  },
  _creatCircleMarker(circle){
    var markers=[];
    // var tempLng=(circle.getNorthEast().lat+circle.getSouthWest().lat)/2;
    var lng = circle.getBounds().getNorthEast().lng;
    var lat = circle.getLatLng().lat;
    //第一个为圆中点，第二个为边点
    var center = L.marker(circle.getLatLng(),{icon:this._myIcon,draggable:true});
    
    center.on('drag',this._centerDrag,this);
    center.on('dragend',this._centerDragEnd,this);
    
    var edge = L.marker(L.latLng(lat,lng),{icon:this._myIcon,draggable:true});
    edge.on('drag',this._edgeDrag,this);
    edge.parent=center.parent=circle;
    markers.push(center,edge);
    return markers
  },
  _showMarker(markers){
    for (let i = 0; i < markers.length; i++){
      markers[i].addTo(this._map)
    }
  },
  //移除图层
  _removeLayer(arr){
    for (let i = 0; i < arr.length; i++) {
      this._map.removeLayer(arr[i])
    }
  },
  _centerDrag(e){
    e.target.parent.setLatLng(e.latlng);
    e.target.parent.markers[1].setOpacity(0)
    // console.log(e.target.parent)
  },
  _edgeDrag(e){
    var radius=e.latlng.distanceTo(e.target.parent.markers[0].getLatLng());
    e.target.parent.setRadius(radius);
    // console.log(e.latlng)
    // console.log(this._circle)
  },
  _centerDragEnd(e){
    e.target.parent.markers[1].setLatLng(L.latLng(e.target.getLatLng().lat,e.target.parent.getBounds().getEast()))
    e.target.parent.markers[1].setOpacity(1)
  }
}