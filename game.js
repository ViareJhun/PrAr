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
	
	tex_path['back1'] = 'img/back1.png';
	tex_path['tori1'] = 'img/tori1.png';
	tex_path['tori2'] = 'img/tori2.png';
	tex_path['tori3'] = 'img/tori3.png';
	
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

var bricks = [];

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
	
	setBricks(0);
	
	game_state = 'game';
}

function setBricks(level)
{
	switch (level)
	{
		case 0:
		{
			for (var i = 0; i < 6; i ++)
			{
				for (var j = 0; j < 7; j ++)
				{
					setBrick(['brick1h'], 58 + 32 + i * 64, 100 + j * 32);
				}
			}
		}
		break;
	}
}


// Main Objects
function CreatePlayer()
{
	this.x = surface.width * 0.5;
	this.y = surface.height * 0.85;
	
	this.half_width = 24;
	this.half_height = 8;
	
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
	
	this.prevx = x;
	this.prevy = y;
	
	this.dir = d90 + choose([-1, 1]) * d45;
	
	this.angle = Math.random() * d360;
	
	this.speed = 5;
	
	this.addx = Math.cos(this.dir) * this.speed;
	this.addy = -Math.sin(this.dir) * this.speed;
	
	this.half_width = 16;
	this.half_height = 16;
	
	
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
		this.angle += 0.1;
		
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
		
		// Bricks Collision
		bricks.forEach(
			(item) =>
			{
				if (
					collide(
						this,
						item,
						this.addx,
						this.addy
					)
				)
				{
					var h = collide(
						this,
						item,
						this.addx,
						0
					);
					
					var v = collide(
						this,
						item,
						0,
						this.addy
					);
					
					/*
					if (h != v)
					{
						this.addx *= -1;
						this.addy *= -1;
					}
					*/
					
					if (h)
					{
						this.addx *= -1;
					}
					
					if (v)
					{
						this.addy *= -1;
					}
					
					item.hp --;
					
					this.x = this.prevx;
					this.y = this.prevy;
				}
			}
		);
		
		this.x += this.addx;
		this.y += this.addy;
		
		this.prevx = this.x;
		this.prevy = this.y;
	};
	
	this.draw = () =>
	{
		context.save();
		context.translate(
			this.x,
			this.y
		);
		
		context.rotate(this.angle);
		
		context.drawImage(
			tex['ball'],
			-this.half_width,
			-this.half_height
		);
		
		context.restore();
	};
}

// Bricks
function setBrick(
	brick,
	x,
	y
)
{
	bricks.push(
		new CreateBrick(
			x,
			y,
			brick
		)
	);
}

function CreateBrick(
	x,
	y,
	imgs
)
{
	this.x = x;
	this.y = y;
	
	this.imgs = imgs;
	
	this.hp = imgs.length;
	
	this.half_width = tex[this.imgs[0]].width * 0.5;
	this.half_height = tex[this.imgs[0]].height * 0.5;
	
	
	this.update = () =>
	{
		this.half_width = tex[this.imgs[0]].width * 0.5;
		this.half_height = tex[this.imgs[0]].height * 0.5;
		
		if (this.hp <= 0)
		{
			return 1;
		}
		
		return 0;
	};
	
	this.draw = () =>
	{
		context.save();
		
		context.translate(
			this.x,
			this.y
		);
		
		if (this.hp > 0)
		{
			context.drawImage(
				tex[this.imgs[this.hp - 1]],
				-this.half_width,
				-this.half_height
			);
		}
		
		context.restore();
	};
}


// Update
function update()
{
	player.update();
	
	ball.update();
	
	bricks.forEach(
		(item) =>
		{
			switch (item.update())
			{
				case 1:
				{
					let num = bricks.indexOf(item);
					delete bricks[num];
					bricks.splice(num, 1);
				}
				break;
			}
		}
	);
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
			
			// back
			context.drawImage(
				tex['back1'],
				bound_x,
				bound_y
			);
			
			context.drawImage(
				tex['tori1'],
				0,
				0
			);
			context.drawImage(
				tex['tori2'],
				bound_x + bound_width,
				0
			);
			context.drawImage(
				tex['tori3'],
				0,
				0
			);
			
			// bounds
			/*
			context.strokeStyle = '#FFFFFF';
			context.strokeRect(
				bound_x,
				bound_y,
				bound_width,
				bound_height
			);
			*/
			
			// bricks
			bricks.forEach(
				(item) =>
				{
					item.draw();
				}
			);
			
			// ball
			ball.draw();
			
			// player
			player.draw();
		}
		break
	}
	
	requestAnimationFrame(paint);
}


// Start
loadTextures();
setScreen();


requestAnimationFrame(paint);