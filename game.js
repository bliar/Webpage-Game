// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.currentMotion = motionType.RIGHT;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        //
        if (node.getAttribute("id") == "vertical_platform"){
            var towards = node.getAttribute("towards");
            if (towards == direction.RIGHT)
                y = y - PLATFORM_SPEED;
            if (towards == direction.LEFT)
                y = y + PLATFORM_SPEED;
        }
        //

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.isOnVerticalPlatform = function() {
    var node = svgdoc.getElementById("vertical_platform");

    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var towards = node.getAttribute("towards");
    if (towards == direction.RIGHT)
        y = y - PLATFORM_SPEED;
    if (towards == direction.LEFT)
        y = y + PLATFORM_SPEED;
    if (towards == direction.RIGHT){
        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
        ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
        (this.position.x == (x + w) && this.motion == motionType.LEFT)) 
        &&
        this.position.y + PLAYER_SIZE.h == y - PLATFORM_SPEED) return true;
    }
    if (towards == direction.LEFT){
        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
        ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
        (this.position.x == (x + w) && this.motion == motionType.LEFT)) 
        &&
        this.position.y + PLAYER_SIZE.h == y + PLATFORM_SPEED) return true;
    }
    return false;
}


Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect"|| node.getAttribute("id") == "vertical_platform") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideVerticalPlatform = function(position) {
    var node = svgdoc.getElementById("vertical_platform");
    
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var towards = node.getAttribute("towards");
    var previous_y = y;
    if (towards == direction.RIGHT)
        previous_y = y - PLATFORM_SPEED;
    if (towards == direction.LEFT)
        previous_y = y + PLATFORM_SPEED;
    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        //position.x = this.position.x;
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            if (this.position.y >= previous_y + h)
                position.y = y + h;
            else
                position.y = y - PLAYER_SIZE.h;
            this.verticalSpeed = -3;
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var PORTAL_SIZE = new Size(40, 40);         // The size of the portal
var EXIT_SIZE = new Size(30,50);            // The size of the exit
var GAME_INTERVAL = 25;                     // The time interval of running the game
var TIME_INTERVAL = 1000;                   // The count down time
var TOTAL_TIME = 100;
var BULLET_SIZE = new Size(10, 10);         // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
var MONSTER_BULLET_SPEED = 5.0              //  = pixels it moves each game loop
var MONSTER_SPEED = 1.0;                    // The speed of a monster
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var GOOD_SIZE = new Size(20, 20);           // Ths size of a good thing
var MONSTER_SIZE = new Size(40, 40);        // The size of a monster
var BULLET_NUM = 8;                         // The number of bullets
var MONSTER_NUM = 6;                        // The number of monsters
var GOOD_NUM = 8;                           // The number of good things
var Z_DOWN = false;
var CHEAT = false;
var LEVEL = 1;
var MONSTER_BULLET = 0;
var SPECIAL_MONSTER = 1;
var NAME = "Anonymous";
var PLATFORM_SPEED = 1;
//
// Variables in the game
//
var event = null;
var direction = {LEFT:0, RIGHT:1};
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var timeInterval = null;                    // The countdown interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
// var right_boundary = Math.floor((SCREEN_SIZE.w * Math.random())/5) + Math.floor((3*SCREEN_SIZE.w)/5);
// var left_boundary = Math.floor((SCREEN_SIZE.w * Math.random())/5) + Math.floor((SCREEN_SIZE.w)/5);


//
// The load function for the SVG document
//
function load(evt) {
    event = evt;
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);
    svgdoc.documentElement.addEventListener("click", click, false);
    if (LEVEL == 1){
        NAME = prompt("What is your name?", "");
        if(NAME == "" || !NAME){
            NAME = "Anonymous";
        }
    }
    svgdoc.getElementById("input").firstChild.data = NAME;
    svgdoc.getElementById("score").firstChild.data = score;
    svgdoc.getElementById("bullet_left").firstChild.data = BULLET_NUM;
    svgdoc.getElementById("level").firstChild.data = LEVEL;
    svgdoc.getElementById("timer").firstChild.data = TOTAL_TIME;    
    player = new Player();
    svgdoc.getElementById("vertical_platform").setAttribute("towards", direction.RIGHT);
    // Create the monsters
    for(i = 0; i<MONSTER_NUM-1; i++){
       var x = Math.floor((SCREEN_SIZE.w - MONSTER_SIZE.w - 70) * Math.random()) + 70;
        var y = Math.floor((SCREEN_SIZE.h - MONSTER_SIZE.h) * Math.random());
        createMonster(x, y);
    }

    var x = Math.floor((SCREEN_SIZE.w - MONSTER_SIZE.w - 70) * Math.random()) + 70;
    var y = Math.floor((SCREEN_SIZE.h - MONSTER_SIZE.h) * Math.random());
    createSpecialMonster(x,y);


    createDisappearing(0,360)
    createDisappearing(340, 360);
    createDisappearing(450, 100);
    // Create good things
    for(i = 0; i<GOOD_NUM; i++){
        x = Math.floor((SCREEN_SIZE.w - GOOD_SIZE.w) * Math.random());
        y = Math.floor((SCREEN_SIZE.h - GOOD_SIZE.h) * Math.random());
        var pos = new Point(x, y);
        while (isInPlatform(pos)){
            x = Math.floor((SCREEN_SIZE.w - GOOD_SIZE.w) * Math.random());
            y = Math.floor((SCREEN_SIZE.h - GOOD_SIZE.h) * Math.random());
            var pos = new Point(x, y);
        }
        createGood(x, y);
    }

    svgdoc.getElementById("level").firstChild.data = LEVEL;
    // Create transmission portal
    createExit(0,10);
    createPortal(0,180);
    createPortal(560, 500);
}


function playsnd(id) {
    var snd = svgdoc.getElementById(id);
        snd.currentTime = 0;
        snd.play();
}

//
//This function decrease the time remaining
//
function countDown(){
    if(TOTAL_TIME <=0){
        svgdoc.getElementById("timer").firstChild.data = 0;
    } else{
        TOTAL_TIME--;
        svgdoc.getElementById("timer").firstChild.data = TOTAL_TIME;
    }
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    if (Math.floor(2* Math.random()) == 0){
        monster.speed = MONSTER_SPEED;
        monster.currentMotion = motionType.RIGHT;
    } else {
        monster.speed = - MONSTER_SPEED;
        monster.currentMotion = motionType.LEFT;
    }
    monster.right_boundary = Math.floor((SCREEN_SIZE.w-MONSTER_SIZE.w-x-1) * Math.random())+ x+1 + MONSTER_SIZE.w;
    monster.left_boundary = Math.floor(x * Math.random());
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.special = false;
    svgdoc.getElementById("monsters").appendChild(monster);
}


//
// This function creates the good things in the game
//
function createGood(x , y){
    var good = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    good.setAttribute("x", x);
    good.setAttribute("y", y); 
    good.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#good");
    svgdoc.getElementById("goods").appendChild(good);
}


//
// This function creates the exit in the game
//
function createExit(x, y){
    var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    exit.setAttribute("x", x);
    exit.setAttribute("y", y); 
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
    svgdoc.getElementById("exits").appendChild(exit);
}


//
// This function creates the transmission portal in the game
//
function createPortal(x, y){
    var portal = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    portal.setAttribute("x", x);
    portal.setAttribute("y", y); 
    portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#door");
    svgdoc.getElementById("doors").appendChild(portal);
}


//
// This function creates the disappearing platform in the game
//
function createDisappearing(x, y){
    var platforms = svgdoc.getElementById("platforms");
    var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    newPlatform.setAttribute("x", x);
    newPlatform.setAttribute("y", y);
    newPlatform.setAttribute("width", 100);
    newPlatform.setAttribute("height", 20);
    newPlatform.setAttribute("type", "disappearing");
    newPlatform.style.setProperty("opacity", 1, null);
    newPlatform.style.setProperty("fill", "yellow", null);
    platforms.appendChild(newPlatform);    
}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    if ((player.currentMotion == motionType.RIGHT && BULLET_NUM>0) || (player.currentMotion == motionType.RIGHT && CHEAT)){
        playsnd("shoot_snd");
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.speed = BULLET_SPEED;
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        svgdoc.getElementById("bullets").appendChild(bullet);
        if(!CHEAT){
            BULLET_NUM--;
        }
        svgdoc.getElementById("bullet_left").firstChild.data = BULLET_NUM;
    }
    if ((player.currentMotion == motionType.LEFT && BULLET_NUM>0) || (player.currentMotion == motionType.LEFT && CHEAT)){
        playsnd("shoot_snd");
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.speed = - BULLET_SPEED;
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        svgdoc.getElementById("bullets").appendChild(bullet);
        if(!CHEAT){
            BULLET_NUM--;
        }
        svgdoc.getElementById("bullet_left").firstChild.data = BULLET_NUM;
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.currentMotion = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.currentMotion = motionType.RIGHT;            
            break;
            
        case "Z".charCodeAt(0):
            if (player.isOnPlatform() || player.isOnVerticalPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            Z_DOWN = true;
            break;
        case "C".charCodeAt(0):
            CHEAT = true;
            break;

        case "V".charCodeAt(0):
            CHEAT = false;
            break;

        case 32:
            if (canShoot) shootBullet();
            break;


    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
        case "Z".charCodeAt(0):
            Z_DOWN = false;
            break;
    }
}


//
// This handles starting funciton
//
function click(evt){
    var btn = svgdoc.getElementById("btn");
    btn.onclick = function(){
        var start = svgdoc.getElementById("start");
        start.style.setProperty("visibility", "hidden", null);
        btn.style.setProperty("visibility", "hidden", null);
        var ins = svgdoc.getElementById("ins");
        ins.style.setProperty("visibility", "hidden", null);
        timeInterval = setInterval("countDown()", TIME_INTERVAL);
        gameInterval = setInterval("gamePlay()", GAME_INTERVAL);        
    }
    var next_btn = svgdoc.getElementById("next");
    next_btn.onclick = function(){
        var cong = svgdoc.getElementById("cong");
        cong.style.setProperty("visibility", "hidden", null);
        next_btn.style.setProperty("visibility", "hidden", null);
        if(LEVEL == 1){
            TOTAL_TIME = 100;
            BULLET_NUM = 8;
            MONSTER_NUM = 6;
            GOOD_NUM = 8;
        }
        if(LEVEL ==2){
            TOTAL_TIME = 150;
            BULLET_NUM = 8;
            MONSTER_NUM = 10;
            GOOD_NUM = 8;
        }
        if (LEVEL ==3){
            TOTAL_TIME = 200
            BULLET_NUM = 8;
            MONSTER_NUM = 14;
            GOOD_NUM = 8;
        }

        load(event);
        timeInterval = setInterval("countDown()", TIME_INTERVAL);
        gameInterval = setInterval("gamePlay()", GAME_INTERVAL);         
    }

    var again_btn = svgdoc.getElementById("again");
    again_btn.onclick = function(){
        var node = svgdoc.getElementById("highscoretable");
        node.style.setProperty("visibility", "hidden", null);

        //Clear scores
        var highscoretext = svgdoc.getElementById("highscoretext");
        var length = highscoretext.childNodes.length;        
        for (var i = 0; i < length; i++) {
            var text = highscoretext.childNodes.item(0);
            highscoretext.removeChild(text);
        }

        //Clear monsters
        var monsters = svgdoc.getElementById("monsters");
        var monsters_length = monsters.childNodes.length;
        for (var i = 0; i < monsters_length; i++) {
            var monster = monsters.childNodes.item(0);
            monsters.removeChild(monster);
        }
        
        //Clear good things
        var goods = svgdoc.getElementById("goods");
        var goods_length = goods.childNodes.length;
        for (var i = 0; i < goods_length; i++) {
            var good = goods.childNodes.item(0);
            goods.removeChild(good);
        }

        //Clear bullets
        var bullets = svgdoc.getElementById("bullets");
        var bullets_length = bullets.childNodes.length;
        console.log(MONSTER_BULLET);
        for (var i = 0; i < bullets_length; i++) {
            var bullet = bullets.childNodes.item(0);
            bullets.removeChild(bullet);
        } 

        score = 0;
        LEVEL = 1;
        TOTAL_TIME = 100;
        BULLET_NUM = 8;
        MONSTER_NUM = 6;
        GOOD_NUM = 8;
        MONSTER_BULLET = 0;


        load(event);
        timeInterval = setInterval("countDown()", TIME_INTERVAL);
        gameInterval = setInterval("gamePlay()", GAME_INTERVAL);                 
    }
}



//
//This handles finishing function
//
function finish(){
    var exit = svgdoc.getElementById("exit");
    var x = parseFloat(exit.getAttribute("x"));
    var y = parseFloat(exit.getAttribute("y"));
    var pos = new Point(x, y);
    var nearexit = intersect(player.position, PLAYER_SIZE, pos, EXIT_SIZE) && Z_DOWN;
    if (nearexit){
    }
    if (MONSTER_NUM == 0 && GOOD_NUM == 0 && nearexit){
        playsnd("exit_snd");
        LEVEL++;
        if (LEVEL !=4){
            clearInterval(gameInterval);
            clearInterval(timeInterval); 
            var time_remaining = svgdoc.getElementById("timer").firstChild.data;
            score += (+time_remaining);
            score += (LEVEL-1)*100;
            svgdoc.getElementById("score").firstChild.data = score;
            //LEVEL ++;
            var cong = svgdoc.getElementById("cong");
            var next_btn = svgdoc.getElementById("next");
            cong.style.setProperty("visibility", "visible", null);
            next_btn.style.setProperty("visibility", "visible", null);
        }

        if (LEVEL == 4){
            clearInterval(gameInterval);
            clearInterval(timeInterval);
            var time_remaining = svgdoc.getElementById("timer").firstChild.data;
            score += (+time_remaining);
            score += (LEVEL-1)*100;
            table = getHighScoreTable();
            svgdoc.getElementById("yourscoretext").firstChild.data = score;
            var record = new ScoreRecord(NAME, score);
            var pos = table.length;
            for (var i = 0; i < table.length; i++) {
                if (record.score > table[i].score) {
                    pos = i;
                    break;
                }
            }
            table.splice(pos, 0, record);
            setHighScoreTable(table);
            showHighScoreTable(table);           
            click();           

            return;
        }  
    }
}

//
//This handles the timeout
//
function timeout(){
    if (TOTAL_TIME == 0){
        playsnd("player_snd");
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        table = getHighScoreTable();
        svgdoc.getElementById("yourscoretext").firstChild.data = score;
        var record = new ScoreRecord(NAME, score);
        var pos = table.length;
        for (var i = 0; i < table.length; i++) {
            if (record.score > table[i].score) {
                pos = i;
                break;
            }
        }
        table.splice(pos, 0, record);
        setHighScoreTable(table);
        showHighScoreTable(table);           
        click();           

        return;       
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE) && (!CHEAT)) {
            playsnd("player_snd");
            // Clear the game interval
            clearInterval(gameInterval);
            clearInterval(timeInterval);
            table = getHighScoreTable();
            svgdoc.getElementById("yourscoretext").firstChild.data = score;
            var record = new ScoreRecord(NAME, score);
            var pos = table.length;
            for (var i = 0; i < table.length; i++) {
                if (record.score > table[i].score) {
                    pos = i;
                    break;
                }
            }
            table.splice(pos, 0, record);
            setHighScoreTable(table);
            showHighScoreTable(table);           
            click();           

            return;
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        if(bullet.getAttribute("type") == "monster_bullet"){
            continue;
        }
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                playsnd("monster_snd");
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                MONSTER_NUM--;
                score += 10;
                svgdoc.getElementById("score").firstChild.data = score;
                break;
            }
        }
    }

    //Check wheter a bullet hits player
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        if(bullet.getAttribute("type") != "monster_bullet"){
            continue;
        }
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE) && (!CHEAT)) {
            playsnd("player_snd");
            // Clear the game interval
            clearInterval(gameInterval);
            clearInterval(timeInterval);

            table = getHighScoreTable();
            svgdoc.getElementById("yourscoretext").firstChild.data = score;
            var record = new ScoreRecord(NAME, score);
            var pos = table.length;
            for (var i = 0; i < table.length; i++) {
                if (record.score > table[i].score) {
                    pos = i;
                    break;
                }
            }
            table.splice(pos, 0, record);
            setHighScoreTable(table);
            showHighScoreTable(table);                      
            click();           

            return;
        }
    }

    //Check where player hits a good thing
    var goods = svgdoc.getElementById("goods");
    for (var i = 0; i < goods.childNodes.length; i++){
        var good = goods.childNodes.item(i);
        var x = parseInt(good.getAttribute("x"));
        var y = parseInt(good.getAttribute("y"));

        if (intersect(new Point(x, y), GOOD_SIZE, player.position, PLAYER_SIZE)){
            goods.removeChild(good);
            GOOD_NUM--;
            score +=5;
            svgdoc.getElementById("score").firstChild.data = score;
        }
    }
}


//
// This function transfer player
//
function transfer(){
    var portals = svgdoc.getElementById("doors");

    for (var i=0; i<portals.childNodes.length; i++){
        var portal = portals.childNodes.item(i);
        var x = parseFloat(portal.getAttribute("x"));
        var y = parseFloat(portal.getAttribute("y"));
        var pos = new Point(x, y);
        if(intersect(player.position, PLAYER_SIZE, pos, PORTAL_SIZE) && Z_DOWN){
            var target = portals.childNodes.item(1-i);
            player.position.x = parseFloat(target.getAttribute("x"));
            player.position.y = parseFloat(target.getAttribute("y"));
            Z_DOWN = false;
        }       
    }
}

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        node.setAttribute("x", x + node.speed);

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x<0) {
            if(node.getAttribute("type") == "monster_bullet"){
                MONSTER_BULLET--;
            }
            bullets.removeChild(node);
            i--;
        }
    }
}

//
// This function let the monster shoots
//
function MonsterShoot(motion, x, y){

    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    if (motion == motionType.RIGHT){
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        bullet.setAttribute("x", x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.setAttribute("type", "monster_bullet");
        bullet.speed = MONSTER_BULLET_SPEED;
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        svgdoc.getElementById("bullets").appendChild(bullet);
    }
    if (motion == motionType.LEFT){
        var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        bullet.setAttribute("x", x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
        bullet.setAttribute("y", y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
        bullet.setAttribute("type", "monster_bullet");
        bullet.speed = - MONSTER_BULLET_SPEED;
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
        svgdoc.getElementById("bullets").appendChild(bullet);
    }  
}

//
//This function creates special monster
//
function createSpecialMonster(x, y) {
    console.log("create special");
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    if (Math.floor(2* Math.random()) == 0){
        monster.speed = MONSTER_SPEED;
        monster.currentMotion = motionType.RIGHT;
    } else {
        monster.speed = - MONSTER_SPEED;
        monster.currentMotion = motionType.LEFT;
    }
    monster.right_boundary = Math.floor((SCREEN_SIZE.w-MONSTER_SIZE.w-x-1) * Math.random())+ x+1 + MONSTER_SIZE.w;
    monster.left_boundary = Math.floor(x * Math.random());
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.special = true;
    svgdoc.getElementById("monsters").appendChild(monster);
}


//
// This function move monsters
//
function moveMonsters() {
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++){
        var node = monsters.childNodes.item(i);
        var currentMotion = node.currentMotion;
        var x = parseInt(node.getAttribute("x"));
        var y = parseInt(node.getAttribute("y"));
        if (node.special && MONSTER_BULLET == 0){
            MonsterShoot(currentMotion, x, y);
            MONSTER_BULLET++;
        }
        if (x + MONSTER_SIZE.w >= node.right_boundary || x <= node.left_boundary){
            if (currentMotion == motionType.RIGHT){
                node.currentMotion = motionType.LEFT;
            }
            if (currentMotion == motionType.LEFT){
                node.currentMotion = motionType.RIGHT;
            }
            node.speed = - node.speed;
        }
        if (node.currentMotion == motionType.RIGHT){
            node.setAttribute("x", x + node.speed);
            node.setAttribute("transform", "translate(0,0) scale(1,1)");
        }
        if (node.currentMotion == motionType.LEFT){
            node.setAttribute("x", x + node.speed);
            var dis = 2*(+x + +node.speed) + MONSTER_SIZE.w;
            node.setAttribute("transform", "translate(" + dis + "," + 0 + ") scale (-1,1)");
         }

    }
}


//
// This function check whether good things collide with platform
//
function isInPlatform(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, GOOD_SIZE, pos, size)) {
            return true;
        }
    }
    return false;
}


//
// This function check whether player is on the disappearing platform
//
function isOnDisappearing(){
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i<platforms.childNodes.length; i++){
        var platform = platforms.childNodes.item(i);
       // if ((platform.nodeName != "rect") && (platform.nodeName != "line")) continue;
        if (platform.nodeName != "rect") continue;
           if (platform.getAttribute("type") == "disappearing"){
                var platformOpacity = parseFloat(platform.style.getPropertyValue("opacity"));
                var x = parseFloat(platform.getAttribute("x"));
                var y = parseFloat(platform.getAttribute("y"));
                var w = parseFloat(platform.getAttribute("width"));
                var h = parseFloat(platform.getAttribute("height"));
                var dis = (((player.position.x + PLAYER_SIZE.w > x && player.position.x < x + w) ||
                        ((player.position.x + PLAYER_SIZE.w) == x && player.motion == motionType.RIGHT) ||
                        (player.position.x == (x + w) && player.motion == motionType.LEFT)) &&
                        player.position.y + PLAYER_SIZE.h == y);
                if (dis){
                        platformOpacity -= 0.01;
                        platform.style.setProperty("opacity", platformOpacity, null);
                }

                if (!(platformOpacity > 0)){
                    platforms.removeChild(platform);
                }                
            }
    }    
}


//
// This function moves the platform
//
function movePlatform() {
    var vertical_platform = svgdoc.getElementById("vertical_platform");
    // Update the position of the vertical_platform
    var y = parseInt(vertical_platform.getAttribute("y"));
    var towards = vertical_platform.getAttribute("towards");
    if (towards == direction.RIGHT)
        vertical_platform.setAttribute("y", y + PLATFORM_SPEED);
    if (towards == direction.LEFT)
        vertical_platform.setAttribute("y", y - PLATFORM_SPEED);
    if (y <= 260)
        vertical_platform.setAttribute("towards", direction.RIGHT);
    if (y >= 340)
        vertical_platform.setAttribute("towards", direction.LEFT);
}



//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();
    isOnDisappearing();
    finish();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    var isOnVerticalPlatform = player.isOnVerticalPlatform();
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;


    // if(isOnPlatform && !isOnVerticalPlatform){
    //     console.log("is on platform and is not on vertical platform");
    // }
    // if(isOnPlatform && isOnVerticalPlatform){
    //     console.log("on both platform");
    // }

    // if(!isOnPlatform && !isOnVerticalPlatform){
    //     console.log("not on any platform");
    // }
    // if(isOnVerticalPlatform && !isOnPlatform){
    //     console.log("on vertical");
    // }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideVerticalPlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    var snd = svgdoc.getElementById("game_snd");
    snd.play();

    // Move the bullets
    transfer();
    timeout();
    moveBullets();
    moveMonsters();
    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    movePlatform();
    // Transform the player
    if(player.currentMotion == motionType.RIGHT){
        player.node.setAttribute("transform", "translate(" + player.position.x+ "," + player.position.y + ")");
        player.node.childNodes.item(1).setAttribute("transform", "translate(0,0)");
    }

    if (player.currentMotion == motionType.LEFT){
        //var displacement = +player.position.x + +PLAYER_SIZE.w;
        player.node.setAttribute("transform", "translate(" + player.position.x+ "," + player.position.y + ")");
         player.node.childNodes.item(1).setAttribute("transform", "translate(" +PLAYER_SIZE.w +","+ "0) scale(-1, 1)");   
    }
    // Calculate the scaling and translation factors    
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");   
}
