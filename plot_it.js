//given a ticker object, calculates probability of
var start_date;
var end_date;
function probability_density(ticker, val){
    var num = Math.round(val*ticker.children.length);
    return ticker.children[i].avg
}
function expected_value(ticker){
    var sum = 0;
    for(var i = 0; i<ticker.children.length; i++){
        sum += ticker.children[i].avg;
    }
    return sum/ticker.children.length;
}
function std_dev(ticker){
    var ev = expected_value(ticker);
    var deviation = 0;
    for(var i = 0; i<ticker.children.length; i++){
        deviation += Math.power(ev-ticker.children[i].avg, 2);
    }
    return Math.sqrt(deviation);
}
function get_avg_deviation(array){
    for(var i = 0; i < array.length; i++){
        
    }
}

function plot_it() {
    start_date = new Date(2017, 0, 1);
    end_date = new Date(2018, 0, 1);
    console.log(start_date.getTime())
    console.log(end_date)
    preprocess_tree(price_data, '', 0, start_date, end_date);
    //need to change when we add more stuff
    for(var i = 0; i <price_data.children.length; i++){
        find_valid_data(price_data.children[i])
    }
    aggregate(price_data);

    console.log(price_data);
}

function find_valid_data(node){
    node.valid_data = [];
    for(var i = 0; i < node.children.length; i++){
        if(node.children[i].is_valid){
            console.log(node.children[i])
            node.valid_data.push(node.children[i]);
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
        for(var c = 0; c < node.children.length; c++)  {
            node.children[c].parent = node;
            preprocess_tree(node.children[c], node.full_name, node.depth);
        }
    }
    else  {
        node.is_leaf = true;
        node.value = +node.value;
        node.children = [];
        node.Date = new Date(Date.parse(node.Date));
        if(node.Date.getTime() >= start_date.getTime() && node.Date.getTime() <= end_date.getTime()){
            node.is_valid = true;
        }
        else{
            node.is_valid= false;
        }
    }
}

function aggregate(node) {
    if(node.children.length > 0) {
        for(var a = 0; a < node.children.length; a++) {
            aggregate(node.children[a]);
        }
    }
    for(var b = 0; b < node.children.length; b++) {
        node.value += node.children[b].value;
    }
    node.value /= node.children
}