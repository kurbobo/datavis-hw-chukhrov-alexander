const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

// Part 1: Создать шкалы для цвета, радиуса и позиции 
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 3 + "," + d_height / 4 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/3)} ${d_height/4})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation();

d3.csv('data/netflix.csv').then(data=>{
    //делаем массив без повторяющихся наименований фильмов, а также без фильмов с отсутствующей оценкой пользователей
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data[0].rating)
    console.log(data)
    
    //список оценок пользователей по каждому фильму
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    console.log(years[5])
    //кол-во сериалов и фильмов, оцененных по каждому из встреченных типов рейтингов 
    //например PG-13, TV-14 и тд
    let age_rating = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    radius.domain([d3.min(rating), d3.max(rating)]);
    color.domain(age_rating);
    x.domain([d3.min(years), d3.max(years)]);

    nodes = [];
    // nodes.length = data.length;
    for (let i = 0; i < data.length; i++) { 
        nodes.push({});
    }
    
    simulation.force('x', d3.forceX().x(function(d,i) {
                        return x(years[i]);
                      }))
                .force('y', d3.forceY().y(function(d) {
                        return 0;
                      }))
                .force('collision', d3.forceCollide().radius(function(d,i) {
                        return radius(rating[i]);
                      }))
                .force('center', d3.forceCenter(b_width/2, b_height/3.5) );

    
    // Part 1 - создать circles на основе data
    var node = bubble
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("fill", (d,i) => color(data[i].rating) )
        .attr("r", (d,i) => radius(rating[i]) )
        .attr('class', (d,i) => data[i].rating)
        .on('mouseover', overBubble)
        .on('mouseout', outOfBubble);
    // добавляем обработчики событий mouseover и mouseout
            // .on('mouseover', overBubble)
            // .on('mouseout', outOfBubble);
    
    simulation.nodes(nodes).on("tick", ticked);

    function ticked(d) {
        node
            .attr("cy", function(d) { return d.y; })
            .attr("cx", function(d) { return d.x; });
    }

    // Part 1 - Создать шаблон при помощи d3.pie() на основе age_rating
    const pie = d3.pie().value(d => d.value);
    
    // Part 1 - Создать генератор арок при помощи d3.arc()
    const arcs = d3.arc()
                .innerRadius(70) // it'll be donut chart
                .outerRadius(150)
                .padAngle(0.02)
                .cornerRadius(5)


    // Part 1 - построить donut chart внутри donut
    donut.selectAll('path')
          .data(pie(age_rating))
          .enter().append('path')
          .attr('d', arcs)
          .attr('fill', d => color(d.data.key))
          .style("opacity", 1)
          .on('mouseover', overArc)
          .on('mouseout', outOfArc);

    // добавляем обработчики событий mouseover и mouseout
        //.on('mouseover', overArc)
        //.on('mouseout', outOfArc);


    function overBubble(d,i) {
        // Part 2 - задать stroke и stroke-width для выделяемого элемента   
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", 2)   

        // Part 3 - обновить содержимое tooltip с использованием классов title и year
        // ..

        // Part 3 - изменить display и позицию tooltip
        d3.select('.tooltip').html(data[i].title+ " <br>"+data[i]['release year'] )
                .style("left", d3.event.pageX + "px")     
                .style("top", (d3.event.pageY - 28) + "px")
                .style('display',"block").style('opacity', 0.95)
                .style('background', "lightsteelblue");
        }
    function outOfBubble(){
        // Part 2 - сбросить stroke и stroke-width
        d3.select(this)
            .style("stroke", "")
            .style("stroke-width", "")
                    
        d3.select('.tooltip').style("display", "none");
        
        }

    function overArc(d, i){

        let rate = age_rating[i].key;

        // Part 2 - изменить содержимое donut_lable
        donut_lable.text(rate);
        // Part 2 - изменить opacity арки
        d3.select(this)
            .style('opacity', 0.6);

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        node.style('opacity', 0.6)
        let chosen = bubble.selectAll('circle[class='+ rate +']')
            .style('opacity', 1)
            .style("stroke", "black");

    }
    function outOfArc(){
        // Part 2 - изменить opacity арки
        d3.select(this)
            .style('opacity', 1);

        // Part 2 - изменить содержимое donut_lable
        donut_lable.text("");
        
        // Part 3 - вернуть opacity, stroke и stroke-width для circles
        node.style('opacity', 1).style("stroke", "");
    }
});