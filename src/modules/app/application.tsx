import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

// Styling of OpenLayers components like zoom and pan controls
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Draw } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";

// By calling the "useGeographic" function in OpenLayers, we tell that we want coordinates to be in degrees
//  instead of meters, which is the default. Without this `center: [10.6, 59.9]` brings us to "null island"
useGeographic();

// Here we create a Map object. Make sure you `import { Map } from "ol"`. Otherwise, the standard Javascript
//  map data structure will be used

const map = new Map({
  // The map will be centered on a position in longitude (x-coordinate, east) and latitude (y-coordinate, north),
  //   with a certain zoom level
  view: new View({ center: [10.8, 59.9], zoom: 13 }),
  // map tile images will be from the Open Street Map (OSM) tile layer
  layers: [new TileLayer({ source: new OSM() })],
});

const pointStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: "red" }),
    stroke: new Stroke({ color: "black", width: 2 }),
  }),
});

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: pointStyle,
});
map.addLayer(vectorLayer);

const savePoints = () => {
  const features = vectorSource.getFeatures();
  const geoJson = new GeoJSON().writeFeatures(features);
  localStorage.setItem("savedPoints", geoJson);
};

const loadPoints = () => {
  const savedPoints = localStorage.getItem("savedPoints");
  if (savedPoints) {
    const features = new GeoJSON().readFeatures(savedPoints);
    vectorSource.addFeatures(features);
  }
};
// A functional React component
export function Application() {
  // `useRef` bridges the gap between JavaScript functions that expect DOM objects and React components
  const mapRef = useRef<HTMLDivElement | null>(null);
  // When we display the page, we want the OpenLayers map object to target the DOM object refererred to by the
  // map React component
  useEffect(() => {
    map.setTarget(mapRef.current!);
    loadPoints();
    vectorSource.on("change", savePoints);
  }, []);

  const enableDrawing = () => {
    const draw = new Draw({
      source: vectorSource,
      type: "Point",
    });
    map.addInteraction(draw);

    draw.on("drawend", (event) => {
      map.removeInteraction(draw);

      const feature = event.feature; // ✅ Get the drawn feature
      const name = prompt("Enter a name for this point:", "My Location"); // ✅ Ask user for name

      if (name) {
        feature.setProperties({ name }); // ✅ Assign name property (triggers re-render)
      }
    });
  };

  return (
    <div>
      <button onClick={enableDrawing}>Draw Point</button>{" "}
      {/* ✅ ADD THIS BUTTON */}
      <div ref={mapRef} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}
