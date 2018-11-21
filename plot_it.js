//given a ticker object, calculates probability of
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