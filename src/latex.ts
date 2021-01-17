
import { parse as mathParse } from "mathjs"

declare var MathJax: any;
function updateLatex(inp, out) {
    // var demoSource = document.getElementById(inp) as HTMLInputElement
    // var demoRendering = document.getElementById(out)
    // var math = MathJax.Hub.getAllJax(out)[0]

    // MathJax.Hub.Queue(['Text', math, pref + demoSource.value])
    var source = document.getElementById(inp) as HTMLInputElement
    let tex = ""
    if (source.value == "") {
        tex = "\\dots"
    } else {
        try {
            tex = "z\\mapsto " + mathParse(source.value).toTex({ parenthesis: "auto" })
        } catch (error) {
            //console.log(error)
            tex = `\\dots`
        }
    }
    const node = document.getElementById(out);

    node.innerHTML = ""
    var options = MathJax.getMetricsFor(node);
    options.display = false;
    MathJax.tex2chtmlPromise(tex, options).then(function (n) {
        node.appendChild(n)
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
    }).catch((e) => {
        console.log(e)
    })

}

export function setupLatex() {
    updateLatex("conformal_map", "conformal_latex")
    document.getElementById("conformal_map").addEventListener('input', function () {
        updateLatex("conformal_map", "conformal_latex")
    })
}