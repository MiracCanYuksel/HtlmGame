import time, queue, math, logging
from datetime import datetime
from threading import Thread, Event
from flask import Flask, request, render_template, jsonify

class Fireball:
    def __init__(self,pId,pX,pY,mX,mY):
        
        myradians = math.atan2(mY-pY+10, mX-pX+10)

        self.degrees = myradians
        self.playerId=pId
        self.x=pX+20# fireball karakterin gerisinden gelmesin diye +20
        self.y=pY+10
        self.vx=math.cos(self.degrees)
        self.vy=math.sin(self.degrees)
        self.speed=20
        self.damage=100

    def updatePosition(self):
        self.x+=self.vx*self.speed
        self.y+=self.vy*self.speed
        if(self.x<=0):
            threadList[self.playerId].player.fireballs.remove(self)
        elif(self.x>=800-32.45):
            threadList[self.playerId].player.fireballs.remove(self)
        elif(self.y<=0):
            threadList[self.playerId].player.fireballs.remove(self)
        elif(self.y>=500-48.675):
            threadList[self.playerId].player.fireballs.remove(self)

    def checkCollision(self):
        if self.playerId == 0:
            dist = math.hypot(self.x-thread2.player.x, self.y-thread2.player.y)
        else:
            dist = math.hypot(self.x-thread.player.x, self.y-thread.player.y)
        #return dist <= (r0 + r1)
        if(dist<=50):
            if (self.playerId==0):
                threadList[1].interrupt_queue.put({"type":"getDmg","Dmg":self.damage})
            else:
                threadList[0].interrupt_queue.put({"type":"getDmg","Dmg":self.damage})
            
            threadList[self.playerId].player.fireballs.remove(self)
        #print(dist <= 40)
    
    def getObject(self):
        return {"x":self.x,"y":self.y,"angle":math.degrees(self.degrees)+270}

class Player:
    def __init__(self,id, x, y, frameX, frameY, speed,health=100, moving=False,isAlive=0):
        self.keys = {}
        self.id = id
        self.x = x
        self.y = y
        self.frameX = frameX
        self.frameY = frameY
        self.speed = speed
        self.moving = moving
        self.fireballs=[]
        self.isAlive=isAlive
        self.health=health

    def keyDown(self,keyCode):
        print("keydown")
        self.keys[keyCode]=True
        self.moving = True
    
    def keyUp(self,keyCode):
        print("keyup")
        del self.keys[keyCode]
        self.moving = False
    
    def update(self):
        if (self.keys.get(38,False) and self.y> 0):
            self.y -= self.speed
            self.frameY=3
            self.moving=True
        
        if (self.keys.get(37,False) and self.x >0):
            self.x -= self.speed
            self.frameY=1
            self.moving=True
        
        if(self.keys.get(40,False) and self.y <500-48.675):
            self.y += self.speed
            self.frameY=0
            self.moving=True
        
        if(self.keys.get(39,False) and self.x <800-32.45):
            self.x += self.speed
            self.frameY=2
            self.moving=True
        
    def  handlePlayerFrame(self):
        if(self.frameX< 3 and self.moving==True): self.frameX+=1
        else: self.frameX=0

    def handleFireballs(self):
        for fireball in self.fireballs:
            fireball.updatePosition()
            fireball.checkCollision()
    
    def spawnFireball(self,mX,mY):
        self.fireballs.append(Fireball(self.id,self.x,self.y,mX,mY))
    
    def getDmged(self,dmg):
        self.health-=dmg
        if (self.health<=0):
            self.isAlive=0

    def getPlayerJsonify(self):
        return {'id': self.id, 'x': self.x,  'y': self.y, 'frameX': self.frameX, 'frameY': self.frameY, 'speed': self.speed,'isAlive':self.isAlive}

class LoopThread(Thread):
    def __init__(self):
        self.stop_event = Event()
        self.interrupt_queue = queue.Queue()
        self.player=Player(700,150,250,0,0,1)
        self.fpsInterval = 125
        dt = datetime.now()
        self.then = int(round(dt.timestamp() * 1000))
        Thread.__init__(self)

    def run(self):
        while not self.stop_event.is_set():  
            self.process_interrupts()
            self.loop_process()
            
    def loop_process(self):
        dt = datetime.now()
        now = int(round(dt.timestamp() * 1000))
        elapsed = now - self.then
        if(elapsed > self.fpsInterval):
            self.then = now - (elapsed % self.fpsInterval)
            self.player.update()
            self.player.handlePlayerFrame()
            self.player.handleFireballs()
    
    def process_interrupts(self):
        try:
            interrupt = self.interrupt_queue.get_nowait()
            if interrupt["type"]=="key":
                self.process_single_interrupt(interrupt)
            elif interrupt["type"]=="fireball":
                self.process_single_interrupt2(interrupt)
            elif interrupt["type"]=="getDmg":
                self.process_single_interrupt3(interrupt)
        except queue.Empty:
            pass
    
    def process_single_interrupt(self, interrupt):
        if interrupt["moving"] ==True:
            self.player.keyDown(int(interrupt["key"]))
        else:
            self.player.keyUp(int(interrupt["key"]))

    def process_single_interrupt2(self, interrupt):
        self.player.spawnFireball(int(interrupt["x"]),int(interrupt["y"]))
    
    def process_single_interrupt3(self, interrupt):
        self.player.getDmged(interrupt["Dmg"])

#log = logging.getLogger('werkzeug')
#log.disabled = True

thread = LoopThread()
thread.player=Player(0,150,250,0,0,5)
thread2 = LoopThread()
thread2.player=Player(1,700,250,0,0,5)
playerCounter=0
threadList=[thread,thread2]
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route("/interrupt/press/<key>")
def interrupt1(key):
    thread.interrupt_queue.put(key)
    return "OK", 200

@app.route("/interrupt/release/<key>")
def interrupt2(key):
    thread.interrupt_queue.put(key)
    return "OK", 200

@app.route("/status")
def interrupt4():
    #thread.interrupt_queue.put("status")
    objects = [{'x': thread.player.x, 'y': thread.player.y}]
    return jsonify(objects) 

@app.route("/shutdown")
def shutdown():
    thread.stop_event.set()
    thread.join()
    return "OK", 200

@app.route("/keydown/<int:id>/<int:key>", methods=['PUT'])
def keydown(id,key):
    data ={"type":"key","id":id,"key":key,"moving":True}
    threadList[id].interrupt_queue.put(data)
    return {"id":5}

@app.route("/keyup/<int:id>/<int:key>", methods=['PUT'])
def keyup(id,key):
    data ={"type":"key","id":id,"key":key,"moving":False}
    threadList[id].interrupt_queue.put(data)
    return {"id":5}

@app.route("/fireball/<int:id>/<int:x>/<int:y>", methods=['PUT'])
def fireball(id,x,y):
    data ={"type":"fireball","id":id,"x":x,"y":y}
    threadList[id].interrupt_queue.put(data)
    return {"id":5}

@app.route("/newplayer", methods=['GET'])
def start():
    global playerCounter
    if(playerCounter<2):
        playerCounter+=1
        threadList[playerCounter-1].start()
        threadList[playerCounter-1].player.isAlive=1
        return jsonify(threadList[playerCounter-1].player.getPlayerJsonify())
    return jsonify({'id':-1})

@app.route("/player", methods=['GET'])
def getStat():
    #fireballar dict'e eklenecek "attack" diye // aytac 
    getPlayers={"players":[threadList[0].player.getPlayerJsonify(),threadList[1].player.getPlayerJsonify()],
    "fireballs":[*[fireball.getObject() for fireball in threadList[0].player.fireballs],*[fireball.getObject() for fireball in threadList[1].player.fireballs]]}
    return jsonify(getPlayers)

if __name__ == '__main__':
    app.run()
