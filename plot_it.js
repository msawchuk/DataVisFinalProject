//given a ticker object, calculates probability of
var start_date;
var end_date;


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
    //need to change when we add more stuff
    for(var i = 0; i <price_data.children.length; i++){
        find_valid_data(price_data.children[i]);
    }
    aggregate(price_data);
    for(var i = 0; i<price_data.valid_data.length; i++){
        std_dev(price_data.valid_data[i]);
        deviation_pct(price_data.valid_data[i]);
    }
    console.log(price_data)
}

function find_valid_data(node){
    node.valid_data = [];
    for(var i = 0; i < node.children.length; i++){
        if(node.children[i].is_valid){
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
        node.valid_data = node.children;
        for(var c = 0; c < node.children.length; c++)  {
            node.children[c].parent = node;
            preprocess_tree(node.children[c], node.full_name, node.depth);
        }
    }
    else  {
        node.is_leaf = true;
        node.value = +node.Close;
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
    if('valid_data' in node) {
        for(var a = 0; a < node.valid_data.length; a++) {
            aggregate(node.valid_data[a]);
        }
        for(var b = 0; b < node.valid_data.length; b++) {
            node.value += node.valid_data[b].value;
        }
        node.value /= node.valid_data.length
    }
}