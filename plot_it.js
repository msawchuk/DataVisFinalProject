//given a ticker object, calculates probability of
var start_date;
var end_date;
var width = 500;
var height = 500;

function remove_leaves(node){
    if(node.children[0].is_leaf){
        node.children = []
    }
    else{
        for(var i = 0; i< node.children.length; i++){
            remove_leaves(node.children[i])
        }
    }
}
function std_dev(ticker){
    var variation = 0;
    var ev = ticker.value;
    if(!ticker.children[0].is_leaf) {
        for (var i = 0; i < ticker.children.length; i++) {
            std_dev(ticker.children[i])
            variation += ticker.children[i].enlargement
        }
        ticker.enlargement = variation/ticker.children.length
    }
    else{
        for(var i =0; i<ticker.valid_data.length; i++){
            variation += Math.pow(ev-ticker.valid_data[i].Close, 2)
        }
        variation /= ticker.valid_data.length
        //adjust for value size
        ticker.enlargement = variation/ev
    }

}
//given an array of tickers, calculates the average standard deviation
function get_avg_std_deviation(array){
    var deviation = 0;
    for(var i = 0; i < array.length; i++){
        deviation += arrya[i].deviation;
    }
    return Math.sqrt(deviation);
}
function deviation_pct(ticker){
    ticker.deviation_pct = ticker.std_deviation / ticker.value;
}
function plot_it() {
    start_date = new Date(2017, 0, 1);
    end_date = new Date(2018, 0, 1);

    preprocess_tree(price_data, '', 0, start_date, end_date);
    find_valid_data(price_data);
    aggregate(price_data);
    std_dev(price_data)
    remove_leaves(price_data);
    var svg = d3.select('body').append('svg').attr('width', 1000).attr('height', 1000);

    var nodes = [];
    var count = 0;
    category = 0;
    price_data.children.forEach(function(element) {
        element.children.forEach(function(element2) {
            element2.x = Math.cos(category / 3 * 2 * Math.PI) * (300 + 200 * Math.random()) + 400;
            element2.y = Math.sin(category / 3 * 2 * Math.PI) * (200 + 200 * Math.random()) + 400;
            //element2.x = 750 * Math.random();
            //element2.y = 750 * Math.random();
            //element2.radius = element2.value / 10;
            element2.radius = 40;
            element2.cat = category;
            nodes.push(element2);
            count++;
        })
        category++;
    })

    color_scale = d3.scaleLog()
        .domain([1, 1500])
        .range([0, 100]);

    var catColors = [];
    catColors.push(d3.lab(34.28, 42.67, -35.23));
    catColors.push(d3.lab(50.22, -1, 38.39));
    catColors.push(d3.lab(51.87, -30.43, 2.67));

    var force = d3.forceSimulation(price_data.children[0].children)
        .force("gravity", d3.forceManyBody().strength(600))
        .force("collide", d3.forceCollide(d=>d.radius).iterations(400))
    //.force("center", d3.forceCenter(400,400));
    var t = svg.selectAll('q').data(price_data.children[0].children).enter().append('circle')
        .attr('cx', d=> d.x)
        .attr('cy', d=> d.y)
        .attr('r', d=> d.radius - 4)
        .attr('fill', d=> d3.lab(50 + 0.5*color_scale(d.value),100 - color_scale(d.value),0.5 *color_scale(d.value)))
        .attr('opacity', '.2')
        .attr('category', d=>d.cat)
        .attr('stroke', d=>catColors[d.cat])
        .attr('stroke-width', '3')
    var ticked = function() {
        t
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }
    force
        .nodes(price_data.children[0].children)
        .on("tick", ticked)
        .on("end", function() {
            var arcdata = createEnvelope(price_data.children[0].children, price_data.children[0].enlargement);
            svg.append('path')
                .attr('d', arcdata)
                .attr('stroke', '#000')
                .attr('stroke-width', 4)
                .attr('fill', 'none')
            var force2 = d3.forceSimulation(price_data.children[1].children)
                .force("gravity", d3.forceManyBody().strength(600))
                .force("collide", d3.forceCollide(d=>d.radius).iterations(400))
            //.force("center", d3.forceCenter(400,400));
            var u = svg.selectAll('q').data(price_data.children[1].children).enter().append('circle')
                .attr('cx', d=> d.x)
                .attr('cy', d=> d.y)
                .attr('r', d=> d.radius - 4)
                .attr('fill', d=> d3.lab(50 + 0.5*color_scale(d.value),100 - color_scale(d.value),0.5 *color_scale(d.value)))
                .attr('opacity', '.2')
                .attr('category', d=>d.cat)
                .attr('stroke', d=>catColors[d.cat])
                .attr('stroke-width', '3')
            ticked = function() {
                u
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            }
            force2
                .nodes(price_data.children[1].children)
                .on("tick", ticked)
                .on("end", function() {
                    createEnvelope(price_data.children[1].children, price_data.children[1].enlargement);
                    var force3 = d3.forceSimulation(price_data.children[2].children)
                        .force("gravity", d3.forceManyBody().strength(600))
                        .force("collide", d3.forceCollide(d=>d.radius).iterations(400))
                    //.force("center", d3.forceCenter(400,400));
                    var v = svg.selectAll('q').data(price_data.children[2].children).enter().append('circle')
                        .attr('cx', d=> d.x)
                        .attr('cy', d=> d.y)
                        .attr('r', d=> d.radius - 4)
                        .attr('fill', d=> d3.lab(50 + 0.5*color_scale(d.value),100 - color_scale(d.value),0.5 *color_scale(d.value)))
                        .attr('opacity', '.2')
                        .attr('category', d=>d.cat)
                        .attr('stroke', d=>catColors[d.cat])
                        .attr('stroke-width', '3')
                    ticked = function() {
                        v
                            .attr("cx", function(d) { return d.x; })
                            .attr("cy", function(d) { return d.y; });
                    }
                    force3
                        .nodes(price_data.children[2].children)
                        .on("tick", ticked)
                        .on("end", function() {
                            svg.selectAll('circle').each(function(d) {
                                svg.append('text')
                                    .attr('x', this.cx.animVal.value)
                                    .attr('y', this.cy.animVal.value)
                                    .attr('text-anchor', 'middle')
                                    .attr('font-size', '12px')
                                    .text(d.name);
                            })
                            createEnvelope(price_data.children[2].children, price_data.children[2].enlargement);
                        })
                })
        });



    /*
    var force = d3.forceSimulation(nodes)
        .force("gravity", d3.forceManyBody().strength(600))
        .force("collide", d3.forceCollide(d=>d.radius).iterations(600))
        .force("center", d3.forceCenter(400,400));

    console.log(nodes);

    var t = svg.selectAll('q').data(nodes).enter().append('circle')
        .attr('cx', d=> d.x)
        .attr('cy', d=> d.y)
        .attr('r', d=> d.radius - 4)
        .attr('fill', d=> d3.lab(50 + 0.5*color_scale(d.value),100 - color_scale(d.value),0.5 *color_scale(d.value)))
        .attr('opacity', '.2')
        .attr('category', d=>d.cat)
        .attr('stroke', d=>catColors[d.cat])
        .attr('stroke-width', '3')

    var ticked = function() {
        t
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    }

    force
        .nodes(nodes)
        .on("tick", ticked)
        .on("end", function() {
            svg.selectAll('text').remove()
            svg.selectAll('circle').each(function(d) {
                svg.append('text')
                    .attr('x', this.cx.animVal.value)
                    .attr('y', this.cy.animVal.value)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '12px')
                    .text(d.name);
            })
        });
       */

    console.log(price_data);

}

function createEnvelope(nodes, enlargement) {
    var scale = d3.scaleLog()
        .domain([0.1,5])
        .range([0,0.8])
    enlargement = scale(enlargement);
   var bubbles =  getOuterCircle(nodes, enlargement);
    var arcs = createBubble(bubbles);
    return makePaths(arcs);

}

function getCat(data, catNum) {
    var arr = [];
    data.forEach(function(element) {
        if(element.cat <= catNum) {
            arr.push(element);
        }
    })
    return arr;
}

function getForce(node1, node2) {
    if(node1.position == node2.position) {
        return new Victor;
    }
    var gravConstant = 10;
    var difference = new Victor().copy(node1.position);
    difference.subtract(node2.position);
    var mag = (gravConstant * node1.radius * node2.radius) / difference.dot(difference);
    var magnitude = new Victor(mag, mag);
    var direction = new Victor().copy(node2.position);
    direction.subtract(node1.position);
    direction.normalize();
    return direction.multiply(magnitude);
}

function calculateMotion(parentNode, allData) {
    var accelerations = [];
        parentNode.children.forEach(function(element) {
            var force = new Victor();
            parentNode.children.forEach(function(element2) {
                force = force.add(getForce(element, element2));
            })
            accelerations.push(force.divide(new Victor(element.radius, element.radius)));
        })
        var counter = 0;
        parentNode.children.forEach(function(element) {
            element.velocity = element.velocity.add(accelerations[counter]);
            element.position = element.position.add(element.velocity);
            counter++;
        })

}

//Need to figure out a way to have the circles not be intersecting
function calculateCollisions(data) {
    data.children.forEach(function(element1) {
        element1.children.forEach(function(circle1) {
            if(intersectsAny(circle1, data)) {
                data.children.forEach(function(element2) {
                    element2.children.forEach(function(circle2) {
                        if(intersecting(circle1, circle2) && (circle1.name != circle2.name)) {
                            /*circle1.newVel = new Victor(((circle1.radius - circle2.radius) / (circle1.radius + circle2.radius)),
                                (circle1.radius - circle2.radius) / (circle1.radius + circle2.radius)).multiply(circle1.velocity)
                                .add(new Victor (2 * circle2.radius / (circle1.radius + circle2.radius),
                                    2 * circle2.radius / (circle1.radius + circle2.radius)).multiply(circle2.velocity));*/
                            var dist = circle1.radius + circle2.radius - distance(circle1, circle2);
                            var initPos = circle1.position;
                            var initPos1 = circle1.position;
                            var dir = initPos.subtract(circle2.position).normalize();
                            var translationVec = dir.multiply(new Victor(dist/2, dist/2));
                            circle1.position = circle1.position.add(translationVec);
                            circle1.velocity = new Victor();
                            initPos = circle2.position;
                            dir = initPos.subtract(initPos1).normalize();
                            translationVec = dir.multiply(new Victor(dist/2, dist/2));
                            circle2.position = circle2.position.add(translationVec);
                            circle2.velocity = new Victor();
                        }
                    })
                })
            }
        })
    })
}

//moves all circles in moveableData so that they do not intersect any circles in allData
//removes all intersections between circles if moveableData == allData, or if all circles that
//are in allData but not moveableData do not intersect
function removeIntersections(moveableData, allData) {
    if(moveableData.depth == 3) {
        var count = 1;
        while(intersectsAny(moveableData, allData)) {
            moveableData.position.x += 20;
        }
    } else {
        moveableData.children.forEach(function (element) {
            removeIntersections(element, allData);
        })
    }
}

//tells whether circle intersects any circles held in data
function intersectsAny(circle, data) {
    if(data.depth == 3) {
        return (intersecting(circle, data) && !(hasSameName(circle, data)));
    } else {
        var bool = false;
        data.children.forEach(function(element) {
            if(intersectsAny(circle, element)) {
                bool = true;
            }
        })
        return bool;
    }

}

//find distance between two circles in the tree
function distance(circle1, circle2) {
    return Math.sqrt(Math.pow((circle1.position.x - circle2.position.x), 2) +
        Math.pow((circle1.position.y - circle2.position.y), 2));
}

//tells whether two circles in the tree are intersecting
function intersecting(circle1, circle2) {
    return (distance(circle1, circle2) < (circle1.radius + circle2.radius));
}

function hasSameName(circle1, circle2) {
    return circle1.name == circle2.name;
}


function buildContour(nodes, enlargement){
    var outerCircs = getOuterCircle(nodes, enlargement);
}
function getOuterCircle(nodes, enlargement){
    //get deep copy
    var bigCircles = nodes.map(function (d) {
        return Object.assign({}, d)
    });
    bigCircles.forEach(function (circle) {
        circle.radius += enlargement*circle.radius;
    });
    var leftmost = bigCircles[0];
    for (var i = 1; i < bigCircles.length; i++) {
        if (bigCircles[i].x - bigCircles[i].r < leftmost.x - leftmost.r) {
            leftmost = bigCircles[i];
        }
    }
    var bubbles = [];
    var curCircle = leftmost;
    var dir = new Victor(0, -1);
    var cont = true;
    while(cont){
        var intersect = nextClockwise(curCircle, bigCircles, dir)
        console.log(intersect)
        if(typeof intersect == 'undefined'){
            cont = false;
        }
        else{
            curCircle = intersect.intersectsWith
            var clone = intersect.point.clone()
            dir = clone.subtract(Victor(curCircle.x, curCircle.y))
            if(typeof bubbles[0] !== 'undefined' && curCircle === bubbles[0].circle
                && intersect.point.distance(bubbles[0].intersectionPoint) <.01){
                console.log('SCREEEEEEEEEEEEEEEEEEEEEEEEEEECH')
                cont = false;
            }
            else{
                bubbles.push({
                    circle: curCircle,
                    intersectionPoint: intersect.point
                })
            }

        }

    }
    return bubbles
}
function createBubble(bubbles){
    var arcs = [];
    for(var i = 0; i < bubbles.length; i++){
        var circle = bubbles[i].circle;
        var intersect1 = bubbles[i].intersectionPoint.clone();
        //loop back to 0 at end
        var intersect2 = bubbles[(i + 1) % bubbles.length].intersectionPoint.clone();
        var radius1 = intersect1.clone().subtract(Victor(circle.x, circle.y));
        var radius2 = intersect2.clone().subtract(Victor(circle.x, circle.y));
        var angle1= Math.acos(radius1.dot(Victor(-1,0))/radius1.length());
        var angle2 = Math.acos(radius2.dot(Victor(-1,0))/radius2.length());
        arcs.push({
            center: Victor(circle.x, circle.y),
            startAngle: angle1,
            endAngle : angle2,
            radius : circle.radius
        })
    }
    return arcs;
}
function makePaths(arcs){
    var paths = [];
    var arcGenerator = d3.arc();
    arcs.forEach(function(arc){
        var tempStartAngle = arc.startAngle;
        if(tempStartAngle > arc.endAngle){
            tempStartAngle -= 2*Math.PI
        }
        paths.push({
            d: arcGenerator({
                innerRadius: arc.radius,
                outerRadius: arc.radius,
                startAngle: tempStartAngle,
                endAngle: arc.endAngle
            }),
            transform: "translate(" + arc.center.x + "," + arc.center.y + ")"
        })
    })
    return paths;
}
function nextClockwise(currentCircle, circles, dir){
    var intersections = []
    for(var i = 0; i <circles.length; i++) {
        if (circles[i].name != currentCircle.name && intersects(currentCircle, circles[i])) {
            var ints = get_intersect(currentCircle, circles[i]);
            intersections.push({
                point: ints[0],
                intersectsWith: circles[i]
            })
            intersections.push({
                point: ints[1],
                intersectsWith: circles[i]
            })
        }
    }
        var leastAngle = 10;
        var leastAngleIntersection;
        console.log(intersections)
        for (var i = 0; i < intersections.length; i++) {
            var clone = intersections[i].point.clone()
            var angle = get_angle(dir, clone.subtract(Victor(currentCircle.x, currentCircle.y)))
            console.log(angle)
            if (angle > .0001 && angle < leastAngle) {
                leastAngle = angle
                leastAngleIntersection = intersections[i];
            }
        }
        console.log(leastAngleIntersection)
    return leastAngleIntersection
}

//pretty sure this one is correct
function get_intersect(circle1, circle2) {
    var center1 = new Victor(circle1.x, circle1.y);
    var center2 = new Victor(circle2.x, circle2.y);

    var dist = center1.distance(center2);
    var a = (Math.pow(circle1.radius, 2) - Math.pow(circle2.radius, 2) + Math.pow(dist, 2)) / (2 * dist);
    var h = Math.sqrt(Math.pow(circle1.radius, 2) - Math.pow(a, 2));

    var clone2 = center2.clone();
    var p2 = clone2.subtract(center1).multiply(new Victor(a/dist, a/dist)).add(center1);

    var p3 = new Victor();
    p3.x = p2.x + h * (center2.y - center1.y) / dist;
    p3.y = p2.y - h * (center2.x - center1.x) / dist;

    var p4 = new Victor();
    p4.x = p2.x - h * (center2.y - center1.y) / dist;
    p4.y = p2.y + h * (center2.x - center1.x) / dist;

    var arr = [];
    arr.push(p3);
    arr.push(p4);
    return arr;
}

function get_angle(vec1, vec2) {
    var angle = Math.atan2(vec2.y, vec2.x) - Math.atan2(vec1.y, vec1.x);
    if(angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle;
}

function find_valid_data(node){
    if(node.children.length > 0 && !node.children[0].is_leaf) {
        for(var i = 0; i < node.children.length; i++) {
            find_valid_data(node.children[i]);
        }
        node.valid_data = [];
        for(var i = 0; i < node.children.length; i++) {
            for(var j = 0; j < node.children[i].valid_data.length; j++) {
                node.valid_data.push(node.children[i].valid_data[j]);
            }
        }
    } else {
        node.valid_data = [];
        for(var i = 0; i < node.children.length; i++){
            if(node.children[i].is_valid){
                node.valid_data.push(node.children[i]);
            }
        }
    }
}

function preprocess_tree(node, concat_names, depth) {
    node.full_name = depth==0 ? node.name : concat_names+'.'+node.name;
    node.depth = depth+1;
    if(node.depth == 1)
        node.box = {ll:[0,0], ur:[1,1]};

    if('children' in node)  {
        node.is_leaf = false;
        node.value = 0;
        //node.valid_data = node.children;
        for(var c = 0; c < node.children.length; c++)  {
            node.children[c].parent = node;
            preprocess_tree(node.children[c], node.full_name, node.depth);
        }
    }
    else  {
        node.is_leaf = true;
        node.value = +node.Close;
        node.sum_val = +node.Close;
        node.children = [];
        node.Date = new Date(Date.parse(node.Date));
        if(node.Date.getTime() >= start_date.getTime() && node.Date.getTime() <= end_date.getTime()){
            node.is_valid = true;
        }
        else{
            node.is_valid = false;
        }
        if(isNaN(node.Close)) {
            node.is_valid = false;
        }
    }
}

function aggregate(node) {
    if('valid_data' in node) {
        for(var a = 0; a < node.children.length; a++) {
            aggregate(node.children[a]);
        }
        node.sum_val = 0;
        for(var b = 0; b < node.valid_data.length; b++) {
            node.sum_val += node.valid_data[b].value;
            node.value += node.valid_data[b].value;
        }
        node.value /= node.valid_data.length
    }
}
function find_leftmost(arr){
    var most = arr[0];
    for(var i = 1; i<arr.length; i++){
        if(arr[i].position.y - node.radius < most.position.y -most.radius){
            most = arr[i];
        }
    }
    return most;
}
function get_envelope(node, uncertainty){
    var left_circ = find_leftmost(node.children)
    circ.envelope_radius = circ.radius * (1+uncertainty);

}

function intersects(circ1, circ2){
    var dx = circ1.x -circ2.x;
    var dy = circ1.y - circ2.y;
    var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    return (dist <= (circ1.radius + circ2.radius));
}

/*
function intersection(circ1, circ2){
    var c1= new Victor(circ1.x, circ1.y)
    var c2 = new Victor(circ2.x, circ2.y)
    if(c1.distance(c2) < circ1.radius + circ2.radius){
        return true;
    }

}
function leftmost_intersect(intersections){
    var left = intersections[0]
    for(var i = 1; i<intersections.length; i++){
        if(intersections[i].y < left.y){
            left = intersections[i];
        }
    }
    return left
}*/
