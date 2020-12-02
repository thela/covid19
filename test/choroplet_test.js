


function ready([world_data, ddpcData, ddpcaData]) {
    var DdpcConfig = ready_ddpc(ddpcData, ddpcaData);
    function country_clicked(d){
        updateDdpc(DdpcConfig, ddpcData, ddpcaData, d.properties.name);
    }
    var worldmapConfig = ready_worldmap(world_data, country_clicked);
}

var promises = [...promises_worldmap,...promises_ddpc]

function load(){
    Promise.all(promises).then(ready)

};