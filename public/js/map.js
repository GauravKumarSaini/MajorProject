mapboxgl.accessToken = window.mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: window.coordinates,
  zoom: 9
});

const marker=new mapboxgl.Marker({color:"red"})
  .setLngLat(window.coordinates)
  .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML("<h4>location</h4><p>Exact location provided after the booking</p>"))
    .addTo(map);
