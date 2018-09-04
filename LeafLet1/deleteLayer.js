function Delete(map){
  this._map=map;
  this.layers={};
  this.drawLayers=undefined;
  this._map.on('editLayer',this.addLayer,this);
  this._map.on('notEditLayer',this.removeLayer,this);
  this._map.on('drawLayer',this.drawLayer,this);
  this._map.on('stopLayer',this.stopDrawLayer,this);
}
Delete.prototype={
  deleteLayers(){
    for(let id in this.layers){
      var markers=this.layers[id].markers;
      this._map.removeLayer(this.layers[id]);
      for (let i = 0; i < markers.length; i++) {
        this._map.removeLayer(markers[i])        
      }
    }
  },
  addLayer(e){
    this.layers[e.layer._leaflet_id]=e.layer;
    // console.log(e.layer)
  },
  removeLayer(e){
    delete this.layers[e.layer._leaflet_id];
  },
  drawLayer(e){
    this.drawLayers=e.layer;
  },
  stopDrawLayer(e){
    this.drawLayers=undefined;
  }

}