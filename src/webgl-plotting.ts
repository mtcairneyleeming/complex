import * as d3 from "d3"
import { Point } from "./point"
import * as math from "mathjs"
import * as fc from "d3fc"
export function plotDataToChart(points, container: string) {
    
    let fixDomain = (d) => {
        if (isNaN(d[0]) || isNaN(d[1]) || !isFinite(d[0]) || !isFinite(d[1])) {
            return [-100, 100]
        }
        else return d
    }
    const xExtent = fc.extentLinear().accessors([d => d.point.re])
    const yExtent = fc.extentLinear().accessors([d => d.point.im])
    let xDomain = fixDomain(xExtent(points));

    let yDomain = fixDomain(yExtent(points));
    console.log(xDomain, yDomain)
    const x = d3.scaleLinear().domain(xDomain);
    const y = d3.scaleLinear().domain(yDomain)
    const convColour = (c) => [c[0] / 255, c[1] / 255, c[2] / 255, c[3]]
    const fillColour = fc.webglFillColor().value(d => convColour(d.colour.rgba())).data(points)
    const area = fc
        .seriesWebglPoint()
        .crossValue(d => d.point.re)
        .mainValue(d => d.point.im)
        .size(10)
        .decorate(p => fillColour(p))

    // create a d3fc-zoom that handles the mouse / touch interactions
    const zoom = fc.zoom().on('zoom', render);

    // the chart!
    const chart = fc
        .chartCartesian(x, y)
        .chartLabel('Canvas Zoom 1,000 Points')
        .webglPlotArea(area)
        .decorate(sel => {
            // add the zoom interaction on the enter selection
            // use selectAll to avoid interfering with the existing data joins
            sel.enter()
                .selectAll('.plot-area')
                .call(zoom, x, y);
            sel.enter()
                .selectAll('.x-axis')
                .call(zoom, x, null);
            sel.enter()
                .selectAll('.y-axis')
                .call(zoom, null, y);
        });

    function render() {
        d3.select(container)
            .datum(points)
            .call(chart);
    }

    render();
}