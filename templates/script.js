const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width=800;
canvas.height=500;



class Player {
    constructor(id,x,y,frameX,frameY,speed,moving=false){
        this.keys = [];
        this.id = id;
        this.x = x;
        this.y = y;
        this.frameX = frameX;
        this.frameY = frameY;
        this.speed = speed;
        this.moving = moving;
        this.width = 32.45;
        this.height = 48.675;
        let self=this;
        window.addEventListener("keydown",function(e){
            self.keys[e.keyCode]=true;
            self.moving=true;
        });
           
        window.addEventListener("keyup",function(e){
            delete self.keys[e.keyCode];
            self.moving=false;
        });
        /*
        window.addEventListener("keydown",function(e){
            fetch("/keydown/id", {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"key":e.keyCode,
            "moving":true})
            })
                .then(response => response.json())
                .then(data =>
                    console.log(data)
                )
                .catch(error => console.error('Unable to add item.', error));
        });
           
        window.addEventListener("keyup",function(e){
            fetch("/keyup/id", {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"key":e.keyCode,
            "moving":false})
            })
                .then(response => response.json())
                .then(data =>
                    console.log(data)
                )
                .catch(error => console.error('Unable to add item.', error));
        });*/
    }


    updatePlayer(keys,x, y, frameX, frameY, speed, moving){
        this.keys=keys;
        this.x=x;
        this.y=y;
        this.frameX = frameX;
        this.frameY = frameY;
        this.speed = speed;
        this.moving = moving;
    }

    movePlayer(){
        if(this.keys[38] && this.y> 0){
            this.y -= this.speed;
            this.frameY=3;
            this.moving=true;
        }
        if(this.keys[37] && this.x >0 ){
            this.x -= this.speed;
            this.frameY=1;
            this.moving=true;
        }
        if(this.keys[40] && this.y <canvas.height-this.height){
            this.y += this.speed;
            this.frameY=0;
            this.moving=true;
        }
        if(this.keys[39] && this.x <canvas.width-this.width ){
            this.x += this.speed;
            this.frameY=2;
            this.moving=true;
        }
    }

    handlePlayerFrame(){
        if(this.frameX< 3 && this.moving==true) this.frameX++;
        else this.frameX=0;
    }
}

//const player = new Player(6969,150,250,0,0,6,false);

const player=fetch("/newplayer")
            .then(response => response.json())
            .then(player => new Player(
                parseInt(player.id),parseInt(player.x), 
                parseInt(player.y),parseInt(player.frameX), 
                parseInt(player.frameY), parseInt(player.speed)
                ))
            .catch(error => console.error('Unable to get items.', error));

 
const playerSprite = new Image();
playerSprite.src = "darthvader.png";
const background = new Image();
background.src = "tmpBackground.jpg";

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH){
    ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);

}



let fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps){
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    animate()
}

function animate(){
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if(elapsed > fpsInterval){
        then = now - (elapsed % fpsInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        drawSprite(playerSprite,  player.width*player.frameX,player.height*player.frameY, player.width, player.height,
        player.x, player.y, player.width, player.height);
        player.movePlayer();
        player.handlePlayerFrame();
    }
}
/*
function animate(){
    fetch("/player/"+player.id)
            .then(response => response.json())
            .then(data => {
                player.updatePlayer(data.keys,data.x,data.y,data.frameX, data.frameY, data.speed,data.moving)
            })
            .then(()=>{
                requestAnimationFrame(animate);
                now = Date.now();
                elapsed = now - then;
                if(elapsed > fpsInterval){
                    then = now - (elapsed % fpsInterval);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                    drawSprite(playerSprite,  player.width*player.frameX,player.height*player.frameY, player.width, player.height,
                    player.x, player.y, player.width, player.height);
                    player.movePlayer();
                    player.handlePlayerFrame();
                }
            })
            .catch(error => {
             console.error('Unable to get items.', error);
             requestAnimationFrame(animate);});
  
}
*/
startAnimating(20);