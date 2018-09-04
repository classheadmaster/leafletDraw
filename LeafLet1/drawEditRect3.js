function DrawRect(map) {
  this._map=map;
  this._that=this
  this._myIcon =new L.DivIcon({
    iconSize: new L.Point(15, 15),
    className: 'leaflet-div-icon'
  })
  
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
      // this._rect=undefined;
    }
  },
  _mapMove(e){
    this._cursor.setLatLng(e.latlng)
    if(this._startLatLng&&!this._rect){
      this._rect=new L.Rectangle(new L.LatLngBounds(this._startLatLng, e.latlng),{draggable:true})
      this._rect._group=(new L.LayerGroup()).addTo(this._map);
      this._rect.addTo(this._map)
      this._rect.dragging.disable();
      this._rect._mapEdit=true;
    }else if(this._rect){
      // this._rect.setLatLngs(this._getRectBound(e))
      this._rect.setBounds(L.latLngBounds(this._startLatLng, e.latlng))
      // this._rect.redraw()
    }
  },
  _editRect(e){  
    if(e.target._mapEdit){
      this._creatMarker(this._getBound(e.target),e);
      e.target.on('drag',this._dragRect,e);
      e.target.on('dragstart',this._dragRect,e);
      e.target.on('dragend',this._dragRect,e);
      // this._rect.on('dragend',this._dragRect,this);
      // rect.on('dragstart',dragRect)
      e.target.setStyle({color: "red",dashArray:'10,10'});
      e.target.dragging.enable();
    }else{
      e.target._group.clearLayers();
      e.target.setStyle({color:'#3388ff',dashArray:'0,0'});
      e.target.dragging.disable();
    }
    e.target._mapEdit=!e.target._mapEdit;
  },
  _getBound(rect){
    var arr1=rect.getLatLngs()[0];
    return arr1;
  },
  _creatMarker(arr,e) {
    // if(group.getLayers())
    if(e.target._group.getLayers().length==0){
      e.target._group._marker=[];
      e.target._group._markerID=[];
      for (let i = 0; i < arr.length; i++){
        var marker =new L.Marker(arr[i],{icon:this._myIcon,draggable:true});
        marker._index=i;
        e.target._group._marker.push(marker);
        marker.on('drag',this._dragMarker,e);
        marker.addTo(e.target._group);
        e.target._group._markerID.push(e.target._group.getLayerId(marker));  
      }
    }
  },
  _dragRect(){    
    if(this.target._group.getLayers().length>0){
      var arr1=this.target.getLatLngs()[0];
      // console.log(arr1);
      for(let i = 0; i < this.target._group._markerID.length; i++){
        this.target._group.getLayer(this.target._group._markerID[i]).setLatLng(arr1[i]);
      }
    }
  },
  _dragMarker(e){
    // console.log(this.target);
    // this.target._group._marker.setStyle({color:'green'})
    let startIndex
    var newLatLng=[]
    e.target._index<2?startIndex=Number(e.target._index)+2:startIndex=e.target._index-2;
    e.target._startLatLng=this.target._group._marker[startIndex]._latlng
    this.target.setBounds(L.latLngBounds(e.target._startLatLng, e.latlng))
    // this._that._updateMarker(e,startIndex);
    if(e.target._index==0||e.target._index==2){
      this.target._group.getLayer(this.target._group._markerID[1]).setLatLng(L.latLng(e.latlng.lat,this.target._group._marker[startIndex]._latlng.lng));
      this.target._group.getLayer(this.target._group._markerID[3]).setLatLng(L.latLng(this.target._group._marker[startIndex]._latlng.lat,e.latlng.lng));
    }else{
      this.target._group.getLayer(this.target._group._markerID[0]).setLatLng(L.latLng(e.latlng.lat,this.target._group._marker[startIndex]._latlng.lng));
      this.target._group.getLayer(this.target._group._markerID[2]).setLatLng(L.latLng(this.target._group._marker[startIndex]._latlng.lat,e.latlng.lng));
    }
    
    this.target.redraw();
  },
  // _updateMarker(e,startIndex){
  //   if(e.target._index==0||e.target._index==2){
  //     this._rect._group.getLayer(this._rect._group._markerID[1]).setLatLng(L.latLng(e.latlng.lat,this._rect._group._marker[startIndex]._latlng.lng));
  //     this._rect._group.getLayer(this._rect._group._markerID[3]).setLatLng(L.latLng(this._rect._group._marker[startIndex]._latlng.lat,e.latlng.lng));
  //   }else{
  //     this._rect._group.getLayer(this._rect._group._markerID[0]).setLatLng(L.latLng(e.latlng.lat,this._rect._group._marker[startIndex]._latlng.lng));
  //     this._rect._group.getLayer(this._rect._group._markerID[2]).setLatLng(L.latLng(this._rect._group._marker[startIndex]._latlng.lat,e.latlng.lng));
  //   }
  // }
}