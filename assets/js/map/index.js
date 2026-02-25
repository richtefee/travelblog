import { addOverviewSource } from "./sources/overview.js";
import { addRoutes } from "./layers/routes.js";
import { addGeodesics } from "./layers/geodesics.js";
import { addStops } from "./layers/stops.js";
import { addArticles } from "./layers/articles.js"; // new

// initialize all maps on the page
document.querySelectorAll(".map").forEach(initMap);

async function initMap(el) {
    const geojsonUrl = el.dataset.geojson;
    const lat = parseFloat(el.dataset.lat);
    const lon = parseFloat(el.dataset.lon);
    const zoom = parseFloat(el.dataset.zoom);

    const map = new maplibregl.Map({
        container: el.id,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [lon, lat],
        zoom,
        attributionControl: false
    });

    // map controls
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(new maplibregl.NavigationControl());

    map.on("load", async () => {

        try {
            const geojson = await fetch(geojsonUrl).then(r => r.json());
            if (!geojson) return;

            // add base data source
            addOverviewSource(map, geojson);

            // layers
            addRoutes(map);              // regular routes
            addGeodesics(map, geojson);  // great-circle routes
            addStops(map);     // stops / points
            addArticles(map);   // article-specific markers
        } catch (err) {
            console.error("Failed to load map GeoJSON:", geojsonUrl, err);
        }


    });

    map.once("idle", () => {
        map.addControl(
            new maplibregl.AttributionControl()
        )
        // force a layout pass → attribution collapses
        requestAnimationFrame(() => {
            const btn = map
            .getContainer()
            .querySelector('.maplibregl-ctrl-attrib-button')
            btn.click()
        })

        el.classList.add("is-ready")
    })
}
