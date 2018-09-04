function DrawRect(map){
  this._map=map;
  this._myIcon =new L.DivIcon({
    iconSize: new L.Point(15, 15),
    className: 'leaflet-div-icon'
  });
}

DrawRect.prototype={
  draw(){
    //监听绘制矩形时的单击和双击
    this._map
    .on('click',this._mapClick,this)
    .on('mousemove',this._mapMove,this);
  if(!this._map.hasLayer(myCursor)) myCursor.addTo(this._map);
  this._rect=undefined;
  this._startLatLng=undefined;
  },
  stopDraw(){
    this._map.off('click',this._mapClick,this)
              .off('mousemove',this._mapMove,this);
  }
  ,
  // 单击生成矩形起始点和第二次单击生成终止点
  _mapClick(e){
    // console.log('a');
    if(!this._startLatLng){
      this._startLatLng=e.latlng;
      
    }else{
      this._map.fire('stopLayer',{layer:this._rect});
      this._map.off('mousemove',this._mapMove,this)
      .off('click',this._mapClick,this);
      this._map.removeLayer(myCursor);
      this._rect.on('click',this._editRect,this);            
      this._rect.markers=this._creatMarker(this._rect.getLatLngs()[0],this._rect);
    }
  },
  // 移动鼠标自动绘制矩形
  _mapMove(e){
    myCursor.setLatLng(e.latlng)
    if(this._startLatLng&&!this._rect){
      this._rect=L.rectangle(new L.LatLngBounds(this._startLatLng, e.latlng),{draggable:true});
      this._rect.addTo(this._map);
      this._rect.dragging.disable();
      this._rect._mapEdit=true;
      this._map.fire('drawLayer',{layer:this._rect});
    }else if(this._rect){
      this._rect.setBounds(L.latLngBounds(this._startLatLng, e.latlng));
    }
  },
  _editRect(e){
    if(e.target._mapEdit){
      this._showMarker(e.target.markers);
      e.target.on('drag',this._dragRect,this);
      e.target.setStyle({color: "red",dashArray:'10,10'});
      e.target.dragging.enable();
      this._map.fire('editLayer',{layer:e.target});
    }else{
      this._removeLayer(e.target.markers)
      e.target.setStyle({color:'#3388ff',dashArray:'0,0'});
      e.target.dragging.disable();
      this._map.fire('notEditLayer',{layer:e.target});
    }
    e.target._mapEdit=!e.target._mapEdit;
  },
  _getBound(rect){
    var arr1=rect.getLatLngs()[0];
    return arr1;
  },
  _creatMarker(latlngs,parent){
    var markers=[];
    for (let i = 0; i < latlngs.length; i++){
      var marker =new L.Marker(latlngs[i],{icon:this._myIcon,draggable:true});
      marker.index=i;
      marker.parent=parent;
      marker.on('drag',this._dragMarker,this);
      markers.push(marker);
    }
    return markers;
  },
  _showMarker(markers){
    for (let i = 0; i < markers.length; i++){
      markers[i].addTo(this._map)
    }
  },
  _dragRect(e){
    // this._removeLayer(e.target.getLatLngs(),e.target._marker)
    this._setMarkerLatLng(e.target.getLatLngs()[0],e.target.markers)
    
  },
  //移除图层
  _removeLayer(arr){
    for (let i = 0; i < arr.length; i++) {
      this._map.removeLayer(arr[i])
    }
  },
  //移动图层时更新点的位置
  _setMarkerLatLng(rectlatlng,marker){
    for (let i = 0; i < marker.length; i++) {
      marker[i].setLatLng(rectlatlng[i])
      // console.log(marker[i].getLatLng());
    }
  },
  _dragMarker(e){
    var index=e.target.index;
    var index2=(index+2)%4;
    var parent=e.target.parent;
    var marker2=parent.markers[index2];
    parent.setBounds(L.latLngBounds(marker2.getLatLng(), e.latlng));
    var sideMarker1=(index+3)%4,sideMarker2=(sideMarker1+2)%4
    parent.markers[sideMarker1].setLatLng(L.latLng(marker2.getLatLng().lat,e.latlng.lng))
    parent.markers[sideMarker2].setLatLng(L.latLng(e.latlng.lat,marker2.getLatLng().lng))
  },

}