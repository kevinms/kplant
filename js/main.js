/*
// Simple Tree:
S:A
A:[-A][-A]

// Christmas Tree:
S:a
a:[---y][+++x]b
b:[---y][+++x]c
c:[---y][+++x]d
d:[---y][+++x]e
e:[---y][+++x]f
f:[---y][+++x]g
g:[-g][+g]
y:-------------[-z][+z]y
x:+++++++++++++[-z][+z]x


// Fractal Plant:
S:B-[[S]+S]+B[+BS]-S
B:BB
*/
var k_start = 'S';   // axiom symbol
var k_dla = 0.5;     // left angle delta
var k_dra = 0.5;     // right angle delta
var k_dl = 0.8;      // length delta
var k_l = 10;       // current length
var k_s = {x:420,y:600,a:0,p:k_seed}; // current state (position, angle)
var k_rules = {};    // set of production k_rules
var k_stack = [];    // state history
var k_b = [];        // array of branch data
var k_maxdepth = 4; // maximum variable depth
var k_seed = {x:420,y:600,a:0,p:k_seed,d:0}

function l_parse() {
	var error = false;

	// parse
	var raw = document.getElementById("ruleset").value;
	raw = raw.split(' ').join('').split('\n');
	for(i in raw) {
		if(raw[i]) {
			if(raw[i].indexOf(':') != -1) {
				var r = raw[i].split(':');
				if(r[0]) // the value can be undefined
					k_rules[r[0][0]] = r[1];
				else
					error = true;
			} else
				error = true;
		}
	}

	// validate
	if(!(k_start in k_rules))
		error = true;

	console.log(k_rules);

	if(error) {
		d3.select('#input-status').html("!");
		d3.select('#input-status').classed("alert-success", false);
		d3.select('#input-status').classed("alert-danger", true);
	} else {
		d3.select('#input-status').html("&#x2713;");
		d3.select('#input-status').classed("alert-danger", false);
		d3.select('#input-status').classed("alert-success", true);
	}
}

function step(len) {
	k_s.x = k_s.x - len * Math.sin(k_s.a);
	k_s.y = k_s.y - len * Math.cos(k_s.a);
}

function l_evaluate(r, parent, depth) {
	if(depth > k_maxdepth)
		return;

	var len = k_l * Math.pow(0.75,depth)

	for(i in r) {
		if(r[i] == '+') {
			k_s.a -= k_dra;
		} else if(r[i] == '-') {
			k_s.a += k_dra;
		} else if(r[i] == '[') {
			k_s.p = parent;
			k_stack.push($.extend({}, k_s));
		} else if(r[i] == ']') {
			k_s = k_stack.pop();
			parent = k_s.p;
		} else {
			step(len);
			b = {
				x: k_s.x,
				y: k_s.y,
				a: k_s.a,
				p: parent,
				d: depth
			};
			k_b.push(b);
			parent = b;
			if(r[i] in k_rules)
				l_evaluate(k_rules[r[i]], b, depth+1);
		}
	}
}

function l_init() {
	k_s = {x:420,y:600,a:0,p:k_seed};
	k_b = [];
	k_rules = {};
	k_stack = [];
	k_l = 10;
}

function l_generate() {
	l_init();
	l_parse();
	l_evaluate(k_rules[k_start], k_seed, 0);
	l_draw();
}

function l_draw() {

	console.log(k_b);

	d3.select('svg')
		.selectAll('line')
		.remove();

	d3.select('svg')
		.selectAll('line')
		.data(k_b)
		.enter()
		.append('line')
		.attr('x1', function(d) {return d.x;})
		.attr('y1', function(d) {return d.y;})
		.attr('x2', function(d) {return d.p.x;})
		.attr('y2', function(d) {return d.p.y;})
		.style('stroke-width', function(d) {return parseInt(k_maxdepth + 1 - d.d) + 'px';})
}


d3.select('#ruleset')
	.on('keyup', l_generate);

