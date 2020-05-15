
export const displayMap = locations => {
mapboxgl.accessToken = 'pk.eyJ1IjoiZ29yZG9ub3RpZW5vIiwiYSI6ImNrYTI5ZnpucDAwOXEzZW16Nno4YzBvejEifQ.X4UZqgmqNLeIY1cYOJ6umg';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/gordonotieno/cka2boi1n01q71ioqa6bfcmi6',
scrollZoom: false
// center:[-118.113491,34.111745],
// zoom:10
//interactive: false
});

 const bounds = new mapboxgl.LngLatBounds()

locations.forEach( loc =>{
    //create maker
    const el = document.createElement('div')
    el.className = 'marker'

    //add maker
    new mapboxgl.Marker({
        element: el,
        anchor:'bottom'
    })
    .setLngLat(loc.coordinates)
    .addTo(map)  //from the model

//add pop ups
new mapboxgl.Popup({
    offset: 30
})
.setLngLat(loc.coordinates)
.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
.addTo(map)

//extend map bounds to include current locations
    bounds.extend(loc.coordinates)
})

map.fitBounds(bounds,{
   padding: {
    top:200,
    bottom: 200,
    left: 100,
    right: 100
   }
})
}