// Graphics
var surface = document.getElementById('surface');
var context = surface.getContext('2d');

// Utils
const d90 = Math.PI * 0.5;
const d45 = Math.PI * 0.25;
const d180 = Math.PI;
const d360 = Math.PI * 2;

function irandom(val)
{
	return Math.floor(Math.random() * val);
}

function choose(arr)
{
	return arr[irandom(arr.length)];
}

function collide(o1, o2, x, y)
{
	return (
		o1.x - o1.half_width + x < o2.x + o2.half_width &&
		o1.x + o1.half_width + x > o2.x - o2.half_width &&
		o1.y - o1.half_height + y < o2.y + o2.half_height &&
		o1.y + o1.half_height + y > o2.y - o2.half_height
	);
}

// Res
var loaded = 0;
var load_max = 0;
var load_value = 0;

var tex_path = [];
var tex = [];

function loadTextures()
{
	tex_path['ball'] = 'img/ball.png';
	tex_path['brick1h'] = 'img/brick1h.png';
	
	Object.keys(tex_path).forEach(
		(key) =>
		{
			tex[key] = new Image();
			tex[key].src = tex_path[key];
			tex[key].onload = () =>
			{
				load_value ++;
			};
		}
	);
	
	load_max += tex.length;
}


// Set Screen
var asp = 1;
var xoffset = 0;
var yoffset = 0;

function setScreen()
{
	asp = innerHeight / surface.height;
	var vw = surface.width * asp;
	var vh = surface.height * asp;
	xoffset = (innerWidth - vw) * 0.5;
	
	if (vw > innerWidth)
	{
		asp = innerWidth / surface.width;
		var vw = surface.width * asp;
		var vh = surface.height * asp;
		
		xoffset = 0;
		yoffset = (innerHeight - vh) * 0.5;
	}
	
	surface.style.width = vw + 'px';
	surface.style.height = vh + 'py';
	
	surface.style.top = yoffset;
	surface.style.left = xoffset;
	surface.style.position = 'fixed';
}


// Input
var mouse_x = 0;
var mouse_y = 0;

addEventListener(
	'mousemove',
	(e) =>
	{
		mouse_x = (e.clientX - xoffset) / asp;
		mouse_y = (e.clientY - yoffset) / asp;
	}
);

addEventListener(
	'mousedown',
	(e) =>
	{
		if (e.which == 1)
		{
			mouse_check = 1;
		}
	}
);

addEventListener(
	'mouseup',
	(e) =>
	{
		if (e.which == 1)
		{
			mouse_check = 0;
		}
	}
);

addEventListener(
	'touchmove',
	function (e)
	{
		mouse_x = (e.changedTouches[0].clientX - xoffset) / asp;
		mouse_y = (e.changedTouches[0].clientY - yoffset) / asp;
	}
)

addEventListener(
	'touchstart',
	function (e)
	{
		mouse_check = 1
		
		mouse_x = (e.changedTouches[0].clientX - xoffset) / asp;
		mouse_y = (e.changedTouches[0].clientY - yoffset) / asp;
	}
)

addEventListener(
	'touchend',
	function (e)
	{
		mouse_check = 0;
	}
)


// Game
var game_state = 'loading';

var player = null;
var ball = null;

var bound_x = 50;
var bound_y = 50;
var bound_width = 400;
var bound_height = 700;

function gotoLevel()
{
	player = new CreatePlayer();
	ball = new CreateBall(
		player.x,
		player.y - 64
	);
	game_state = 'game';
}


// Main Objects
function CreatePlayer()
{
	this.x = surface.width * 0.5;
	this.y = surface.height * 0.85;
	
	this.half_width = 32;
	this.half_height = 10;
	
	this.type = 'player';
	
	
	this.update = () =>
	{
		this.x += (
			mouse_x - this.x
		) * 0.25;
		
		this.x = Math.min(
			bound_x + bound_width - this.half_width,
			Math.max(
				bound_x + this.half_width,
				this.x
			)
		);
	};
	
	this.draw = () =>
	{
		context.save();
		context.translate(
			this.x,
			this.y
		);
		
		context.fillStyle = '#FFFFFF';
		context.fillRect(
			-this.half_width,
			-this.half_height,
			this.half_width * 2,
			this.half_height * 2
		);
		
		context.restore();
	};
}

function CreateBall(x, y)
{
	this.x = x;
	this.y = y;
	
	this.angle = d90 + choose([-1, 1]) * d45;
	
	this.speed = 6;
	
	this.addx = Math.cos(this.angle) * this.speed;
	this.addy = -Math.sin(this.angle) * this.speed;
	
	this.half_width = 8;
	this.half_height = 8;
	
	
	this.checkPlace = (x, y) =>
	{
		if (
			collide(
				this,
				player,
				x,
				y
			)
		)
		{
			return player;
		}
		
		return null;
	};
	
	this.update = () =>
	{
		this.x += this.addx;
		this.y += this.addy;
		
		// Bound Collision
		if (
			this.x - this.half_width < bound_x ||
			this.x + this.half_width > bound_x + bound_width
		)
		{
			this.addx *= -1;
		}
		
		if (
			this.y - this.half_height < bound_y ||
			this.y + this.half_height > bound_y + bound_height
		)
		{
			this.addy *= -1;
		}
		
		// Player Collision
		if (
			collide(
				this,
				player,
				0,
				0
			)
		)
		{
			this.addy *= -1;
			
			this.y = player.y - player.half_height - this.half_height;
		}
	};
	
	this.draw = () =>
	{
		context.save();
		context.translate(
			this.x,
			this.y
		);
		
		context.fillStyle = '#FFFFFF';
		context.fillRect(
			-this.half_width,
			-this.half_height,
			this.half_width * 2,
			this.half_height * 2
		);
		
		context.restore();
	};
}

function CreateBrick(
	x,
	y,
	img
)
{
	this.x = x;
	this.y = y;
	
	this.half_width = tex[img].width * 0.5;
	this.half_height = tex[img].height * 0.5;
}


// Update
function update()
{
	player.update();
	
	ball.update();
}


// Draw
function paint()
{
	if (game_state != 'loading')
	{
		update();
	}
	
	switch (game_state)
	{
		case 'loading':
		{
			context.fillStyle = '#000000';
			context.fillRect(
				0,
				0,
				surface.width,
				surface.height
			);
			
			if (load_value == load_max)
			{
				gotoLevel();
			}
		}
		break
		
		case 'game':
		{
			// clear
			context.fillStyle = '#000000';
			context.fillRect(
				0,
				0,
				surface.width,
				surface.height
			);
			
			// bounds
			context.strokeStyle = '#FFFFFF';
			context.strokeRect(
				bound_x,
				bound_y,
				bound_width,
				bound_height
			);
			
			// player
			player.draw();
			
			// ball
			ball.draw();
		}
		break
	}
	
	requestAnimationFrame(paint);
}


// Start
loadTextures();
setScreen();


requestAnimationFrame(paint);