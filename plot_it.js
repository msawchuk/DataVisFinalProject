//given a ticker object, calculates probability of
var start_date;
var end_date;
var width = 500;
var height = 500;
var countToOne = 0;
var scale = d3.scaleLog()
    .domain([0.1,5])
    .range([0,0.8])
function remove_leaves(node){
    if(node.children[0].is_leaf){
        node.children = []
        node.is_leaf = true;
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


    var size_scale = d3.scaleLog()
        .domain([20, 1500])
        .range([10, 80])
    var nodes = [];
    var count = 0;
    category = 0;
    price_data.children.forEach(function(element) {
        element.children.forEach(function(element2) {
            element2.x = Math.cos(category / 3 * 2 * Math.PI) * (250 + 300 * Math.random()) + 400;
            element2.y = Math.sin(category / 3 * 2 * Math.PI) * (150 + 350 * Math.random()) + 400;
            //element2.x = 750 * Math.random();
            //element2.y = 750 * Math.random();
            //element2.radius = element2.value / 10;
            element2.radius = size_scale(element2.value);
            element2.enlargedRadius = element2.radius
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

    forceFunction(price_data, catColors, svg);

    d3


    console.log(price_data);

}
function getCentroid(node, isArr){
    var massSum = 0;
    var centroid = planck.Vec2(0,0);
    if(isArr){
        node.forEach(function(d){
            centroid.x += d.x;
            centroid.y += d.y
        })
        centroid.mul(1/node.length)
    }
    else{
        node.children.forEach(function(d){
            var mass = d.radius*node.enlargement *d.radius*node.enlargement *Math.PI;
            massSum += mass;
            centroid.x += d.x *mass
            centroid.y += d.y *mass
        })
        centroid.mul(1.0/massSum)
    }
    return centroid;

}
function forceFunction(node, colors, svg) {
    for(var i = 0; i < node.children.length; i++) {
        if(!node.children[i].is_leaf) {
            forceFunction(node.children[i], colors, svg);
        }
    }
    var force = d3.forceSimulation(node.children)
        .force("gravity", d3.forceManyBody().strength(600))
        .force("collide", d3.forceCollide(d=>d.radius).iterations(300))
        .force("center", d3.forceCenter(Math.random() * 600 + 100, Math.random() * 600 + 100));
    /*    var t = svg.selectAll('q').data(node.children).enter().append('circle')
            .attr('cx', d=> d.x)
            .attr('cy', d=> d.y)
            .attr('r', d=> d.radius - 4)
            .attr('fill', d=> d3.lab(50 + 0.5*color_scale(d.value),100 - color_scale(d.value),0.5 *color_scale(d.value)))
            .attr('opacity', '.2')
            .attr('category', d=>d.cat)
            .attr('stroke', d=>colors[d.cat])
            .attr('stroke-width', '3')
        var ticked = function() {
            t
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }*/
    force
        .nodes(node.children)
        //.on("tick", ticked)
        .on("end", function() {


            countToOne++
            getLayout(price_data,price_data, svg, countToOne,colors)
            console.log(price_data)
            drawContour(price_data, price_data,svg, countToOne, colors)
        })

}
function drawContour(data_root,root ,svg, count, colors){
    //only execute on last end
    if(countToOne  == data_root.children.length-1) {
        if(!root.children[0].is_leaf){
            for(var i = 0; i<root.children.length; i++){
                drawContour(data_root,root.children[i], svg, count ,colors);
            }
        }
        else{
            root.countourCircles = [];
            for(var i = 0; i<root.children.length; i++){
                root.countourCircles.push({
                    x: root.children[i].x,
                    y: root.children[i].y,
                    radius: root.children[i].radius,
                    name: root.children[i].name
                })
            }
        }
        console.log(root)
        console.log(root.countourCircles)
        var arcdata = createEnvelope(root.countourCircles, root.enlargement);
        console.log(arcdata)
        arcdata.forEach(function(element) {
            var path = d3.path();
            path.arc(element.x, element.y, element.radius, element.startAngle-Math.PI/2, element.endAngle-Math.PI/2, false);
            svg.append('path')
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', '#000')
                .attr('stroke-width', '4')
        })
    }

}
function getLayout(data_root,root ,svg, count, colors) {
    console.log(count)
    if(countToOne  == data_root.children.length -1) {
        console.log(root)
        var adjustedCircles = layoutClusters(root, planck.Vec2(500, 500))
        var nodes = []
        getNodes(root, nodes)
        root.countourCircles = matchCircles(nodes, adjustedCircles);

        //draw leaves
        svg.selectAll('q').data(nodes).enter().append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.radius )
            .attr('fill', d => d3.lab(50 + 0.5 * color_scale(d.value), 100 - color_scale(d.value), 0.5 * color_scale(d.value)))
            .attr('opacity', '.2')
            .attr('category', d => d.cat)
            .attr('stroke', d => colors[d.cat])
            .attr('stroke-width', '3');
    }

}
function getNodes(root, nodes){
    if(!root.is_leaf){
        for(var i = 0; i<root.children.length; i++){
            getNodes(root.children[i], nodes)
        }
    }
    else{
        nodes.push(root);
    }
}
function matchCircles(nodes, circles){
    var newNodes = []
    for(var i = 0; i<nodes.length; i++){
        newNodes.push({
            x: circles[i].x,
            y: circles[i].y,
            radius: circles[i].enlargedRadius,
            name: nodes[i].name
        })
        nodes[i].x = circles[i].x
        nodes[i].y = circles[i].y
    }
    console.log(newNodes)
    return newNodes;
}
function layoutClusters(root, centroid){
    var world = planck.World({
        gravity: planck.Vec2(0,0)
    })
    var clusters = []
    for(var i = 0; i< root.children.length; i++){
        root.children[i].centroid = getCentroid(root.children[i],false)
        clusters.push(createClusterBody(root.children[i], world))
    }
    console.log(clusters)
    console.log(centroid)
    var center = world.createBody(planck.Vec2(centroid.x, centroid.y));
    clusters.forEach(function(cluster) {
        console.log(cluster.getPosition())
        var joint = planck.DistanceJoint( {
                frequencyHz: 0.9,
                dampingRatio: 0.001
            },
            center, center.getPosition(), cluster, cluster.getPosition());
        joint.m_length = 0;
        world.createJoint(joint);
    })
    var step = 1/60.0 //60 fps
    var veliter = 6
    var positer = 2
    for(var i = 0; i< 1000; i++){
        world.step(step, veliter, positer)
    }
    var ret= [];
    for(var body = world.getBodyList(); body; body = body.getNext()){
        for(var fix = body.getFixtureList(); fix; fix = fix.getNext()){
            if(fix.getShape().getType() === planck.Circle.TYPE){
                var center = body.getWorldPoint(fix.getShape().getCenter())
                console.log(center.x)
                var radius= (fix.getShape().getRadius())
                console.log(radius)
                //goes in reverse order
                ret.push({
                    x: center.x,
                    y: center.y,
                    enlargedRadius: radius+10
                })

            }
        }
    }
    //puts stuff in order
    ret.reverse();
    return ret;
}
function createClusterBody(cluster, world){
    console.log(cluster)
    var body = world.createDynamicBody(cluster.centroid);
    var circFD ={
        density: 1,
        friction: .0001
    }
    console.log(cluster.centroid)
    for(var i = 0; i <cluster.children.length; i++){
        var globalCenter = planck.Vec2(cluster.children[i].x, cluster.children[i].y);
        var localCenter = globalCenter.sub(cluster.centroid);
        console.log( cluster.enlargement)
        console.log(cluster.children[i])
        // var fixture = body.createFixture(planck.Circle(localCenter, cluster.children[i].radius *cluster.enlargement), circFD);
        body.createFixture(planck.Circle(localCenter,  cluster.children[i].radius *(1+scale(cluster.enlargement)) + 10), circFD);

    }
    console.log(body)
    return body
}
function createEnvelope(nodes, enlargement) {
    enlargement = scale(enlargement);
    console.log(enlargement)
    var bubbles =  getOuterCircle(nodes, enlargement);
    console.log(bubbles)
    return createBubble(bubbles);

}


/*function getCat(data, catNum) {
    var arr = [];
    data.forEach(function(element) {
        if(element.cat <= catNum) {
            arr.push(element);
        }
    })
    return arr;
}*/

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



function getOuterCircle(nodes, enlargement){
    //get deep copy
    var bigCircles = nodes;
    console.log(bigCircles)
    bigCircles.forEach(function (circle) {
        circle.radius += enlargement*circle.radius;
    });
    var leftmost = getLeftmost(bigCircles);
    for (var i = 1; i < bigCircles.length; i++) {
        if (bigCircles[i].x - bigCircles[i].radius < leftmost.x - leftmost.radius) {
            leftmost = bigCircles[i];
        }
    }
    console.log(leftmost)
    var bubbles = [];
    var curCircle = leftmost;
    var dir = new Victor(-1,0);
    var cont = true;
    while(cont){
        var intersect = nextClockwise(curCircle, bigCircles, dir)
        console.log(intersect)
        if(typeof intersect == 'undefined'){
            cont = false;
        }
        else{
            curCircle = intersect.intersectsWith
            dir = intersect.point.clone().subtract(Victor(curCircle.x, curCircle.y))
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
function getLeftmost(circles) {
    left = circles[0]
    circles.forEach(function(element) {
        if(element.x - element.radius < left.x - left.radius) {
            left = element;
        }
    })
    return left;
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
        var angle1 = get_angle(new Victor(0,-1), radius1);
        var angle2 = get_angle(new Victor(0,-1), radius2);
        arcs.push({
            x: circle.x,
            y: circle.y,
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
    node.height = 4-node.depth;
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
