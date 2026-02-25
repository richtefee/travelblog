function tailwindColor(className, property, fallback) {
    const el = document.createElement("div");
    el.className = className + " hidden";
    document.body.appendChild(el);
    const value = getComputedStyle(el)[property];
    document.body.removeChild(el);
    return value || fallback;
}

export const colors = {
    point: tailwindColor("text-neutral-500", "color", "#9ca3af"),
    route: tailwindColor("text-neutral-500", "color", "#374151"),
    geodesic: tailwindColor("text-neutral-600", "color", "#374151")
};
