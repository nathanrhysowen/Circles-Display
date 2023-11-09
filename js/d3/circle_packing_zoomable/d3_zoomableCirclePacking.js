// https://observablehq.com/@d3/zoomable-circle-packing@165
function _1(md){return(
md`# Zoomable Circle Packing

Click to zoom in or out.`
)}

function _chart(pack,data,d3,width,height,color)
{

  let calculateTextFontSize = function(d) {
    let id = d3.select(this).attr("id");
    let category = d3.select(this).attr("category");
    console.log(category);
    let radius = 0;
    if (d.fontsize){
      /** If fontsize is already calculated use that. **/
      return d.fontsize;
    }
    /** Make text size fixed if it is a person **/
    if (category === "person" || category === "key_person")
    {
      d.fontsize = 14 + "px"
      return d.fontsize;
    }
    if (!d.computed) {
      /** If computed not present get & store the getComputedTextLength() of the text field **/
      d.computed = this.getComputedTextLength();
      if(d.computed !== 0){
        /** If computed is not 0 then get the visual radius of DOM **/
        let r = d3.selectAll("#" + id).attr("r");
        //if radius present in DOM use that
        if (r) {
          radius = r;
        }
        //calculate the font size and store it in object for future
        d.fontsize = (1.95 * radius) / d.computed * 24 + "px";
        return d.fontsize;
      }
    }
  }

  const root = pack(data);
  let focus = root;
  let view;

  let svg = d3.create("svg")
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      /** SVG Canvas Size **/
      .attr("width", "100vw")
      .attr("height", "100vh")
      .style("display", "block")
    //   .style("margin", "0 -14px")
      .style("cursor", "pointer")
      .on("click", (event) => zoom(event, root));

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
      .attr("fill", d => d.children ? color(d.depth) : "white")
      /** Edit "none" to null to remove the deepest node's lack of interactions **/
      .attr("pointer-events", d => !d.children ? "none" : null)
      /** ID **/
      .attr("id", function(d, i) {return "id" + (i)})
      /** Edit stroke colour for mouseover outline on bubbles **/
      .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function() { d3.select(this).attr("stroke", null); })
      .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

  node.append("svg:title")
        .text(function(d)
        {
          return d.data.name;
        })

  const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
        .style("fill-opacity", d => d.parent === root ? 1 : 0)
        .style("display", d => d.parent === root ? "inline" : "none")
        .style("font-weight", "bold")
        .text(d => d.data.name)
        /** ID **/
        .attr("id", function(d, i) {return "id" + (i-1)})
        /** Category **/
        .attr("category", function(d) {return d.data.category})
        .style("font-size", calculateTextFontSize)


  onStart([root.x, root.y, root.r * 2]);

  /**
   * / Run font size calculation on page load and call zoomTo
   **/
  function onStart(v)
  {
    setTimeout(function() {
      d3.selectAll("text").filter(function(d)
      {
        return d.parent === focus || this.style.display === "inline";
      })
        .style("font-size", calculateTextFontSize);
    }, 100);

    zoomTo(v);
  }


  function zoomTo(v) {
    const k = width / v[2];

    view = v;

    label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
    node.attr("r", d => d.r * k);
  }

  function zoom(event, d)
  {
    const focus0 = focus;

    focus = d;

    const transition = svg.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });


    label
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
      .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });


    setTimeout(function() {
      d3.selectAll("text").filter(function(d)
      {
        return d.parent === focus || this.style.display === "inline";
      })
        .style("font-size", calculateTextFontSize);
      }, 750)
  }


  return svg.node();
}


function _data(FileAttachment){return(
FileAttachment("flare-2.json").json()
)}

function _pack(d3,width,height){return(
data => d3.pack()
    .size([width, height])
    .padding(3)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
)}

function _width(){return(
700
)}

function _height(width){return(
width
)}

function _format(d3){return(
d3.format(",d")
)}

function _color(d3){return(
d3.scaleLinear()
    /** Number of colours **/
    .domain([0, 3])
    /** Colour Scheme **/
    .range(["hsl(0,0%,100%)", "hsl(160,71%,36%)"])
    .interpolate(d3.interpolateHcl)
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["flare-2.json", {url: new URL("./scct_data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["pack","data","d3","width","height","color"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("pack")).define("pack", ["d3","width","height"], _pack);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("format")).define("format", ["d3"], _format);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
