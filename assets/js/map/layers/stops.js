import { colors } from "../utils/tailwindColor.js";

export function addStops(map) {
  const sourceId = "stop-source";
  if (!map.getSource(sourceId)) return;

  map.addLayer({
    id: "stops-layer",
    type: "circle",
    source: sourceId,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": 6,
      "circle-color": colors.point || "#3b82f6",
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#ffffff"
    }
  });
}
