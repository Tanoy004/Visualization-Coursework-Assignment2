var i_d = "PC7"
var biPlotX = 0
var biPlotY = 1
var NumberofClusters = 5
var obj = null
const heightSvg = 500;
const widthSvg = 550;
var colorScale = d3.scaleOrdinal()
        .domain(d3.range(NumberofClusters))
        .range(d3.schemeCategory10);
function pca_screeplot(obj){
    eign_values = obj.eign_values
    eign_sum = obj.eign_sum
    d3.select("#plotter").selectAll("*").remove();
    var margin = {top: 30, right: 30, bottom: 170, left: 100},
    width = widthSvg - margin.left - margin.right,
    height = heightSvg - margin.top - margin.bottom;

    d3.select("#title").selectAll("*").remove();
    d3.select("#title")
        .append("h2")
        .text("PCA ScreePlot : Principal Components vs Eigen Values");

    retDict = eign_values.map((element, index) => {return {k:"PC"+(index+1), v:element}});
                
    var svg = d3.select("#plotter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(retDict.map(function(d) { return d.k; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.selectAll("mybar")
        .data(retDict)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.k); })
        .attr("y", function(d) { return y(d.v); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.v); })
        .attr("fill", function(d) { 
            if(d.k == i_d) {
                return "orange"
            }else{
                return "#eec719"
            }
        })
        .attr("stroke", function(d) { 
            if(d.k == "PC"+(biPlotX+1) || d.k == "PC"+(biPlotY+1)) {
                return "black"
            }
        })
        .on("click", function() {
            i_d = this.__data__.k
            biPlotY = biPlotX
            biPlotX = parseInt(i_d.slice(2,i_d.length))-1
            svg.selectAll("rect")
                .attr("fill", function(d) { 
                    if(d.k == i_d) {
                        return "orange"
                    }else{
                        return "#eec719"
                    }
                })
                .attr("stroke", function(d) { 
                    if(d.k == "PC"+(biPlotX+1) || d.k == "PC"+(biPlotY+1)) {
                        return "black"
                    }
                })
                pca_biplot(obj)
        });
    svg.append("text")
        .attr("transform", "translate(" + width/2 + "," + (height+60) + ")")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Principle Components");

    svg.append("text")
        .attr("transform", "translate(" + -50 + "," + (height/2) + ") rotate(-90)")
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .text("Eigen Values");

    var pca_legend = ["Dimensionality Index (di)", "PCA Biplot Axes (PC Block Borders)"]
    // Create scales for x and y axes
    var legend = svg.selectAll(".legend")
        .data(pca_legend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i+2) * 20 + ")"; });
    
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => i == 0?"orange":"#ffe7d4")
        .style("stroke", (d, i) => i == 1?"black":"");
  
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
    var lineGenerator = d3.line()
        .x((d, i) => (x("PC"+(i+1))+x.bandwidth()/2))
        .y(d => y(d))
        .curve(d3.curveLinear);

    
    svg.append("path")
        .datum(eign_sum)
        .attr("fill", "none")
        .attr("stroke", "#9ba8cd")
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

    svg.selectAll("circle")
        .data(eign_sum)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => (x("PC"+(i+1))+x.bandwidth()/2))
        .attr("cy", d => y(d))
        .attr("r", 5)
        .attr("fill", "red");
        
    console.log("thikthak!")
}

function pca_biplot(obj){
    pca_data = obj.pca_data
    data_cluster_labels = obj.data_cluster_labels
    loadings = obj.loadings
    raw_data_columns = obj.raw_data_columns
    var margin = {top: 30, right: 80, bottom: 170, left: 100},
    width = widthSvg - margin.left - margin.right,
    height = heightSvg - margin.top - margin.bottom;

    d3.select("#title1").selectAll("*").remove();
    d3.select("#title1")
        .append("h2")
        .text("PCA Biplot : PC"+(biPlotX+1)+" vs PC"+(biPlotY+1));

    d3.select("#plotter1").selectAll("*").remove();
    var svg = d3.select("#plotter1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    xMinimum = d3.min(pca_data.map(function(d) {
        return parseFloat(d[biPlotX])
    }));    
    xMaximum = d3.max(pca_data.map(function(d) {
        return parseFloat(d[biPlotX])
    }));
    yMinimum = d3.min(pca_data.map(function(d) {
        return parseFloat(d[biPlotY])
    }));    
    yMaximum = d3.max(pca_data.map(function(d) {
        return parseFloat(d[biPlotY])
    }));

    console.log("xMinimum, xMaximum, yMinimum, yMaximum :", xMinimum, xMaximum, yMinimum, yMaximum)

    var x1 = d3.scaleLinear()
        .range([ 0, width ])
        .domain([xMinimum, xMaximum])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var y1 = d3.scaleLinear()
        .domain([yMinimum, yMaximum])
        .range([ height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y1));
    retDict = []
    for (i = 0 ; i < data_cluster_labels[NumberofClusters-1].length ; i++){
        retDict.push({x: pca_data[i][biPlotX], y: pca_data[i][biPlotY], c: data_cluster_labels[NumberofClusters-1][i]})
    }
    // Create scatter plot for data points
    colorScale = d3.scaleOrdinal()
        .domain(d3.range(NumberofClusters))
        .range(d3.schemeCategory10);

    svg.selectAll("circle")
        .data(retDict)
        .enter()
        .append("circle")
        .attr("cx", d => x1(d.x))
        .attr("cy", d => y1(d.y))
        .attr("r", 4)
        .attr("fill", d => colorScale(d.c));

    clusters = []
    for(i = 0 ; i < NumberofClusters ; i++){
        clusters.push("C"+(i+1))
    }

    var legend = svg.selectAll(".legend")
        .data(clusters)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  
    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d, i) => colorScale(i));
  
    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    svg.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+60) + ")")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("PC" + (biPlotX+1));

    svg.append("text")
    .attr("transform", "translate(" + -50 + "," + (height/2) + ") rotate(-90)")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("PC" + (biPlotY+1));
    
    // drawing loading vectors  
    vectors = loadings.map(function(d) { return [d[biPlotX], d[biPlotY]]})
    console.log(vectors)
    
    xMinimum = d3.min(vectors.map(function(d) {
        return parseFloat(d[0])
    }));    
    xMaximum = d3.max(vectors.map(function(d) {
        return parseFloat(d[0])
    }));
    yMinimum = d3.min(vectors.map(function(d) {
        return parseFloat(d[1])
    }));    
    yMaximum = d3.max(vectors.map(function(d) {
        return parseFloat(d[1])
    }));


    var x1_loading = d3.scaleLinear()
        .range([ 0, width ])
        .domain([xMinimum, xMaximum])

    var y1_loading = d3.scaleLinear()
        .domain([yMinimum, yMaximum])
        .range([ height, 0]);    
    
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    svg.selectAll(".line")
        .data(vectors)
        .enter()
        .append("line")
        .attr("x1", x1(0))
        .attr("y1", y1(0))
        .attr("x2", d => x1_loading(d[0])) // End point of vector
        .attr("y2", d => y1_loading(d[1])) // End point of vector
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.selectAll(".text")
        .data(vectors)
        .enter()
        .append("text")
        .attr("x", d => (x1_loading(d[0]))) // Position text halfway along the vector
        .attr("y", d => (y1_loading(d[1]))) // Position text halfway along the vector
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", "15px")
        .text((d, i) => raw_data_columns[i]);
    
    
    console.log("thikthak!")
}


function kmeans_mseplot(obj){
    mse = obj.mse
    retDict = mse.map((element, index) => {return {k:(index+1), v:element}});
    var margin = {top: 30, right: 30, bottom: 170, left: 100},
    width = widthSvg - margin.left - margin.right,
    height = heightSvg - margin.top - margin.bottom;

    d3.select("#title2").selectAll("*").remove();
    d3.select("#title2")
        .append("h2")
        .text("K-means MSE Plot : Number of Clusters vs MSE Score");

    d3.select("#plotter2").selectAll("*").remove();
    var svg = d3.select("#plotter2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


    var x2 = d3.scaleBand()
    .range([ 0, width ])
    .domain(retDict.map(function(d) { return d.k; }))
    .padding(0.2);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x2))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    var y2 = d3.scaleLinear()
    .domain([0, d3.max(retDict, function(d){return d.v+0.2;})])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y2));

    svg.selectAll("mybar")
    .data(retDict)
    .enter()
    .append("rect")
    .attr("x", function(d) { return x2(d.k); })
    .attr("y", function(d) { return y2(d.v); })
    .attr("width", x2.bandwidth())
    .attr("height", function(d) { return height - y2(d.v); })
    .attr("fill", function(d) { return d.k == (NumberofClusters)? "orange":"#EE7519"})
    .attr("stroke", function(d) { return d.k == (NumberofClusters)? "black":""})
    .on("click", function() {
        NumberofClusters = parseInt(this.__data__.k)
        svg.selectAll("rect")
        .attr("fill", function(d) { return d.k == (NumberofClusters)? "orange":"#EE7519"})
        .attr("stroke", function(d) { return d.k == (NumberofClusters)? "black":""})
        pca_biplot(obj)
    });
    svg.append("text")
    .attr("transform", "translate(" + width/2 + "," + (height+60) + ")")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Number of Clusters");

    svg.append("text")
    .attr("transform", "translate(" + -50 + "," + (height/2) + ") rotate(-90)")
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("MSE Score");

    var mse_legend = ["Number of Clusters Selected"]
    // Create x and y axes scales
    var legend = svg.selectAll(".legend")
        .data(mse_legend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + (i+1) * 20 + ")"; });
    
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", "orange")
        .style("stroke", "black");
  
    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})

    // Create x and y axes scales
    var xScale = d3.scaleLinear()
        .domain([0, retDict.length])
        .range([ 0, width ]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(retDict, function(d){return d.v+0.2;})])
        .nice()
        .range([height, 0]);

    var lineGenerator = d3.line()
        .x((d, i) => (x2((i+1)) + x2.bandwidth() / 2))
        .y(d => y2(d))
        .curve(d3.curveLinear);

    
    svg.append("path")
        .datum(mse)
        .attr("fill", "none")
        .attr("stroke", "#9BB8CD")
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);

    svg.selectAll("circle")
        .data(mse)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => (x2((i+1)) + x2.bandwidth() / 2))
        .attr("cy", d => y2(d))
        .attr("r", 5)
        .attr("fill", "red");
}

function initializationOf_loading(){
    d3.select("#title3").selectAll("*").remove();
    d3.select("#title4").selectAll("*").remove();
    d3.select("#table").selectAll("*").remove();
    d3.select("#plotter3").selectAll("*").remove();
    // Ploting all plots
    //------------------
    pca_screeplot(obj)
    pca_biplot(obj)
    kmeans_mseplot(obj)
}
d3.json('/data')
            .then(data => {
                console.log(data)
                data = data[0]
                obj = {
                    eign_values : data.eign_values,
                    eign_sum : data.eign_sum,
                    pca_data : data.pca_data,
                    data_cluster_labels : data.data_cluster_labels,
                    mse : data.mse,
                    tot_cluster_centers : data.tot_cluster_centers,
                    loadings : data.loadings,
                    raw_data : data.raw_data,
                    raw_data_columns : data.raw_data_columns,
                    sqrd_loads : data.sqrd_loads,
                    data : data.data
                }
                pca_screeplot(obj)
                pca_biplot(obj)
                kmeans_mseplot(obj)
            })
            .catch(error => console.error('Hi Error:', error));

function make_scatterplot(){
    matrix_plot(obj)
}

function compare_function(l, r){
    return r[1]-l[1];    
}

function cross(a) {
    return function(d) {
        var c = [];
        for (var i = 0, n = a.length; i < n; i++) c.push({x: d, y: a[i]});
        return c;
    };
}

function draw_table(columns, sqrds, integer){

    d3.select("#title3").selectAll("*").remove();
    d3.select("#title3")
        .append("h2")
        .text("Squared Sum of PCA Loadings");

    columns = columns.slice(0, integer)
    sqrds = sqrds.slice(0, integer)
    t_data = []
    for(i = 0 ; i < integer ; i++){
        t_data.push([columns[i], sqrds[i][1]])
    }

    d3.select("#table").selectAll("*").remove();
    var tableContainer = d3.select("#table");

        // Create table
        var table = tableContainer.append("table")
            .style("border", "1px solid black");

        // Create header rows for table
        var thead = table.append("thead");
        var headerRow = thead.append("tr");
        headerRow.selectAll("th")
            .data(["Selected Four Attributes", "Squared Sum of PCA Loads"])
            .enter().append("th")
            .text(d => d)
            .style("border", "1px solid black");

        // Create body rows for table
        var tbody = table.append("tbody");
        var rows = tbody.selectAll("tr")
            .data(t_data)
            .enter().append("tr")
            .style("border", "1px solid black");

        // Create table cells
        var cells = rows.selectAll("td")
            .data(d => Object.values(d))
            .enter().append("td")
            .text(d => d)
            .style("border", "1px solid black");;
}

function matrix_plot(obj){
    
    d3.select("#title").selectAll("*").remove();
    d3.select("#title1").selectAll("*").remove();
    d3.select("#title2").selectAll("*").remove();
    
    d3.select("#plotter").selectAll("*").remove();
    d3.select("#plotter1").selectAll("*").remove();
    d3.select("#plotter2").selectAll("*").remove();
    d3.select("#plotter3").selectAll("*").remove();

    // kmeans_plot
    integer = parseInt(i_d.slice(2,i_d.length))
    console.log(obj.sqrd_loads)
    sqrd_loads = obj.sqrd_loads[integer-1].map((d, i) => [i, d])
    sqrd_loads.sort(compare_function)
    raw_data_columns = obj.raw_data_columns
    raw_data = obj.raw_data
    matrix_columns = []
    for(i = 0 ; i < 4 ; i++){
        matrix_columns.push(raw_data_columns[sqrd_loads[i][0]])
    }
    for(i = obj.data[0].length ; i < obj.data[0].length + 10 ; i++){
        matrix_columns.push(raw_data_columns[i])
    }
    matrix_data = raw_data.map(function (row){
        row_new = []
        for(i = 0 ; i < 4 ; i++){
            row_new.push(row[sqrd_loads[i][0]])
        }
        for(i = obj.data[0].length ; i < obj.data[0].length + 10 ; i++){
            row_new.push(row[i])
        }
        return row_new
    })

    // Chart dimensions set up
    draw_table(matrix_columns, sqrd_loads, 4)

    d3.select("#title4").selectAll("*").remove();
    d3.select("#title4")
        .append("h2")
        .text("ScatterPlot Matrix");

    var margin = {top: 30, right: 30, bottom: 60, left: 60}
    var nRows = 300
    var nCols = 300
    width = nCols - margin.left - margin.right,
    height = nRows - margin.top - margin.bottom;

    // Create SVG container
    var svg_grid = d3.select("#plotter3")
        .style("width", (width + margin.left + margin.right ) * 4)
        .style("height", (height + margin.top + margin.bottom) * 4)
        .style("display", "grid")
        .style("grid-template-columns", 'repeat('+4+', 0fr)')
        .style("grid-template-rows", 'repeat('+4+', 0fr)')

    for(i = 0 ; i < 4 ; i++){
        for(j = 0 ; j < 4 ;  j++){
            var svg = svg_grid.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("border", "1px solid black")
                    .append("g")
                    .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

                xMinimum = d3.min(matrix_data.map(function(d) {
                    return parseFloat(d[i])
                }));    
                xMaximum = d3.max(matrix_data.map(function(d) {
                    return parseFloat(d[i])
                }));
                yMinimum = d3.min(matrix_data.map(function(d) {
                    return parseFloat(d[j])
                }));    
                yMaximum = d3.max(matrix_data.map(function(d) {
                    return parseFloat(d[j])
                }));

                var x1 = d3.scaleLinear()
                    .range([ 0, width ])
                    .domain([xMinimum, xMaximum])

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x1))
                    .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end");

                var y1 = d3.scaleLinear()
                    .domain([yMinimum, yMaximum])
                    .range([ height, 0]);

                svg.append("g")
                    .call(d3.axisLeft(y1));
                retDict = []
                for (k = 0 ; k < matrix_data[4+NumberofClusters-1].length ; k++){
                    retDict.push({x: matrix_data[k][i], y: matrix_data[k][j], c: matrix_data[k][4+NumberofClusters-1]})
                }

                // Place the Points inside the plots

                if(i != j){
                    svg.selectAll("circle")
                    .data(retDict)
                    .enter()
                    .append("circle")
                    .attr("cx", d => x1(d.x))
                    .attr("cy", d => y1(d.y))
                    .attr("r", 4)
                    .attr("fill", d => colorScale(d.c));

                    clusters = []
                    for(k = 0 ; k < NumberofClusters ; k++){
                        clusters.push("c"+(k+1))
                    }

                    var legend = svg.selectAll(".legend")
                        .data(clusters)
                    .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d, k) { return "translate(0," + k * 20 + ")"; });
                
                    // draw legend colored rectangles
                    legend.append("rect")
                        .attr("x", width - 10)
                        .attr("width", 10)
                        .attr("height", 10)
                        .style("fill", (d, k) => colorScale(k));
                
                    // draw legend text
                    legend.append("text")
                        .attr("x", width - 10)
                        .attr("y", 3)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .attr("font-size", "13px")
                        .text(function(d) { return d;})

                    svg.append("text")
                    .attr("transform", "translate(" + width/2 + "," + (height+40) + ")")
                    .attr("fill", "black")
                    .style("text-anchor", "middle")
                    .text(matrix_columns[i]);

                    svg.append("text")
                    .attr("transform", "translate(" + -35 + "," + (height/2) + ") rotate(-90)")
                    .attr("fill", "black")
                    .style("text-anchor", "middle")
                    .text(matrix_columns[j]);
                }
                else{
                    svg.append("text")
                    .attr("transform", "translate(" + width/2 + "," + (height/2-10) + ")")
                    .attr("fill", "black")
                    .style("text-anchor", "middle")
                    .text(matrix_columns[i]+" vs");

                    svg.append("text")
                    .attr("transform", "translate(" + width/2 + "," + (height/2+10) + ")")
                    .attr("fill", "black")
                    .style("text-anchor", "middle")
                    .text(matrix_columns[j]);
                }
        }
    }
}

