export function addOverviewSource(map, geojson) {
    const kinds = [...new Set(geojson.features.map(f => f.properties?.kind).filter(Boolean))];

    kinds.forEach(kind => {
        const sourceId = `${kind}-source`;
        const features = geojson.features.filter(f => f.properties.kind === kind);

        // Define clustering options only for articles
        const isArticle = kind === "article";

        const sourceOptions = {
            type: "geojson",
            data: { type: "FeatureCollection", features: features },
            cluster: isArticle, // Only true for articles
        };

        // Only add clustering logic if it's an article
        if (isArticle) {
            sourceOptions.clusterMaxZoom = 18;
            sourceOptions.clusterRadius = 25;
            sourceOptions.clusterProperties = {
                "titles": [
                    ["concat",
                  ["accumulated"], " | ",
                  ["case", ["has", "titles"], ["get", "titles"], ["get", "title"]]
                    ],
                  ["get", "title"]
                ],
                "urls": [
                    ["concat",
                  ["accumulated"], " | ",
                  ["case", ["has", "urls"], ["get", "urls"], ["get", "url"]]
                    ],
                  ["get", "url"]
                ]
            };
        }

        map.addSource(sourceId, sourceOptions);
    });
}
