function DrawPoly(map){
  this._map=map;
  this._pop=L.popup();
  
  this._drawAble=true;
  this._myIcon =new L.DivIcon({
    iconSize: new L.Point(15, 15),
    className: 'leaflet-div-icon'
  });
}

DrawPoly.prototype={
  draw(){
    this._poly=L.polygon([],{draggable:true});
    this._poly._len=0;
    this._map.on('click',this._mapClick,this);
    this._map.on('dblclick',this._mapDblClick,this);
    this._map.on('mousemove',this._mapMove,this);
    this._poly.addTo(this._map);
    this._poly.dragging.disable();
    if(!this._map.hasLayer(myCursor)) myCursor.addTo(this._map);
  },
  stopDraw(){
    this._map.off('click',this._mapClick,this)
              .off('mousemove',this._mapMove,this)
              .off('dblclick',this._mapDblClick,this);

  },
  _mapClick(e){
    if(this._drawAble){
      this._poly.addLatLng(e.latlng);
      this._poly._len++;
    };
    this._map.fire('drawLayer',{layer:this._poly});
    // console.log(this._poly);
  },
  _mapDblClick(){
    if(this._poly.getLatLngs()[0].length>2&&this._drawAble){
      //停止绘制
      this._map.off('click',this._mapClick,this);
      this._map.off('dblclick',this._mapDblClick,this);
      this._map.off('mousemove',this._mapMove,this);
      //双击会触发单击事件，因此pop掉最后两个重复latlng
      this._poly.getLatLngs()[0].pop();
      this._poly.getLatLngs()[0].pop();
      this._poly.setLatLngs(this._poly.getLatLngs()[0]);
      this._poly._mapEdit=true;
      this._poly.on('click',this._polyClick,this)
                .on('drag',this._polyMove,this);
      this._poly.markers=this._creatMarker(this._poly.getLatLngs()[0],this._poly);
      this._map.removeLayer(myCursor);
      this._map.fire('stopLayer',{layer:this._poly});
    }
  },
  _mapMove(e){
    myCursor.setLatLng(e.latlng);
    if(!this._poly.isEmpty()){
      var polyArr=this._poly.getLatLngs()[0]
      this._poly.setLatLngs(this._changeLastPoint(polyArr,e,this._poly._len))
      //判断是否自相交
      if(this._poly._len>2){
        if(this._isKinks(polyArr)){
          this._pop.setLatLng(e.latlng).setContent('不允许多边形自相交').openOn(this._map);
          this._poly.setStyle({color: "black",dashArray:'0,0'});
          this._drawAble=false;
        }else{
          this._map.removeLayer(this._pop);
          this._poly.setStyle({color:'#3388ff',dashArray:'0,0'});
          this._drawAble=true;
        }
      }
    }
  },
  _changeLastPoint(arr,e,len){
    arr[len]=e.latlng
    return arr
  },
  _polyClick(e){
    if(e.target._mapEdit){
      e.target.setStyle({color: "red",dashArray:'10,10'});
      this._showMarker(e.target.markers);
      e.target.dragging.enable();
      this._map.fire('editLayer',{layer:e.target});
    }else{
      e.target.setStyle({color:'#3388ff',dashArray:'0,0'});
      this._removeLayer(e.target.markers)
      e.target.dragging.disable();
      this._map.fire('notEditLayer',{layer:e.target});
    }
    e.target._mapEdit=!e.target._mapEdit;
  },
  _polyMove(e){
    var len=e.target.markers.length;
    for (let i = 0; i < len; i++){
      e.target.markers[i].setLatLng(e.target.getLatLngs()[0][i])
    }
  },
  _creatMarker(latlngs,parent){
    var markers=[];
    for (let i = 0; i < latlngs.length; i++){
      var marker =new L.Marker(latlngs[i],{icon:this._myIcon,draggable:true});
      marker.index=i;
      marker.parent=parent;
      marker.on('drag',this._dragMarker,this)
            .on('dragstart',this._dragStart,this)
            .on('dragend',this._dragEnd,this);
      markers.push(marker);
    }
    return markers;
  },
  //显示marker
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
  //判断自相交
  _isKinks(arr){
    var turfPoly=[];
    for (let i = 0; i < arr.length; i++) {
      turfPoly[i]=[arr[i].lat,arr[i].lng]
    };
    turfPoly[arr.length]=turfPoly[0];
    // console.log(turf.kinks(turf.polygon([turfPoly])).features.length>0)
    // console.log(turfPoly)
    return turf.kinks(turf.polygon([turfPoly])).features.length>0
    // return turf.polygon([turfPoly])
  },
  //marker拖拽
  _dragMarker(e){
    var dragArr=e.target.parent.getLatLngs()[0];
    dragArr[e.target.index]=e.latlng; 
    e.target.parent.setLatLngs(dragArr)
    if(this._isKinks(dragArr)){
      this._pop.setLatLng(e.latlng).setContent('不允许多边形自相交').openOn(this._map);
      e.target.parent.setStyle({color: "black",dashArray:'0,0'});
    }else{
      this._map.removeLayer(this._pop);
      e.target.parent.setStyle({color: "red",dashArray:'10,10'});
    }
  },
  //拖拽开始设置一个拖拽前latlng
  _dragStart(e){
    e.target.parent.orginLatLngs=e.target.parent.getLatLngs()[0];
  },
  //拖拽结束如果为相交的话返回之前一个拖拽
  _dragEnd(e){
    if(this._isKinks(e.target.parent.getLatLngs()[0])){
      e.target.parent.setLatLngs(e.target.parent.orginLatLngs);
      e.target.setLatLng(e.target.parent.getLatLngs()[0][e.target.index]);
      this._map.removeLayer(this._pop);
      e.target.parent.setStyle({color: "red",dashArray:'10,10'});
    }
  }
}