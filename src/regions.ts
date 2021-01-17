import { Point } from "./point";
import * as chroma from "chroma-js"
import * as math from "mathjs"
type Field = {
    type: "complex" | "real" | "angle";
    name: string;
    default: any;
    nonneg?: boolean;
}
type Region = {
    name: String,
    fields: { [name: string]: Field },
    points: (inputs: any, density: number) => Point[],
    container: (inputs: any) => ((point: Point) => boolean)
}
export const regions: { [key: string]: Region } = {
    "disc": {
        name: "Disc",
        fields: {
            centre: { type: "complex", name: "Centre", default: math.complex(0, 0) },
            r: { type: "real", name: "Radius", nonneg: true, default: 1.0 },

        },
        points: (inputs, density: number): Point[] => {
            let r = inputs["r"];

            let centre = inputs["centre"] // a math.js complex number

            let radSteps = Math.floor(r * density);

            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = 0; i <= radSteps; i++) { // steps from the centre
                let radius = (i / radSteps) * r;

                let steps = Math.floor(Math.PI * radius * density);
                if (steps == 0) steps = 1; // when radius = 1
                for (let j = 0; j <= steps; j++) { // steps around the circle
                    let frac = j / steps
                    points.push({
                        colour: chroma.scale([minScale(frac), maxScale(frac)])(i / radSteps),
                        point: math.add(centre, math.complex({ r: radius, phi: frac * 2 * Math.PI }))

                    })
                    if (typeof math.add(centre, math.complex({ r: radius, phi: frac * 2 * Math.PI })) === "undefined") {
                        console.log(centre, radius, frac)
                    }
                }
            }
            return points
        },
        container: (inputs) => {
            let r = inputs["r"];

            let centre: math.Complex = inputs["centre"] // a math.js complex number
            // @ts-ignore
            return (point: Point) => math.abs(math.subtract(point.point, centre)) <= r
        }
    },
    "annulus": {
        name: "Annulus",
        fields: {
            centre: { type: "complex", name: "Centre", default: math.complex(1, 1) },
            r1: { type: "real", name: "Inner radius", nonneg: true, default: 1.0 },
            r2: { type: "real", name: "Outer radius", nonneg: true, default: 2.0 }
        },
        points: (inputs, density: number) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let centre = inputs["centre"] // a math.js complex number
            let minR = Math.min(r1, r2)
            let maxR = Math.max(r1, r2)
            let radSteps = Math.floor((maxR - minR) * density);

            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = 0; i <= radSteps; i++) { // steps from the centre
                let radius = minR + i / radSteps * (maxR - minR);

                let steps = Math.floor(Math.PI * radius * density);
                if (steps == 0) steps = 1;
                for (let j = 0; j <= steps; j++) { // steps around the circle
                    let frac = j / steps
                    points.push({
                        colour: chroma.scale([minScale(frac), maxScale(frac)])(i / radSteps),
                        point: math.add(centre, math.complex({ r: radius, phi: frac * 2 * Math.PI }))
                    })
                }
            }
            return points
        },
        container: (inputs) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let minR = Math.min(r1, r2)
            let maxR = Math.max(r1, r2)
            let centre: math.Complex = inputs["centre"] // a math.js complex number

            return (point: Point) => {
                // @ts-ignore
                let dist = math.abs(math.subtract(point.point, centre));
                return dist >= minR && dist <= maxR
            }
        }
    },
    "sector": {
        name: "Sector",
        fields: {
            centre: { type: "complex", name: "Centre", default: math.complex(0, 0) },
            theta1: { type: "angle", name: "Starting angle", default: -0.25 },
            theta2: { type: "angle", name: "Ending angle", default: 0.25 }
        },
        points: (inputs, density: number) => {
            let infinity = inputs["domain_infinity"]
            let t1 = inputs["theta1"];
            let t2 = inputs["theta2"];
            let centre = inputs["centre"] // a math.js complex number
            let minT = Math.min(t1, t2) * Math.PI
            let maxT = Math.max(t1, t2) * Math.PI
            let radSteps = Math.floor(infinity * density);
            console.log(radSteps, minT, maxT)
            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = 0; i <= radSteps; i++) { // steps from the centre
                let radius = i / radSteps * infinity;

                let steps = Math.floor((maxT - minT) * radius * density);
                if (steps == 0) steps = 1;
                let minColour = minScale(1 - 1.0 * i / radSteps);
                let maxColour = maxScale(1.0 * i / radSteps);
                let scale = chroma.scale([minColour, maxColour])
                for (let j = 0; j <= steps; j++) { // steps around the circle
                    let frac = j / steps
                    points.push({
                        colour: scale(1 - frac),
                        point: math.add(centre, math.complex({ r: radius, phi: minT + frac * (maxT - minT) }))
                    })

                }
            }
            return points
        },
        container: (inputs) => {
            let t1 = inputs["theta1"];
            let t2 = inputs["theta2"];
            let centre = inputs["centre"] // a math.js complex number
            let minT = Math.min(t1, t2) * Math.PI
            let maxT = Math.max(t1, t2) * Math.PI

            return (point: Point) => {
                // @ts-ignore
                let dist = math.arg(math.subtract(point.point, centre));
                return dist >= minT && dist <= maxT
            }
        }
    },
    "horiz_strip": {
        name: "Horizontal Strip",
        fields: {

            lower: { type: "real", name: "Lower bound", default: 1.0 },
            upper: { type: "real", name: "Upper bound", default: 2.0 }
        },
        points: (inputs, density: number) => {
            let infinity = inputs["domain_infinity"]
            let t1 = inputs["lower"];
            let t2 = inputs["upper"];

            let lower = Math.min(t1, t2) // just to be sure
            let upper = Math.max(t1, t2)
            let horizSteps = 2 * Math.floor(infinity * density);
            let verticalSteps = (upper - lower) * density;
            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            console.log(horizSteps, verticalSteps)
            // for now, the colour gradient is a rectangle of four colours
            for (let i = -horizSteps; i <= horizSteps; i++) { // steps from the centre
                let horizPosition = i / horizSteps * infinity;


                let minColour = minScale(1 - 1.0 * i / horizSteps);
                let maxColour = maxScale(1.0 * i / horizSteps);
                let scale = chroma.scale([minColour, maxColour])
                for (let j = 0; j <= verticalSteps; j++) { // steps around the circle
                    let frac = j / verticalSteps
                    points.push({
                        colour: scale(1 - frac),
                        point: math.complex(horizPosition, frac * (upper - lower) + upper)
                    })

                }
            }
            return points
        },
        container: (inputs) => {
            let t1 = inputs["lower"];
            let t2 = inputs["upper"];

            let lower = Math.min(t1, t2) // just to be sure
            let upper = Math.max(t1, t2)

            return (point: Point) =>
                point.point.im >= lower && point.point.im <= upper

        }
    },
    "vert_strip": {
        name: "Vertical Strip",
        fields: {

            theta1: { type: "real", name: "Lower bound", default: 1.0 },
            theta2: { type: "real", name: "Upper bound", default: 2.0 }
        },
        points: (inputs, density: number) => {
            let infinity = inputs["domain_infinity"]
            let t1 = inputs["lower"];
            let t2 = inputs["upper"];

            let lower = Math.min(t1, t2) // just to be sure
            let upper = Math.max(t1, t2)
            let vertSteps = 2 * Math.floor(infinity * density);
            let horizSteps = (upper - lower) * density;
            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = -vertSteps; i <= vertSteps; i++) { // steps from the centre
                let vertPosition = i / vertSteps * infinity;


                let minColour = minScale(1 - 1.0 * i / vertSteps);
                let maxColour = maxScale(1.0 * i / vertSteps);
                let scale = chroma.scale([minColour, maxColour])
                for (let j = 0; j <= horizSteps; j++) { // steps around the circle
                    let frac = j / horizSteps
                    points.push({
                        colour: scale(1 - frac),
                        point: math.complex(frac * (upper - lower) + upper, vertPosition,)
                    })

                }
            }
            return points
        },
        container: (inputs) => {
            let t1 = inputs["lower"];
            let t2 = inputs["upper"];

            let lower = Math.min(t1, t2) // just to be sure
            let upper = Math.max(t1, t2)

            return (point: Point) =>
                point.point.re >= lower && point.point.re <= upper

        }
    },
    "diff_circles": {
        name: "Difference of circles",
        fields: {
            centre1: { type: "complex", name: "First Centre", default: math.complex(1, 1) },
            centre2: { type: "complex", name: "Second Centre", default: math.complex(-1, -1) },
            r1: { type: "real", name: "Inner radius", nonneg: true, default: 1.0 },
            r2: { type: "real", name: "Outer radius", nonneg: true, default: 2.0 }
        },
        points: (inputs, density: number) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let centre1 = inputs["centre1"]
            let centre2 = inputs["centre2"]


            function inSecond(point: math.MathType): boolean {
                // @ts-ignore
                return math.abs(math.subtract(point, centre2)) <= r2
            }
            let radSteps = Math.floor(r1 * density);

            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = 0; i <= radSteps; i++) { // steps from the centre
                let radius = (i / radSteps) * r1;

                let steps = Math.floor(Math.PI * radius * density);
                if (steps == 0) steps = 1; // when radius = 1
                for (let j = 0; j <= steps; j++) { // steps around the circle
                    let frac = j / steps
                    let point = math.add(centre1, math.complex({ r: radius, phi: frac * 2 * Math.PI }))
                    if (!inSecond(point))
                        points.push({
                            colour: chroma.scale([minScale(frac), maxScale(frac)])(i / radSteps),
                            point: point
                        })
                }
            }
            return points
        },
        container: (inputs) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let centre1 = inputs["centre1"]
            let centre2 = inputs["centre2"]


            return (point: Point) => {
                // @ts-ignore
                let dist1 = math.abs(math.subtract(point.point, centre1));
                // @ts-ignore
                let dist2 = math.abs(math.subtract(point.point, centre2));
                return dist1 <= r1 && dist2 >= r2;
            }
        }
    },
    "int_circles": {
        name: "Difference of circles",
        fields: {
            centre1: { type: "complex", name: "First Centre", default: math.complex(1, 1) },
            centre2: { type: "complex", name: "Second Centre", default: math.complex(-1, -1) },
            r1: { type: "real", name: "Inner radius", nonneg: true, default: 1.0 },
            r2: { type: "real", name: "Outer radius", nonneg: true, default: 2.0 }
        },
        points: (inputs, density: number) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let centre1 = inputs["centre1"]
            let centre2 = inputs["centre2"]


            function inSecond(point: math.MathType): boolean {
                // @ts-ignore
                return math.abs(math.subtract(point, centre2)) <= r2
            }
            let radSteps = Math.floor(r1 * density);

            let points = [];
            let minScale = chroma.scale('YlGnBu')

            let maxScale = chroma.scale('RdPu')
            // for now, the colour gradient is a rectangle of four colours
            for (let i = 0; i <= radSteps; i++) { // steps from the centre
                let radius = (i / radSteps) * r1;

                let steps = Math.floor(Math.PI * radius * density);
                if (steps == 0) steps = 1; // when radius = 1
                for (let j = 0; j <= steps; j++) { // steps around the circle
                    let frac = j / steps
                    let point = math.add(centre1, math.complex({ r: radius, phi: frac * 2 * Math.PI }))
                    if (inSecond(point))
                        points.push({
                            colour: chroma.scale([minScale(frac), maxScale(frac)])(i / radSteps),
                            point: point
                        })
                }
            }
            return points
        },
        container: (inputs) => {
            let r1 = inputs["r1"];
            let r2 = inputs["r2"];
            let centre1 = inputs["centre1"]
            let centre2 = inputs["centre2"]


            return (point: Point) => {
                // @ts-ignore
                let dist1 = math.abs(math.subtract(point.point, centre1));
                // @ts-ignore
                let dist2 = math.abs(math.subtract(point.point, centre2));
                return dist1 <= r1 && dist2 >= r2;
            }
        }
    },
};