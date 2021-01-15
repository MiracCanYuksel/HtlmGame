const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width=800;
canvas.height=500;

let id, health, score;

class Player {
    constructor(id,x,y,frameX,frameY,speed,moving=false,isAlive=0){
        this.keys = {};
        this.id = id;
        this.x = x;
        this.y = y;
        this.frameX = frameX;
        this.frameY = frameY;
        this.speed = speed;
        this.moving = moving;
        this.width = 32.45;
        this.height = 48.675;
        this.fired={38:false,37:false,39:false,40:false};
        this.then = Date.now();
        this.fireballCooldown=5;
        this.isAlive=isAlive;
    }
    makeMain(){
        let self=this;
        this.isAlive=1;
	id = this.id;
        window.addEventListener("keydown",function(e){
            if(e.keyCode<37 & e.keyCode>40 & !self.isAlive) return;
            if(!self.fired[e.keyCode]){
                self.fired[e.keyCode]=true;
                fetch("/keydown/"+self.id+"/"+e.keyCode, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"key":e.keyCode,
                                        "id":self.id,
                                        "moving":true})
                })
                    .then(response => response.json())
                    .then(data =>{}
                    )
                    .catch(error => console.error('Unable to add item.', error));
        }});
        window.addEventListener("keyup",function(e){
            if(e.keyCode<37 & e.keyCode>40 & !self.isAlive) return;
            if(self.fired[e.keyCode]){
                self.fired[e.keyCode]=false;
                fetch("/keyup/"+self.id+"/"+e.keyCode, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"key":e.keyCode,
                                        "id":self.id,
                                        "moving":false})
                })
                    .then(response => response.json())
                    .then(data =>{}
                    )
                    .catch(error => console.error('Unable to add item.', error));
        }});
        var bound = canvas.getBoundingClientRect();
        canvas.addEventListener("click",function(e){
            if(!self.isAlive) return;
            //console.log(e.x+ " "+ e.y)
            now = Date.now();
            elapsed = now - self.then;
            //var x=e.clientX - bound.left;
            //var y=e.clientY - bound.top;
			var x = e.clientX - (canvas.offsetLeft - window.pageXOffset);
			var y = e.clientY - (canvas.offsetTop - window.pageYOffset);
			//console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqq");
            if(elapsed>self.fireballCooldown){
                self.then=self.fireballCooldown;
                fetch("/fireball/"+self.id+"/"+x+"/"+y, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({"key":e.keyCode,
                                        "id":self.id,
                                        "moving":false})
                })
                    .then(response => response.json())
                    .then(data =>{}
                    )
                    .catch(error => console.error('Unable to add item.', error));
            }
        });
    }
    updatePlayer(keys,x, y, frameX, frameY, speed, moving,isAlive){
        this.keys=keys;
        this.x=x;
        this.y=y;
        this.frameX = frameX;
        this.frameY = frameY;
        this.speed = speed;
        this.moving = moving;
        this.isAlive=isAlive;
    }
    
}


//const player = new Player(6969,150,250,0,0,6,false);
var players=[new Player(0,150,250,0,0,1),new Player(1,700,250,0,0,1)];
var fireballs=[];
//buraya if id exist condition'ı eklicez // aytac
fetch("/newplayer").then(response => response.json())
.then(Mplayer => players[parseInt(Mplayer['id'])].makeMain())
.catch(error => console.error('Unable to get items.', error));


const playerSprite = new Image();
playerSprite.src = "static/img/darthvader.png";
const playerSprite2 = new Image();
playerSprite2.src = "static/img/jedi.png";
const playerSprites=[playerSprite,playerSprite2];
const background = new Image();
background.src = "static/img/tmpBackground.jpg";
const fireballSprite = new Image();
fireballSprite.src = "static/img/fireball.png";
function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH){
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);

}
function drawSpriteFireball(img, sX, sY, sAngle){
    ctx.translate(sX, sY);
    ctx.rotate(Math.PI / 180 * (sAngle + 90));
    ctx.translate(-sX, -sY);
    // ctx.drawImage(img, sX, sY,sAngle);
    ctx.drawImage(img, sX,sY, 20, 20);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawStatus(health, score){
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 275, 50);
    ctx.font = '25px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText("Health: "+health+" \nScore: "+score, 10, 30);
}


let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps){
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    animate()
}

//if player alive condtion eklenecek // aytac
function animate(){
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if(elapsed > fpsInterval){
        then = now - (elapsed % fpsInterval);
        fetch("/player")
                .then(response => response.json())
                .then(data => {
                    data["players"].forEach(d=>{//fireballarda bu 'then'in icine eklenecek //aytac
                    players[parseInt(d.id)].updatePlayer(parseInt(d.keys),
                    parseInt(d.x),parseInt(d.y),parseInt(d.frameX),
                    parseInt(d.frameY), parseInt(d.speed),parseInt(d.moving),parseInt(d.isAlive))
 	            if(parseInt(d.id) == id){health = d.health;score=d.score;}
                });
                data["fireballs"].forEach(d=>{//fireballarda bu 'then'in icine eklenecek //aytac
                fireballs.push({"x":parseFloat(d.x),"y":parseFloat(d.y),"angle":parseFloat(d.angle)})
            });
            })
                .then(()=>{   
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                        drawStatus(health, score);
                        //burada update edilcek bütün objectler // aytac
                        players.forEach(player=>{
                        if(player.isAlive){
                        drawSprite(playerSprites[player.id],  player.width*player.frameX,player.height*player.frameY, player.width, player.height,
                        player.x, player.y, player.width, player.height);}});
                        fireballs.forEach(fireball=>
                            drawSpriteFireball(fireballSprite,fireball.x,fireball.y,fireball.angle));
                        fireballs=[];
                })
                .catch(error => {
                console.error('Unable to get items.5', error);
                requestAnimationFrame(animate);});
    }
}

startAnimating(8);