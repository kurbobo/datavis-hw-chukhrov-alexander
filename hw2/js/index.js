const g = document.querySelector('g');
const circle = document.querySelector('circle');


let angle = 0;

const x = circle.getAttribute('cx');
const y = circle.getAttribute('cy');

setInterval(() => {
	g.setAttribute('transform', 'rotate('+ angle++ +' ' + x + ' ' + y + ')');
}, 100);