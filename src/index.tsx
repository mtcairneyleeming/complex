/** @jsx createElement */
/*** @jsxFrag createFragment */

import { setupLatex } from './latex'
import math = require('mathjs')
import { getPointsfromRegion, setupSelect } from './controls'
import { plotDataToChart } from './webgl-plotting'
import { Point } from './point'

function calculate() {
    let select = document.getElementById("region_select") as HTMLSelectElement;
    let points: Point[] = getPointsfromRegion(select.options[select.selectedIndex].value, 100);

    plotDataToChart(points, "#pre_chart")
    let expression = (document.getElementById("conformal_map") as HTMLInputElement).value
    let map = math.compile(expression);
    console.log(points)
    // let mapped_points = points.map(point => {
    //     return {
    //         point: map.evaluate({ z: point.point }),
    //         colour: point.colour
    //     }
    // })
    // plotDataToChart(mapped_points, "#post_chart")
}


(() => {
    document.getElementById("calc_button").addEventListener("click", calculate)

    setupLatex();
    setupSelect()
})();