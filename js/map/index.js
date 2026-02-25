(() => {
  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/sources/overview.js
  function addOverviewSource(map, geojson) {
    const kinds = [...new Set(geojson.features.map((f) => f.properties?.kind).filter(Boolean))];
    kinds.forEach((kind) => {
      const sourceId = `${kind}-source`;
      const features = geojson.features.filter((f) => f.properties.kind === kind);
      const isArticle = kind === "article";
      const sourceOptions = {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: isArticle
        // Only true for articles
      };
      if (isArticle) {
        sourceOptions.clusterMaxZoom = 18;
        sourceOptions.clusterRadius = 25;
        sourceOptions.clusterProperties = {
          "titles": [
            [
              "concat",
              ["accumulated"],
              " | ",
              ["case", ["has", "titles"], ["get", "titles"], ["get", "title"]]
            ],
            ["get", "title"]
          ],
          "urls": [
            [
              "concat",
              ["accumulated"],
              " | ",
              ["case", ["has", "urls"], ["get", "urls"], ["get", "url"]]
            ],
            ["get", "url"]
          ]
        };
      }
      map.addSource(sourceId, sourceOptions);
    });
  }

  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/utils/tailwindColor.js
  function tailwindColor(className, property, fallback) {
    const el = document.createElement("div");
    el.className = className + " hidden";
    document.body.appendChild(el);
    const value = getComputedStyle(el)[property];
    document.body.removeChild(el);
    return value || fallback;
  }
  var colors = {
    point: tailwindColor("text-neutral-500", "color", "#9ca3af"),
    route: tailwindColor("text-neutral-500", "color", "#374151"),
    geodesic: tailwindColor("text-neutral-600", "color", "#374151")
  };

  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/layers/routes.js
  function addRoutes(map) {
    const sourceId = "route-source";
    if (!map.getSource(sourceId)) return;
    map.addLayer({
      id: "routes-layer",
      type: "line",
      source: sourceId,
      filter: ["==", ["get", "style"], "linear"],
      layout: {
        "line-cap": "round",
        "line-join": "round"
      },
      paint: {
        "line-width": 3,
        "line-color": colors.route || "#3b82f6",
        "line-opacity": 0.9
      }
    });
  }

  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/layers/geodesics.js
  function addGeodesics(map, geojson) {
    const geodesicFeatures = geojson.features.filter(
      (f) => f.geometry?.type === "LineString" && f.properties?.kind === "route" && f.properties?.style === "geodesic"
    );
    geodesicFeatures.forEach((feature, index) => {
      const coords = feature.geometry.coordinates;
      if (coords.length < 2) return;
      const start = coords[0];
      const end = coords[1];
      const curve = turf.greatCircle(start, end, { npoints: 100 });
      const uniqueSourceId = `geodesic-source-${index}`;
      const layerId = `geodesic-layer-${index}`;
      map.addSource(uniqueSourceId, {
        type: "geojson",
        data: curve
      });
      map.addLayer({
        id: layerId,
        type: "line",
        source: uniqueSourceId,
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-width": 3,
          "line-color": colors.geodesic || "#6366f1",
          "line-opacity": 0.4,
          "line-dasharray": [2, 3]
        }
      });
    });
  }

  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/layers/stops.js
  function addStops(map) {
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

  // ns-hugo-imp:/home/runner/work/travelblog/travelblog/assets/js/map/layers/articles.js
  function addArticles(map) {
    const sourceId = "article-source";
    if (!map.getSource(sourceId)) return;
    map.addLayer({
      id: "article-clusters",
      type: "circle",
      source: sourceId,
      filter: ["has", "point_count"],
      paint: {
        "circle-radius": 12,
        "circle-color": colors.article || "#f59e0b",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff"
      }
    });
    map.addLayer({
      id: "article-cluster-count",
      type: "symbol",
      source: sourceId,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"]
      },
      paint: { "text-color": "#fff" }
    });
    map.addLayer({
      id: "article-points",
      type: "circle",
      source: sourceId,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": 7,
        "circle-color": colors.article || "#f59e0b",
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#fff"
      }
    });
    ["article-clusters", "article-cluster-count"].forEach((layerId) => {
      map.on("click", layerId, (e) => {
        const props = e.features[0].properties;
        const titles = [...new Set((props.titles || "").split(" | ").filter((t) => t.trim()))];
        const urls = [...new Set((props.urls || "").split(" | ").filter((u) => u.trim()))];
        const html = titles.map((t, i) => `<a href="${urls[i] || "#"}" target="_blank">\u2022 ${t}</a>`).join("<br>");
        new maplibregl.Popup({ offset: [0, -10], closeButton: false, closeOnMove: true }).setLngLat(e.lngLat).setHTML(html).addTo(map);
      });
    });
    map.on("click", "article-points", (e) => {
      const props = e.features[0].properties;
      new maplibregl.Popup({ offset: [0, -10], closeButton: false, closeOnMove: true }).setLngLat(e.lngLat).setHTML(`<a href="${props.url}" target="_blank">${props.title}</a>`).addTo(map);
    });
    ["article-clusters", "article-cluster-count", "article-points"].forEach((l) => {
      map.on("mouseenter", l, () => map.getCanvas().style.cursor = "pointer");
      map.on("mouseleave", l, () => map.getCanvas().style.cursor = "");
    });
  }

  // <stdin>
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
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.addControl(new maplibregl.NavigationControl());
    map.on("load", async () => {
      try {
        const geojson = await fetch(geojsonUrl).then((r) => r.json());
        if (!geojson) return;
        addOverviewSource(map, geojson);
        addRoutes(map);
        addGeodesics(map, geojson);
        addStops(map);
        addArticles(map);
      } catch (err) {
        console.error("Failed to load map GeoJSON:", geojsonUrl, err);
      }
    });
    map.once("idle", () => {
      map.addControl(
        new maplibregl.AttributionControl()
      );
      requestAnimationFrame(() => {
        const btn = map.getContainer().querySelector(".maplibregl-ctrl-attrib-button");
        btn.click();
      });
      el.classList.add("is-ready");
    });
  }
})();
