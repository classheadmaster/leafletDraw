function DrawRect(map) {
  this._map=map;
  
  this._myIcon =new L.DivIcon({
    iconSize: new L.Point(15, 15),
    className: 'leaflet-div-icon'
  })
  this._cursor=(new L.Marker([0,0],{icon:this._myIcon})).addTo(this._map);
}
DrawRect.prototype={
  draw(){
    this._map.on('click',this._mapClick,this);
    this._map.on('mousemove',this._mapMove,this);
  },
  _mapClick(e){
    if(!this._startLatLng){
      this._startLatLng=e.latlng;
    }else{
      this._map.off('mousemove',this._mapMove,this)
      this._map.removeLayer(this._cursor);
      this._rect.on('click',this._editRect,this);
      this._rect._group=(new L.LayerGroup()).addTo(this._map);
      // this._rect=undefined;
    }
  },
  _mapMove(e){
    this._cursor.setLatLng(e.latlng)
    if(this._startLatLng&&!this._rect){
      this._rect=new L.Rectangle(new L.LatLngBounds(this._startLatLng, e.latlng),{draggable:true})
      this._rect.addTo(this._map)
      this._rect.dragging.disable();
      this._rect._mapEdit=true;
    }else if(this._rect){
      // this._rect.setLatLngs(this._getRectBound(e))
      this._rect.setBounds(L.latLngBounds(this._startLatLng, e.latlng))
      // this._rect.redraw()
    }
  },
  // _getRectBound(e){
  //   var bound=L.latLngBounds(this._startLatLng,e.latlng);
  //   return [
  //     bound.getSouthWest(),
  //     bound.getNorthWest(),
  //     bound.getNorthEast(),
  //     bound.getSouthEast()
  //   ]
  // },
  _editRect(e){  
    if(e.target._mapEdit){
      this._creatMarker(this._getBound(this._rect));
      this._rect.on('drag',this._dragRect,this);
      // console.log(this._rect._group._layers);
      // this._rect.on('dragend',this._dragRect,this);
      // rect.on('dragstart',dragRect)
      this._rect.setStyle({color: "red",dashArray:'10,10'});
      this._rect.dragging.enable();
    }else{
      this._rect._group.clearLayers();
      this._rect.setStyle({color:'#3388ff',dashArray:'0,0'});
      this._rect.dragging.disable();
    }
    e.target._mapEdit=!e.target._mapEdit;
  },
  _getBound(rect){
    var arr1=rect.getLatLngs()[0];
    return arr1;
  },
  _creatMarker(arr) {
    // if(group.getLayers())
    if(this._rect._group.getLayers().length==0){
      this._rect._group._marker=[];
      this._rect._group._markerID=[];
      for (let i = 0; i < arr.length; i++){
        var marker =new L.Marker(arr[i],{icon:this._myIcon,draggable:true});
        marker._index=i;
        this._rect._group._marker.push(marker);
        marker.on('drag',this._dragMarker,this);
        marker.addTo(this._rect._group);
        this._rect._group._markerID.push(this._rect._group.getLayerId(marker));  
      }
    }
  },
  _dragRect(){
    // console.log(this._rect._group._layers);

    if(this._rect._group.getLayers().length>0){
      var arr1=this._rect._group.getLatLngs()[0];
      // console.log(arr1);
      for(let i = 0; i < this._rect._group._markerID.length; i++){
        this._rect._group.getLayer(this._rect._group._markerID[i]).setLatLng(arr1[i]);
      }
    }
  },
  _dragMarker(e){
    // console.log(this._rect._group._layers);
    let startIndex
    var newLatLng=[]
    e.target._index<2?startIndex=Number(e.target._index)+2:startIndex=e.target._index-2;
    // newLatLng.push([e.latlng.lat,this._rect._marker[startIndex]._latlng.lng]);
    // newLatLng.push([e.latlng.lat,e.latlng.lng]);
    // newLatLng.push([this._rect._marker[startIndex]._latlng.lat,e.latlng.lng]);
    // newLatLng.push([this._rect._marker[startIndex]._latlng.lat,this._rect._marker[startIndex]._latlng.lng]);
    // this._rect.setLatLngs(newLatLng);
    this._startLatLng=this._rect._group._marker[startIndex]._latlng
    // this._rect.setLatLngs(this._getRectBound(e))
    this._rect.setBounds(L.latLngBounds(this._startLatLng, e.latlng))
    this._updateMarker(e,startIndex);
    
    this._rect.redraw();
  },
  _updateMarker(e,startIndex){
    if(e.target._index==0||e.target._index==2){
      this._rect._group.getLayer(this._rect._group._markerID[1]).setLatLng(L.latLng(e.latlng.lat,this._rect._group._marker[startIndex]._latlng.lng));
      this._rect._group.getLayer(this._rect._group._markerID[3]).setLatLng(L.latLng(this._rect._group._marker[startIndex]._latlng.lat,e.latlng.lng));
    }else{
      this._rect._group.getLayer(this._rect._group._markerID[0]).setLatLng(L.latLng(e.latlng.lat,this._rect._group._marker[startIndex]._latlng.lng));
      this._rect._group.getLayer(this._rect._group._markerID[2]).setLatLng(L.latLng(this._rect._group._marker[startIndex]._latlng.lat,e.latlng.lng));
    }
  }

}