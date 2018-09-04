// var layerConrtol=L.control.layers(null, null,{position:'topright'})

// layerConrtol.addTo()
function LayerConrtol(map){
  this.map=map;
  this.lConrtol=L.control.layers(null, null,{position:'topright',collapsed:false});
  this.marker=L.marker([32,118.5]);
  this.num='123123';
}
LayerConrtol.prototype={
  addMap(){
    this.lConrtol.addOverlay(this.marker,this.num);
    this.lConrtol.addTo(this.map);
  }
}