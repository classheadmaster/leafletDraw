class DrawRect{
  constructor(map){
    this.map=map
    var group=new L.LayerGroup()
    ,startLatLng
    ,rect
    ,rect2
    ,myIcon
    ,mapEdit
    this.group=group
    this.group.addTo(this.map)
    this.startLatLng=startLatLng
    this.rect=rect
    myIcon =new L.DivIcon({
      iconSize: new L.Point(15, 15),
      className: 'leaflet-div-icon'
    })
    this.myIcon=myIcon
    this.mapEdit=mapEdit=true
  }
  // show(){
  //   console.log(this._map)
  // }
  draw(){
    this.map.on('click',this.mapClick,this)
    this.map.on('mousemove',this.mapMove,this)
  };
  mapClick(e){
    if(this.rect2) this.map.removeLayer(this.rect2)
    if(!this.startLatLng){
      this.startLatLng=e.latlng
    }else if(!this.rect){
      this.rect=new L.Rectangle(new L.LatLngBounds(this.startLatLng, e.latlng),{draggable:true})
      this.rect.addTo(this.map)
      this.rect.on('click',this.editRect,this)
    }
  }
  mapMove(e){
    if(this.startLatLng&&!this.rect){
      if(this.rect2) this.map.removeLayer(this.rect2)
      this.rect2=new L.Rectangle(new L.LatLngBounds(this.startLatLng, e.latlng))
      this.rect2.addTo(mymap)
      
    }
  }
  editRect(e){
    // console.log(this)
    if(this.mapEdit){
      this.creatMarker(this.getBound(this.rect))
      this.rect.on('drag',this.dragRect,this)
      this.rect.on('dragend',this.dragRect,this)
      // rect.on('dragstart',dragRect)
      this.rect.setStyle({color: "red",dashArray:'10,10'})
      this.rect.dragging.enable();
    }else{
      this.group.clearLayers()
      this.rect.setStyle({color:'#3388ff',dashArray:'0,0'})
      this.rect.dragging.disable();
    }
    this.mapEdit=!this.mapEdit
  }
  getBound(rect){
    var arr1=rect.getLatLngs()[0]
    return arr1
  }
  creatMarker(arr) {
    // if(group.getLayers())
    if(this.group.getLayers().length==0){
      this.rect._marker=[]
      this.rect._markerID=[]
      for (let i = 0; i < arr.length; i++){
        var marker =new L.Marker(arr[i],{icon:this.myIcon,draggable:true})
        marker._index=i
        this.rect._marker.push(marker)
        marker.on('drag',this.dragMarker,this)
        marker.addTo(this.group)
        this.rect._markerID.push(this.group.getLayerId(marker))
        
      }
    }
  }
  dragRect(){
    if(this.group.getLayers().length>0){
      var arr1=this.rect.getLatLngs()[0]
      // console.log(arr1);
      for(let i = 0; i < this.rect._markerID.length; i++){
        this.group.getLayer(this.rect._markerID[i]).setLatLng(arr1[i])
      }
    }
  }
  dragMarker(e){
    let startIndex
    var newLatLng=[]
    e.target._index<2?startIndex=Number(e.target._index)+2:startIndex=e.target._index-2
    newLatLng.push([e.latlng.lat,this.rect._marker[startIndex]._latlng.lng])
    newLatLng.push([e.latlng.lat,e.latlng.lng])
    newLatLng.push([this.rect._marker[startIndex]._latlng.lat,e.latlng.lng])
    newLatLng.push([this.rect._marker[startIndex]._latlng.lat,this.rect._marker[startIndex]._latlng.lng])
    this.rect.setLatLngs(newLatLng)
    // creatMarker(getBound(rect))
    this.updateMarker(e,startIndex)
    
    this.rect.redraw()
  }
  updateMarker(e,startIndex){
    if(e.target._index==0||e.target._index==2){
      this.group.getLayer(this.rect._markerID[1]).setLatLng(L.latLng(e.latlng.lat,this.rect._marker[startIndex]._latlng.lng))
      this.group.getLayer(this.rect._markerID[3]).setLatLng(L.latLng(this.rect._marker[startIndex]._latlng.lat,e.latlng.lng))
    }else{
      this.group.getLayer(this.rect._markerID[0]).setLatLng(L.latLng(e.latlng.lat,this.rect._marker[startIndex]._latlng.lng))
      this.group.getLayer(this.rect._markerID[2]).setLatLng(L.latLng(this.rect._marker[startIndex]._latlng.lat,e.latlng.lng))
    }
  }
}