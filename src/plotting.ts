import * as d3 from "d3"
import { Point } from "./point"
import * as math from "mathjs"
export function plotDataToChart(points: Point[], container: string) {

    // let maxX = Math.ceil(math.max(points.map(p => p.point.re)))
    // let minX = Math.floor(math.min(points.map(p => p.point.re)))
    // let maxY = Math.ceil(math.max(points.map(p => p.point.im)))
    // let minY = Math.floor(math.min(points.map(p => p.point.im)))
    // let min = Math.min(minX, minY)
    // let max = Math.max(maxX, maxY)
    // if (Math.abs(min - max) < 1e-2) {
    //     min = -4.5;
    //     max = 4.5
    // }
    // if (!isFinite(max) || !isFinite(min) || isNaN(max) || isNaN(min)) {
    //     min = -10;
    //     max = 10;
    // }
    let min = -10;
    let max = 10;


    let width = 600;
    let height = 600;
    let k = height / width;

    d3.select(container).selectAll("*").remove()

    let svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        // @ts-ignore
        .attr("viewBox", [0, 0, width, height])


    let zoom = d3.zoom()
        // .scaleExtent([0.5, 32])
        .on("zoom", zoomed);


    const gGrid = svg.append("g");



    const gx = svg.append("g");

    const gy = svg.append("g");

    let xAxis = (axis, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => axis
        .attr("transform", `translate(0,${yScale(0)})`)
        .call(d3.axisTop(xScale).ticks(12))
    // .call(g => g.select(".domain").attr("display", "none"))

    let yAxis = (axis, xScale: d3.ScaleLinear<number, number>, yScale: d3.ScaleLinear<number, number>) => axis
        .attr("transform", `translate(${xScale(0)}, 0)`)
        .call(d3.axisRight(yScale).ticks(12 * k))
    //  .call(g => g.select(".domain").attr("display", "none"))

    let x = d3.scaleLinear()
        .domain([min, max])
        .range([0, width])

    let y = d3.scaleLinear()
        .domain([min * k, max * k])
        .range([height, 0])

    let grid = (g, x, y) => g
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g
            .selectAll(".x")
            .data(x.ticks(12))
            .join(
                enter => enter.append("line").attr("class", "x").attr("y2", height),
                update => update,
                exit => exit.remove()
            )
            .attr("x1", d => 0.5 + x(d))
            .attr("x2", d => 0.5 + x(d)))
        .call(g => g
            .selectAll(".y")
            .data(y.ticks(12 * k))
            .join(
                enter => enter.append("line").attr("class", "y").attr("x2", width),
                update => update,
                exit => exit.remove()
            )
            .attr("y1", d => 0.5 + y(d))
            .attr("y2", d => 0.5 + y(d)));


    const gDot = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    gDot.selectAll("path")
        .data(points)
        .join("path")
        .attr("d", d => `M${x(d.point.re)},${y(d.point.im)}h0`)
        .attr("stroke", d => d.colour.hex());



    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    function zoomed(event) {
        let transform: d3.ZoomTransform = event.transform;
        const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
        // @ts-ignore
        gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
        gx.call(xAxis, zx, zy);
        gy.call(yAxis, zx, zy);
        gGrid.call(grid, zx, zy);
    }

    // let ctx = document.getElementById("pre_chart").getContext('2d');
    // let chart = new Chart(ctx, {
    //     type: 'scatter',
    //     data: {
    //         datasets: [{
    //             label: select.options[select.selectedIndex].text,
    //             data: points.map(p => { return { x: p.point.re, y: p.point.im } }),
    //             pointBackgroundColor: points.map(p => p.colour.hex())
    //         }]
    //     }
    // })
}