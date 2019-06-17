let ctx, tiles = [],moves = [], times = []
let timer = NaN, startTime = NaN
let elapsed = 0,bgimage
let mouseX = null,mouseY =null,mouseUpX = null,mouseUpY = null
let chains
let score
let endFlag = false
let image
const GAME_TIME = 70
const BLOCK_WIDTH = 6
const BLOCK_HIGHT = 6
const BLOCK_SIZE = 82
const BLOCK_SPAN = 84
function rand(v){
    return Math.floor(Math.random()*v)
}

function iterate(f){
    for(let x = 0;x<BLOCK_WIDTH;x++){
        for(let y = 0;y<BLOCK_HIGHT;y++){
            f(x,y,tiles[x][y])
        }
    }
}

function tile(x,y){
    this.x = x
    this.y = y
    this.px = x
    this.yp = y
    this.count = 0
    this.getX = function(){
        return this.x
    }
    this.getY = function(){
        return this.y
    }
    this.move = function(px,py,color){
        this.px = px
        this.py = py
        this.color = color
        moves.push(this)
    }
}

function chain(){
    this.chaincount = 0
    this.plusChain = function(){
        this.chaincount++
    }
    this.getChaincount = function(){
        return this.chaincount
    }
    this.chainText = function(){
        ctx.fillStyle = "rgba(220,133,30,255)"
        ctx.font = "bold 30px sans-serif"
        ctx.fillText(this.chaincount+"チェイン！！",680,520)
    }
    this.chainTime = function(mIndex){
        ctx.fillStyle = "rgba(220,133,30,255)"
        ctx.fillRect(600,550,mIndex*1,10)
    }
}

function scorer(){
    this.message = ["","good","very good","super","wondeful!","great!!","amazing","OMO!","やってんねぇ!!"]
    this.hiScore
    this.score = 0
    this.mCount = 0
    this.mIndex = 0
    this.cookie = new cooker() 
    this.recast = function(){
        this.mCount = Math.max(0,this.mCount -1)
        if(this.mCount === 0){
            this.mIndex = 0
        }
    }
    this.plusScore = function(s){
        this.mIndex = Math.min(this.message.length-1,this.mIndex + 1)
        this.mCount = 100
        this.score += s * 10 + this.mIndex * s * 100
    }
    this.getScore = function(){
        return this.score
    }
    this.lordHiScore = function(){
        let str = this.cookie.load()
        if(str.indexOf("HISCORE") != -1){
            str = str.split( '; ' )[ 0 ].split( '=' )[ 1 ];
        }else{
            str="0"
        }
        this.hiScore= parseInt(str,10)
    }
    this.writeHisocre = function(){
        let tomorrw = new Date()
        tomorrw.setDate(new Date().getDate() + 1 )
        this.cookie.setExpires(tomorrw.toUTCString())
        let str = this.cookie.createCookieString("HISCORE",this.score)
        this.cookie.write(str)
    }
    this.scoreText = function(){
        ctx.font = "bold 80px sans-serif"
        ctx.fillStyle = "rgba(255,255,255," + (this.mCount / 50) + ")"
        ctx.fillText(this.message[this.mIndex],300,300)

        ctx.fillStyle = "rgba(220,133,30,50)"
        ctx.font = "bold 30px sans-serif"
        ctx.fillText("HISCORE",650,70)
        ctx.fillText(("000000"+this.hiScore).slice(-7),720,100)

        ctx.fillStyle = "rgba(220,133,30,50)"
        ctx.font = "bold 50px sans-serif"
        ctx.fillText(("000000"+this.score).slice(-7),680,170)
    }
    this.getMCount = function(){
        return this.mCount
    }
}

function cooker(){
    this.expires = ""
    this.load = function(){
        return document.cookie
    }
    this.write = function(str){
        document.cookie = str;
    }
    this.createCookieString = function(key, val){
        return (key + "=" + val + this.expires)
    }
    this.setExpires = function(date){
        this.expires = "; expires="+date
    }
}

function imager(){
    this.images = []
    this.loadImage = function(){
        this.images = [block0,block1,block2,block3,block4]
    }
    this.drawImage = function(){
        for(let x = 0;x<BLOCK_WIDTH;x++){
            for(let y = 0;y<BLOCK_HIGHT;y++){
                if(!tiles[x][y].remove){
                    ctx.drawImage(this.images[tiles[x][y].color]
                        ,tiles[x][y].getX() * BLOCK_SPAN + 34, tiles[x][y].getY() * BLOCK_SPAN + 36,BLOCK_SIZE,BLOCK_SIZE)
                }
            }
        }
    }
    this.drawBackground = function(){
        ctx.drawImage(bgimage , 0, 0,800,600)
    }
}

function htmlBuilder(){
    this.path = "./image/nijisanji/"
    this.buildImg = function(){
        for(let i = 0 ; i <5;i++){
            this.appendTag("div#img","<img id='block"+ i +"' src='"+this.path+i+".png' style='display: none'></img>")
        }
    }
    this.buildRanking = function(){
        let str = []
        $.get("./ranking.txt", function(data){
            for(let i = 0;i<data.length;i++){
                str.push(data[i])
            }
            //str = data
        })
        console.log(str)
    }
    this.appendTag = function(tag,str){
        $(tag).append(str)
    }
}

function init(){
    for(let x =0;x<BLOCK_WIDTH;x++){
        tiles[x] = []
        for(let y = 0;y<BLOCK_HIGHT;y++){
            tiles[x][y] = new tile(x,y)
        }
    }
    iterate(function(x,y,t){
        while(true){
            let r = rand(5)
            if(setColor(x,y,r)){
                t.color = r
                break
            }
        }
    })
    
    for(let i = 0;i<15;i++){
        let t = document.createElement("img")
        t.src = "./image/time" + i +".png"
        times.push(t)
    }

    bgimage =document.getElementById("bgimage")
    let canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")
    ctx.textAlign = "center"
    
    chains = new chain()
    score = new scorer()
    score.lordHiScore()
    
    let htmler = new htmlBuilder()
    htmler.buildImg() 
    htmler.buildRanking()

    image = new imager()
    image.loadImage()

    repaint()
}

function go(){
    let canvas = document.getElementById("canvas")
    canvas.onmousedown = mymousedown
    canvas.onmouseup = mymouseup
    canvas.addEventListener("touchstart",mymousedown)
    canvas.addEventListener("touchmove", mymousemove)
    canvas.addEventListener("touchend",mymouseup)

    startTime = new Date()
    timer = setInterval(tick,25)

    document.getElementById("START").style.display = "none"
}

function tick(){
    score.recast()
    if(moves.length > 0){
        let s = removeTile()
        if(s > 0){
            score.plusScore(s)
            chains.plusChain()
        }
        fall()
    }
    elapsed = ((new Date()).getTime() -startTime) /1000
    if(elapsed > GAME_TIME){
        clearInterval(timer)
        timer = NaN
        endFlag = true
    }
    repaint()
}

function setColor(x,y,c){
    let flag = true
    if(1 < x ){
        let c0 = tiles[x-2][y].color
        let c1 = tiles[x-1][y].color
        flag &= !(c0 === c1 && c1 === c)
    }
    if(x<BLOCK_WIDTH-4){
        let c0 = tiles[x+2][y].color
        let c1 = tiles[x+1][y].color
        flag &= !(c0 === c1 && c1 === c)
    }
    if(1<y){
        let c0 = tiles[x][y-2].color
        let c1 = tiles[x][y-1].color
        flag &= !(c0 === c1 && c1 === c)
    }
    if(y<BLOCK_HIGHT-4){
        let c0 = tiles[x][y+2].color
        let c1 = tiles[x][y+1].color
        flag &= !(c0 === c1 && c1 === c)
    }
    return flag
}

function mymousedown(e){
    e.preventDefault()
    mouseX = !isNaN(e.offsetX) ? e.offsetX : e.touches[0].clientX
    mouseY = !isNaN(e.offsetY) ? e.offsetY : e.touches[0].clientY
}

function mymousemove(e){
    e.preventDefault()
    mouseUpX = !isNaN(e.offsetX) ? e.offsetX : e.changedTouches[0].clientX
    mouseUpY = !isNaN(e.offsetY) ? e.offsetY : e.changedTouches[0].clientY
}

function mymouseup(e){
    let sx = Math.floor((mouseX - 34)/BLOCK_SIZE)
    let sy = Math.floor((mouseY - 36)/BLOCK_SIZE)
    let nx = sx
    let ny = sy
    let mx = !isNaN(e.offsetX) ? e.offsetX : mouseUpX
    let my = !isNaN(e.offsetY) ? e.offsetY : mouseUpY
    if(Math.abs(mx - mouseX) > Math.abs(my - mouseY)){
        nx += (mx - mouseX > 0 ) ? 1 :-1
    }else{
        ny += (my - mouseY > 0 ) ? 1 :-1
    }

    if(nx > BLOCK_WIDTH-1 || ny >BLOCK_HIGHT-1 || nx < 0 || ny < 0 ){
        return
    }

    let c = tiles[sx][sy].color
    tiles[sx][sy].move(nx,ny,tiles[nx][ny].color)
    tiles[nx][ny].move(sx,sy,c)
    repaint()
}

function removeTile(){
    for(let y = 0 ; y<BLOCK_HIGHT ;y++){
        let c0 = tiles[0][y].color
        let count = 1 
        for (let x = 1 ;x<BLOCK_WIDTH;x++){
            let c1 = tiles[x][y].color
            if(c0 != c1){
                c0 = c1
                count = 1
            }else{
                if(++count >= 3){
                    tiles[x-2][y].remove = true
                    tiles[x-1][y].remove = true
                    tiles[x-0][y].remove = true
                }
            }
        }
    }

    for(let x =0;x<BLOCK_WIDTH;x++){
        let c0 = tiles[x][0].color
        let count = 1
        for(let y = 1 ; y<BLOCK_HIGHT ; y++){
            let c1 = tiles[x][y].color
            if(c0 != c1){
                c0 = c1
                count = 1
            }else{
                if(++count >=3){
                    tiles[x][y-2].remove = true
                    tiles[x][y-1].remove = true
                    tiles[x][y-0].remove = true
                }
            }
        }
    }
    let score = 0
    iterate(function(x,y,t){
        if(t.remove){
            score++
        }
    })
    return score
}

function fall(){
    for(let x = 0 ; x<BLOCK_WIDTH ; x++){
        for(let y = BLOCK_HIGHT-1 ,sp = BLOCK_HIGHT-1; y>=0 ;y--,sp-- ){
            while(sp >= 0){
                if(tiles[x][sp].remove){
                    sp--
                }else{
                    break
                }
            }
            if(y != sp){
                let c  =(sp >= 0)? tiles[x][sp].color : rand(5)
                tiles[x][y].move(x,sp,c)
            }
        }
    }
    iterate(function(x,y,t){
        t.remove = false
    })
}

function repaint(){
    
    image.drawBackground()
    image.drawImage()

    score.scoreText()

    chains.chainText()
    chains.chainTime(score.getMCount())

    if(endFlag){
        ctx.font = "bold 80px sans-serif"
        ctx.fillStyle = "rgba(255,255,255,255)"
        ctx.fillText("FINISH",350,350)
        score.writeHisocre()
    }

    let par = elapsed / (GAME_TIME / 15)
    let index = Math.min(15,Math.floor(par))
    clock(index,par)
    
    
}

function clock(index,par){

    ctx.fillStyle = "rgba(220,133,30,255)"
    ctx.font = "bold 50px sans-serif"
    ctx.fillText("残り時間",680,270)

    ctx.strokeRect(580,300,190,150)
    if(index < 15){
        let height = 100 -100*(par-index)
        let pos = 100 -height
        ctx.drawImage(times[index],590+11*index,327+pos,10,height)
        
        for(let i= index+1 ;i < 15 ;i++){
            ctx.drawImage(times[i],590+11*i,327,10,100)
        }
    }
}
