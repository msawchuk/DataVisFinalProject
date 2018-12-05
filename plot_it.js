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
    var ev = ticker.value
    var deviation = 0;
    for(var i = 0; i<ticker.valid_data.length; i++){
        deviation += Math.pow(ev-ticker.valid_data[i].value, 2);
    }
    ticker.deviation = deviation/ticker.valid_data.length;
    ticker.std_deviation = Math.sqrt(ticker.deviation);
    return Math.sqrt(ticker.deviation);
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
    for(var i = 0; i<price_data.length; i++){
        std_dev(price_data.valid_data[i]);
        deviation_pct(price_data.valid_data[i]);
    }
    remove_leaves(price_data);
    var svg = d3.select('body').append('svg').attr('width', 1000).attr('height', 1000);

    var nodes = [];
    var count = 0;
    category = 0;
    price_data.children.forEach(function(element) {
        element.children.forEach(function(element2) {
            element2.x = Math.cos(category / 3 * 2 * Math.PI) * (400 + 200 * Math.random());
            element2.y = Math.sin(category / 3 * 2 * Math.PI) * (400 + 200 * Math.random());
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


    console.log(price_data);

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
                            console.log(translationVec);
                            //console.log(translationVec);
                            circle1.position = circle1.position.add(translationVec);
                            circle1.velocity = new Victor();
                            initPos = circle2.position;
                            dir = initPos.subtract(initPos1).normalize();
                            translationVec = dir.multiply(new Victor(dist/2, dist/2));
                            console.log(translationVec);
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
    var bigCircles = circles.map(function (d) {
        return Object.assign({}, d)
    });
    bigCircles.forEach(function (circle) {
        circle.r += enlargement;
    });
    var leftmost = bigCircles[0];
    for (var i = 1; i < outerCircs.length; i++) {
        if (bigCircles[i].x - bigCircles[i].r < leftMost.x - leftmost.r) {
            leftmost = bigCircles[i];
        }
    }
    var bubbles = [];
    var curCircle = leftmost;
    var dir = new Victor(0, -1);
    var cont = true;
    while(cont){
        var intersect = nextClockwise(curCircle, bigCircles, dir)
        if(intersect == 'undefined'){
            cont = false;
        }
        else{
            dir = intersection.point.subtract(Victor(curCircle.x, curCircle.y))
            if(bigCircles[0] !== 'undefined' && intersect === bubbles[0] &&
                intersect.intersectionPoint.distance(bubbles[0].intersectionPoint) <.0001){
                cont = false;
            }
            else{
                bubbles.push({
                    circle: curCircle
                    intersectionPoint: intersection.intersectionPoint
                })
            }

        }

    }
    return bubbles
}
function createBubble(rings){
    var arcs = [];
    for(var i = 0; i<rings.length; i++){
        var circle = rings[i].circle
        var intersect1 = outerCircleRing[i].intersectionPoint;
        //loop back to 0 at end
        var intersect2 = outerCircleRing[(i + 1) % outerCircleRing.length].intersectionPoint;
        var radius1 = intersect1.subtract(Victor(circle.x, circle.y))
        var radius2 = intersect2.subtract(Victor(circle.x, circle.y))
        var angle1= Math.acos(radius1.dot(Victor(-1,0))/radius1.length());
        var angle2 = Math.acos(radius2.dot(Victor(-1,0))/radius.length());
        arcs.push({
            center: Victor(circle.x, circle.y),
            startAngle: angle1,
            endAngle : angle2,
            radius : circle.radius
        })
    }
    return arcs
}
function makePaths(arcs){
    var paths = [];
    var arcGenerator = d3.arc()
    arcs.forEach(function(arc){
        var tempStartAngle = arc.startAngle;
        if(tempStartAngle > arc.endAngle){
            tempStartAngle -= 2*Math.PI
        }
        paths.push({
            d: arcGen({
                innerRadius: arc.radius,
                outerRadius: arc.radius,
                startAngle: tempStartAngle,
                endAngle: arc.endAngle
            }),
            transform: "translate(" + arc.center.x + "," + arc.center.y + ")"
        })
    })
}
function nextClockwise(currentCircle, circles, dir){
    var intersections = []

    for(var i = 0; i <circles.length; i++) {
        if (circles[i] !== currentCircle && intersects(circles[i], currentCircle)) {
            var intersections = get_intersect(currentCircle, circles[i]);
            intersections.push({
                point: intersections[0],
                intersectsWith: circles[i]
            })
            intersections.push({
                point: intersections[1],
                intersectsWith: circles[i]
            })
        }
        var leastAngle = 10;
        var leastAngleIntersection;
        for (var i = 0; i < intersections.length; i++) {
            var angle = get_angle(dir, intersections[i].point.subtract(Victor(currentCircle.x, currentCircle.y)))
            if (angle > .0001 && angle < leastAngle) {
                leastAngle = angle
                leastAngleIntersection = intersections[i];
            }
        }
        return leastAngleIntersection
    }
}
/*function forces(circles){
    var constant = 10;
    var forces = [];
    circles.each(function(i) {
        var force = new Victor(0, 0);
        var circle1 = this;
        circles.each(function(d) {
            var circle2 = this;
            var subforce = new Victor(circle2.cx.animVal.value - circle1.cx.animVal.value,
                circle2.cy.animVal.value - circle1.cy.animVal.value);
            subforce = subforce.normalize();
            if(distance(circle1, circle2) > 0) {
                var magnitude = (constant * circle1.r.animVal.value * circle2.r.animVal.value /
                    Math.pow(distance(circle1, circle2), 2));
            } else {
                var magnitude = 0;
            }
            var magVec = new Victor(magnitude, magnitude);
            subforce = subforce.multiply(magVec);
            force.add(subforce);
        })
        forces.push(force);
    })
    var counter = 0;
    circles.each(function(i) {
        var circle1 = this;
        /!*circles.each(function(i) {
           var circle2 = this;
           if(intersecting(circle1, circle2)) {
               var direction = new Victor(circle1.cx.animVal.value - circle2.cx.animVal.value,
                   circle1.cy.animVal.value - circle2.cy.animVal.value);
               direction = direction.normalize();
               var magnitude = ((circle1.r.animVal.value + circle2.r.animVal.value) - distance(circle1, circle2))/10;
               console.log(magnitude);
               var magVec = new Victor(magnitude, magnitude);
               direction = direction.multiply(magVec);
               forces[counter].add(direction);
           }
        });*!/
        d3.select(circle1).attr('cx', function() { return i.x + forces[counter].x})
              .attr('cy', function() { return i.y + forces[counter].y});
        counter++;
    })
}*/

/*function distance(circle1, circle2) {
    return Math.sqrt(Math.pow((circle1.cx.animVal.value - circle2.cx.animVal.value), 2) +
        Math.pow((circle1.cy.animVal.value - circle2.cy.animVal.value), 2));
}*/

/*function intersecting(circle1, circle2) {
    return (distance(circle1, circle2) < (circle1.r.animVal.value + circle2.r.animVal.value));
}*/

/*var packing = d3.pack().size([height, width]).padding(5);
    var packRoot = d3.hierarchy(price_data);
    console.log(packRoot);
    var packNodes = packRoot.descendants();
    packing(packRoot);
    console.log(packNodes);
    var svg = d3.select('body').append('svg').attr('width', 1000).attr('height', 1000);
    svg.append('g').selectAll('circle').data(packNodes).enter().append('circle')
        .attr('cx', d=> d.x)
        .attr('cy', d=> d.y)
        .attr('r', d=> d.r)
        .attr('fill', '#f00')
        .attr('opacity', '.2')
        .attr('id', d=> d.data.name)
        .attr('transform', 'translate(200,200)')
        .attr('class', function(d) {
            if(d.depth == 2) {
                return "leaf";
            } else {
                return "nonleaf";
            }
        });
    console.log(price_data);
    console.log(packing);
    var circles = d3.select('svg').selectAll('.leaf');
    for(var i = 0; i < 1; i++) {
        forces(circles);
    }*/

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
function get_intersect(cur, arr, direction) {
    var intersections = [];

    for (let i = 0; i < arr.length; i++) {
        if (!(cur === arr[i])) {
            if (intersects(arr[i], cur)) {
                var intersectionPoints = intersection(arr[i], cur);
                intersections.push({
                    'point': intersectionPoints[0],
                    'index': i
                });
                intersections.push({
                    'point': intersectionPoints[1],
                    'index': i
                });
            }
        }
    }
    return leftmost_intersect(intersections)
}
function intersects(circ1, circ2){
    var dx = circ1.position.x -circ2.position.x;
    var dy = circ1.position.y - circ2.position.y;
    var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    return (dist <= (circ1.radius + circ2.radius) && (dist >= Math.abs(circ1.radius - circ2.radius)));
}
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
}