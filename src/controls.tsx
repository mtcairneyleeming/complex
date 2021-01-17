/** @jsx createElement */
/*** @jsxFrag createFragment */

import { getInput } from "./helpers";
import { regions } from "./regions";
import { complex, abs } from "mathjs"
import { plugins } from "chart.js";

//#region JSX stuff

//indebted to https://medium.com/better-programming/how-to-use-jsx-without-react-21d23346e5dc

const createElement = (tag, props, ...children) => {
    if (typeof tag === "function") return tag(props, ...children);
    const element = document.createElement(tag);

    Object.entries(props || {}).forEach(([name, value]) => {
        if (name.startsWith("on") && name.toLowerCase() in window)
            element.addEventListener(name.toLowerCase().substr(2), value);
        else element.setAttribute(name, value.toString());
    });

    children.forEach(child => {
        appendChild(element, child);
    });

    return element;
};

const appendChild = (parent, child) => {
    if (Array.isArray(child))
        child.forEach(nestedChild => appendChild(parent, nestedChild));
    else
        parent.appendChild(child.nodeType ? child : document.createTextNode(child));
};

const createFragment = (props, ...children) => {
    return children;
};

//#endregion



export function setupRegionControls(region: string) {
    let data = regions[region]
    let container = document.getElementById("region_options")
    container.innerHTML = ""
    for (let [name, info] of Object.entries(data["fields"])) {
        let fieldset = (<div></div>);
        let inputName = "reg_" + name + "_" + info["name"];
        switch (info["type"]) {
            case "complex":
                let plus = MathJax.tex2chtml("+", { display: false });

                let i = MathJax.tex2chtml("i", { display: false });

                let c =
                    (
                        <div class="row mb-3" >
                            <div class="col-auto">
                                <label for={inputName + "_re"} class="col-form-label" > {info["name"]}: </label>
                            </div>
                            <div class="col-auto">
                                <div class="input-group" >
                                    <input name={inputName + "_re"} id={inputName + "_re"} type="number" class="form-control" value={info["default"].re} />
                                    <span class="input-group-text" >{plus}</span>
                                    <input name={inputName + "_im"} id={inputName + "_im"} type="number" class="form-control" value={info["default"].im} />
                                    <span class="input-group-text" > {i} </span>
                                </div>
                            </div>
                        </div>

                    );
                fieldset.appendChild(c);
                break;
            case "real":
                let r =
                    (<div class="row mb-3" >
                        <div class="col-auto">
                            <label for={inputName} class="col-form-label" > {info["name"]}: </label>
                        </div>
                        <div class="col-auto">
                            < div class=" input-group" >
                                <input name={inputName} id={inputName} type="number" class="form-control" {...(info["nonneg"] ? { min: "0.0" } : {})} value={info["default"]} />
                                <span class="input-group-text" > units </span>
                            </div>
                        </div>
                    </div>);
                fieldset.appendChild(r);
                break;
            case "angle":
                let a =
                    (<div class="row mb-3" >
                        <div class="col-auto">
                            <label for={inputName} class="col-form-label" > {info["name"]}: </label>
                        </div>
                        <div class="col-auto">
                            < div class=" input-group" >
                                <input name={inputName} id={inputName} type="number" class="form-control" value={info["default"]} />
                                <span class="input-group-text" > π radians </span>
                            </div>
                        </div>
                    </div >);
                fieldset.appendChild(a);
                break;

                break;
        }

        container.appendChild(fieldset)
    }
}

export function getPointsfromRegion(region: string, density) {
    let readData = {}
    let data = regions[region]
    for (let [name, info] of Object.entries(data["fields"])) {
        let inputName = "reg_" + name + "_" + info["name"];
        switch (info["type"]) {
            case "complex":
                let re = parseFloat(getInput(inputName + "_re").value)
                let im = parseFloat(getInput(inputName + "_im").value)
                readData[name] = complex(re, im);
                break;
            case "real":
            case "angle":
                readData[name] = getInput(inputName).value


                break;
            case "radio":
                // TODO !!!!!!
                break;
        }
    }
    readData["domain_infinity"] = parseFloat(getInput("domain_infinity").value)

    let rInf = parseFloat(getInput("domain_infinity").value)
    let transformed = data["points"](readData, density);
    return transformed.filter(p => (abs(p.point) as unknown as number) < rInf);
}

export function setupSelect() {
    let select = document.getElementById("region_select") as HTMLSelectElement;
    select.addEventListener("input", () => {
        setupRegionControls(select.options[select.selectedIndex].value)
    })
    setupRegionControls(select.options[select.selectedIndex].value)
}