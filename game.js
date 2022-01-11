import { getDomElem, ladders, ladders2, ladders3, ladders4, snakes, snakes2, snakes3, snakes4, setCookie, sounds, timeObj, loop, recordedScores } from "./globals.js"

// Rounds float point number to specified decimal places 
function round(num, decimalPlaces = 0) { 
  num = Math.round(num + "e" + decimalPlaces)
  return Number(num + "e" + -decimalPlaces)
}

//PLAYER.
class Player{
  constructor(playerImgElem, gameBoard){
	  this.sprite = playerImgElem;
		this.gameBoard = gameBoard;
		this.x = 0;
		this.y = 0;
  }
   	
	findCell(board, xCoord, yCoord, cellWidth, cellHeight){
	 for(let i = 0; i < 10; i++){
	   for(let j = 0; j < 10; j++)  {
	 		 let leftBorder = board[i][j].getLeftX
	 		 let rightBorder = leftBorder + cellWidth
	 		 let bottomBorder = board[i][j].getBottomY;
	 		 let	topBorder = bottomBorder - cellHeight
	 		 
	 		if((xCoord > leftBorder && xCoord < rightBorder) && (yCoord > topBorder && yCoord < bottomBorder)){	 					
	 					 return board[i][j].id
	    }// if
	   }// inner loop
	  }// outer loop
	     return this.finalPos;
	}
	/* Calculates the exact position where player  must be placed on the board */
	move(index){
	  const rowIndex = parseInt(index[0])
	  let colIndex = parseInt(index[1]) 
	  
	  if(rowIndex % 2 === 1) {
	  		colIndex = 9 - colIndex	
	  }
   this.sprite.style.left = `${board.width * (0.025 + colIndex * 0.1) - 3}px`   
   this.sprite.style.bottom = `${board.height *(0.1 * rowIndex + 0.075)}px`   	
    }
}// end of Player

// Game board cell
class Cell {
  constructor(index, leftX, bottomY){
    this.index = index
    this.left = leftX
    this.bottom = bottomY
  }
  
  set setLeftX(x){
    this.left = x;
  }
  
  get getLeftX(){
  	return this.left;
  }
  
  set setBottomY(y){
    this.bottom = y;
  }
  
  get getBottomY(){
    return this.bottom;
  }
  
  get id(){
 		return this.index;
 }
}

const cells = [[], [], [], [], [], [], [], [], [], []] // Board game squares
const gameBoards = ["images/board1.png", "images/board2.jpg", "images/board3.jpg", "images/board4.jpg", "images/board5.jpg"]
const board = getDomElem("#board")
const backImage = getDomElem("#back")
const playerHeight = board.height * 0.05
const bottomOffset =  playerHeight - 0.5 *  playerHeight
const playerWidth = board.width * 0.05
const leftOffset = board.getBoundingClientRect().left

const scoreBonus = getDomElem(".score-sheet")
const gameOverText = getDomElem(".game-over")
const playerInitials = getDomElem(".initials")

// Round ending message 
const message = document.querySelector(".completed")
//Front screen element offset
export function shiftElement(selector, varName){
		const elem = document.querySelector(selector)
		const styles = getComputedStyle(elem)
		const value = String(styles.getPropertyValue(varName)).trim() 
		return value
}		

function findMaximumPosition(score, initials, records){
	 // Find position to insert the score
   let y // temporary variable fo value at insertion position
   let z // temp variable to hold initials
   let index // position to insert score
   for(let i = 0; i < 5; i++)	{
   		if(parseInt(score) > parseInt(records.scores[i])){
   			index = i
   			y = records.scores[i]	
   			z = records.initials[i]
   			records.scores[i] = `${score}`
   			records.initials[i] = `${initials}`
   			break   			
   		}// if
   } // for
   index++ // Advance position for swapping
   return {pos: index,temp: y, temp2: z}
}

function getScores(recordedScores){
   let scores = ""  
   for(let i = 0; i < 5; i++){
   		scores += `${recordedScores.initials[i]} ${recordedScores.scores[i]},`
   }
   scores = scores.substring(0, scores.length-1)
   return scores
}

function backToMenu(){
	const playerInitials = document. querySelector(".initials")
  playerInitials.style.top = "35vw"
  playerInitials.style.left = "500vw"       
  document.querySelector(".menu").style.top = "0"  
  window.location.reload()
}

let userScore = 0
function updateScoreRecords(){
  const userInput = getDomElem("#username").value
  const pattern = /^\w{1,6}$/g
  if(!pattern.test(userInput)){
    document.querySelector("#error").innerHTML = "You must enter a maximum of 6 valid characters"
    return
  }
  // Update the high scores 
  let {pos, temp, temp2} = findMaximumPosition(userScore, userInput, recordedScores) 
  for(let i = pos; i < 5; i++)	{
    let x = recordedScores.scores[i]
    recordedScores.scores[i] = temp
    temp = x
    // Swap initials
    let y = recordedScores.initials[i]
    recordedScores.initials[i] = temp2
    temp2 = y
   }
   let topScores = getScores(recordedScores) 
   setCookie("scores", topScores)
   
   backToMenu()
}

document.querySelector("#submitUserName").addEventListener("click", e => {
    updateScoreRecords()
})

let time = 0
let timeReset = true
let challengeDelay = false
const CHALLENGE_TIME = 10
const CLOCK_SPEED = 2



// GAME							
export default class Game{
  constructor(targets, randomCallback, state){
    this.random = randomCallback;
    this.targets = targets;
	  this.numCorrectMoves = state.correct;
	  this.numIncorrectMoves = 0;
	  this.isButtonPressed = false;
	  this.isGameStarted = false;
	  this.state = state
	  this.startTime = -1
	  this.previousTime = undefined  
	  this.roundEnded = false
	/* Handle expression button generator click */  this.targets.btnGenerator.addEventListener("click",  evt => {  
	    if(this.isGameStarted && !this.isGameOver && !this.isButtonPressed){
	    this.generateExp();
	    }
	  });
	  this.targets.labelResult.setAttribute("src", "images/tick.png");
  }
		
  set started(status){
		 this.isGameStarted = status;
	}		
	get started(){
	  return this.isGameStarted;
	}
	static isChallenge = false
	
	// Initialize the game board state
	init(recordedScores){ 
	  this.records = recordedScores
	  // Initial state
		this.scoreTotal = this.state.score;// Initial score
		this.targets.labelScore.innerHTML = `SCORE: ${this.scoreTotal}`;
  	this.targets.labelTime.innerText = ""
	  this.initTime =  this.state.time;// Initial time
	  this.isGameOver = false;
	  this.state.gameOver = false;
	  
	  this.currentTime = this.state.time ;
	  this.correctPos = parseInt(this.state.index)   
	  this.finalPos = this.state.index;
	  this.numOfMoves = this.state.numOfMoves;
	  this.difficulty = this.state.difficulty; 
	  this.totalTime = this.state.totalTime
	  this.roundNum = this.state.round
	  document.querySelector("#board").src =  gameBoards[this.roundNum-1]
	  /* Store game state at regular intervals during game play */ setCookie("gameState", `${this.difficulty},${this.isGameOver},${this.scoreTotal},${this.currentTime},${this.finalPos},${this.numCorrectMoves},${this.numOfMoves},${this.roundNum},${this.totalTime},${this.state.isChallenge}`) 
 }
     
 /* Initializes game state before start of a round */ 
 play() {
   this.state.index = "00"
   this.correctPos = 0
   this.finalPos = "00"
   this.state.time = 300
   this.initTime =  this.state.time
   this.currentTime = this.state.time
   
   this.started = false
   this.targets.btnGenerator.disabled = false;
   this.targets.btnGenerator.style.backgroundColor =  "hsla(120, 100%, 50%, 1.0)";
   
   this.isButtonPressed = false;
   this.targets.labelExpr.innerHTML = "" 
     document.querySelector(".gameStart").style.left = shiftElement(".gameStart", "--left")
   timeObj.startTime = undefined
   this.beginPlay()
 }
 
 static  game = null //Game board state
 
/* Starts the game loop */
 beginPlay(){ 
  document.querySelector("#exp").innerHTML = `<strong>0 + 0</strong>`
  const introMessage = document.querySelector(".gameStart")
  introMessage.innerHTML = `Round ${this.roundNum}`
	setTimeout(()=> {
	  document.querySelector("#board").src =  gameBoards[this.roundNum-1] 
    this.started = true
    introMessage.classList.add("slideRight")}, 1000)		
   setCookie("gameState", `${this.difficulty},${this.isGameOver},${this.scoreTotal},${this.currentTime},${this.finalPos},${this.numCorrectMoves},${this.numOfMoves},${this.roundNum},${this.totalTime},${this.state.isChallenge}`)
    timeObj.startTime = undefined 
	window.requestAnimationFrame(loop) 
 }
 
  /* Gets the player click coordinates */
  getMousePos(elem, evt){
		const rect = elem.getBoundingClientRect();
		const x = evt.clientX
		const y = evt.clientY
		
		const playerIndex = this.playerSprite.findCell(cells, x, y, board.width*0.1, board.height*0.1);
		this.movePlayer(playerIndex);
  } 
  
 /* Determines whether player  landed on a snake or a ladder */  
  checkSnakesLadders(choiceIndex){
    this.scoreTotal += 200;
    this.state.score = this.scoreTotal
    let _ladders;
    let _snakes;
    if(this.roundNum == 1){
    			_ladders = ladders
    			_snakes = snakes	
    }else if(this.roundNum == 2){
    			_ladders = ladders2
    			_snakes = snakes2 
    }else if(this.roundNum == 3){
    			_ladders = ladders3
    			_snakes = snakes3
    }else if(this.roundNum >= 4){
    			_ladders = ladders4
    			_snakes = snakes4
   	}
    if(_ladders.get(choiceIndex) != undefined){
     this.playerSprite.move(_ladders. get(choiceIndex));
     this.finalPos = _ladders.get(choiceIndex);
     this.state.index = this.finalPos;
     this.scoreTotal += 400;
     this.state.score = this.scoreTotal     
     this.targets.audio.src = sounds[2];
     this.targets.audio.play();
     return true;
      }
      
    if(_snakes.get(choiceIndex) != undefined){
       this.playerSprite.move(_snakes. get(choiceIndex));
       this.finalPos = _snakes.get(choiceIndex);
       this.scoreTotal -= 400;
        this.state.index = this.finalPos;
       this.state.score = this.scoreTotal
       this.targets.audio.src = sounds[4];
       this.targets.audio.play();
       return true;    
   }
   return false;
 }
  /** @parm Index of square chosen by player */
  /** @type {string} */
  movePlayer(choiceIndex){
    this.isButtonPressed = false;
    this.targets.btnGenerator.style.background  = "hsla(120, 100%, 50%, 1.0)";
    if(choiceIndex == this.correctPos){  
     this.state.index = choiceIndex;
     if(Game.isChallenge){
       timeReset = true
       challengeDelay = true  
    }
  /* Display a tick for correct move */   this.targets.labelResult.setAttribute("src", "images/tick.png");
     this.targets.labelResult.style.width = "5vh";
     this.targets.labelResult.style.height="4vh";
     this.finalPos = choiceIndex;
     this.playerSprite.move(choiceIndex);
     this.scoreTotal += 200;
     if(!this.checkSnakesLadders(choiceIndex)){
      this.targets.audio.src = sounds[0];
      this.targets.audio.play()
     }
      this.numCorrectMoves++;  
      this.state.correct = this.numCorrectMoves
    } else{
   /* Display a cross for incorrect move */   this.targets.labelResult.setAttribute("src", "images/cross.png");
      this.targets.audio.src = sounds[1];
      this.targets.audio.play();
      this.targets.labelResult.style.width="5vh";
      this.targets.labelResult.style.height="4vh";
      if(Game.isChallenge)
        timeReset = false
    }
    this.targets.labelScore.innerHTML = `SCORE: ${this.scoreTotal}`;
    setCookie("gameState", `${this.difficulty},${this.isGameOver},${this.scoreTotal},${this.currentTime},${this.finalPos},${this.numCorrectMoves},${this.numOfMoves},${this.roundNum},${this.totalTime},${this.state.isChallenge}`)
    if(this.finalPos === "99"){
      if(Game.isChallenge){
      		this.endGame()
      }else{
        this.endRound();
      }
    }
  }// end movePlayer
  
 /* Determines player's click coordinates */  
  getCoords(evt){
    this.targets.btnGenerator.disabled = false;
    if(this.isButtonPressed) {
     this.numOfMoves ++;
     this.state.numOfMoves =   this.numOfMoves;}
     
   if(this.correctPos == -1){
     this.isButtonPressed = false;
     this.targets.btnGenerator.style.background  = "hsla(120, 100%, 50%, 1.0)";
   		return;
   	}
	  this.getMousePos(board, evt);
	}
	
	/* Ends the game after round is completed  or starts the next round */
	endMessage(){
	    const FINAL_ROUND = 1
		this.roundNum++
			if(this.roundNum > FINAL_ROUND ){
						this.endGame()
			}		
		 else{	
		 this.targets.audio.src = sounds[6];
     this.targets.audio.play();	 				    
			 board.classList.add("moveBack")
       document.querySelector(".player").style.borderRadius = "10px"
    } 
	}
	
	/* Initializes rhe game */
  initializeGrid(){   
    /* Starts animation after a round is completed */       
    message.addEventListener("animationend", e => {
	    this.endMessage()
    },false)
    // Starts game screen change animation 
    this.front = document.querySelector(".top")
    this.front.addEventListener("animationstart", e => {
       document.body.style.backgroundColor="#000"
       document.querySelector("#gen").style.opacity="0"
       document.querySelector("#exp").style.opacity="0"
       document.querySelector(".top-container").style.opacity="0"
       document.querySelector(".player").style.opacity="0" 
       this.player.style.left = `${playerWidth * 0.5 - 3}px`
       this.player.style.bottom = `${1.5 * playerHeight}px`
    }, false)  
    this.front.addEventListener("animationend", e => {
      document.body.style.backgroundColor="#FFF2BD"
      document.querySelector("#gen").style.opacity="1.0"
      document.querySelector("#exp").style.opacity="1.0"
      document.querySelector(".top-container").style.opacity="1.0"
      document.querySelector(".player").style.opacity="1.0"
      this.player.style.left = `${playerWidth * 0.5 - 3}px`
      this.player.style.bottom = `${1.5 * playerHeight}px` 
      this.front.src = gameBoards[this.roundNum-1]
      this.front.classList.remove("moveBack")  
      this.play()
    }, false)

    board.addEventListener("click", (e) => { 
      if(this.isGameStarted && this.targets.btnGenerator.disabled)
    	  {this.getCoords(e);}});   
    	 const cellWidth = board.width / 10
		  // Initialize board cells
		  for(let i = 0; i < 10; i++){
		    for(let j = 0; j < 10; j++){
				  cells[i].push(new Cell(`${i}${j}`, 0, 0));
				}
	  	}
		this.initBoardCells();
   }
   
   /* Initializes rhe game board cells */
   initBoardCells(){	
		 const styles = getComputedStyle(board)
		 const cellWidth = parseInt(styles.getPropertyValue("width")) *  0.1  
     const cellHeight = parseInt(styles.getPropertyValue("height")) * 0.1 
				
		 const boundingRectLeft = board.getBoundingClientRect().left 
		 const boundingRectBottom = board.getBoundingClientRect().bottom
		
		 const numOfCols = 10;
	   const numOfRows = 10;
		 for(let row = 0; row < numOfRows; row++){
		   let offset = 9;  
		   for(let col = 0; col < numOfCols; col++){
				  if(row % 2 === 1){
				 	  cells[row][col].index = `${row}${offset}`;	
				 	  offset--;	
			  	 }else{
				    cells[row][col].index = `${row}${col}`;
				   }
				  cells[row][col].setLeftX = boundingRectLeft + col * cellWidth			
			
	       cells[row][col].setBottomY = boundingRectBottom  - (row * cellHeight);					
			}// for loop
		}// for loop
 }// end of initBoardCells
 
 /* Positions the player on the board */
  positionPlayer() {
  		this.container = document.querySelector(".board-container");
  		this.player = document.querySelector (".player");
  		this.player.addEventListener("click", e => {   
  		  if(this.isGameStarted && this.targets.btnGenerator.disabled) { this.getCoords(e);}
  				this.isButtonPressed = false;}); 
     // Set size and start position of player
      const styles = getComputedStyle(board)
      const playerWidth = parseInt(styles.getPropertyValue("width")) * 0.1 * 0.5     
      const playerHeight = parseInt(styles.getPropertyValue("height")) * 0.1 * 0.5
      
     this.player.style.width = `${playerWidth}px`
     this.player.style.height =  `${playerHeight}px`
     //Positions player on game start
     let index = this.state.index;
     const row = parseInt(index[0])
     let col = parseInt(index[1])
     const LAST_COL_INDEX = 9
     if(row % 2 == 1) {
      		col = LAST_COL_INDEX - col
     }
     this.player.style.left = `${(col * playerWidth  * 2) + playerWidth * 0.5 - 3}px`
     this.player.style.bottom = `${playerHeight + (row * playerHeight * 2) + (0.5 * playerHeight)}px`  
     this.player.style.width= `${playerWidth + 6}px`  
     this.playerSprite = new Player(this.player, board);
  }
  
 /* Calculates the final score */ 
  computeScore(){
    const precisionBonus = this.difficulty === "hard"? 1000000 : 250000;
    const timerBonus = 10;
  
    if(this.numOfMoves === 0)this.numOfMoves = 1;  
    const precision = Math.round(this.scoreTotal + (precisionBonus * this.numCorrectMoves / this.numOfMoves));
    let playTime = this.totalTime * timerBonus;
    if(Game.isChallenge)
      playTime = this.numCorrectMoves * 50000 
    if(Game.isChallenge && this.finalPos == 99) playTime = this.numCorrectMoves * 50000  + 1000000
    const finalScore = Math.round(precision + playTime);
    this.state.correct = this.numCorrectMoves;
    this.state.numOfMoves = this.numCorrectMoves;
    this.state.index = this.correctPos; 
    // Store game state in a cookie
    setCookie("gameState", `${this.difficulty},${this.isGameOver},${this.scoreTotal},${this.currentTime},${this.finalPos},${this.numCorrectMoves},${this.numOfMoves},${this.roundNum},${this.totalTime}`)
  this.displayResults(precision, playTime, finalScore);
  userScore = finalScore
  this.closeScoreScreen(finalScore)  
 }
 
  /* Display the results on the score screen */
  displayResults(precision, timeScore, finalScore){  
    document.querySelector("#score-amount").innerHTML = `${precision}`;  
    document.querySelector("#time-bonus").innerHTML = `${timeScore}`
    document.querySelector("#final-score").innerHTML = `${finalScore}`;
  }
  
 /* Geneates the arithmetic expression that determines number and direction of moves */ 
  generateExp(){
   this.targets.btnGenerator.disabled = true;
   this.targets.btnGenerator.style.backgroundColor="rgba(0,0,0,0.2)"
   this.isButtonPressed = true;
   let upper, lower;
      
   if(this.difficulty === "Easy"){
    	 upper = 6;
    	 lower = -6;
    } else{
    	 upper = 12;
    	 lower = -12;
    }
    let num1,num2;
    let signOfNum1, signOfNum2;
    let finalPos = 0, playerPos = 0;
    // Randomly choose two integers 
    do{
        [num1, num2] = this.random(lower, upper);
         finalPos = parseInt(this.finalPos) + num1 + num2;        				
    }while(finalPos < 0 || finalPos > 99);// end while  
    
    this.correctPos = finalPos;
    signOfNum1 = num1 >= 0 ? "&nbsp": "";
    signOfNum2 = num2 > 0 ? "+":"-";  
    this.targets.labelExpr.innerHTML = `<strong>${signOfNum1}${num1} ${signOfNum2} ${Math.abs(num2)}</strong>`;
  }// end generateExp
 // static startTime  
  update(elapsedTime){
    if(!this.isGameOver)
      this.displayTime(Math.round(elapsedTime, 0));
  }
   
  displayTime(currentTime){
  // Test for game over. End the game if conditions are met
   if(Game.isChallenge){ 		
    if(!timeReset || this.currentTime <= 0)
    {
      this.endGame()
      return
    }
   }else{
   		if(this.currentTime <= 0)	{
   			this.endRound()
   			return
   		} 
   	}
  
      this.currentTime = this.initTime - currentTime 
      /* Restart timer for challenge phase */
      if(challengeDelay){
       challengeDelay = false
       timeObj.startTime = undefined  
     }
    this.state.time = this.currentTime; 
    if(Game.isChallenge){
       this.targets.labelTime.style.paddingLeft=shiftElement(".flex-item-time", "--padLeft")
      this.targets.labelTime.style.paddingRight=shiftElement(".flex-item-time", "--padRight")
    		this.targets.labelTime.innerText = `${this.currentTime}`
    		return
    }
    /* Display the current time */  
    let timeText = "";
    if(this.currentTime >= 0 && this.currentTime  < 10){
   	  timeText = ` TIME: 00${this.currentTime} `;
   	 }else if(this.currentTime >= 10 && this.currentTime < 100){
   				timeText = ` TIME: 0${this.currentTime} `;
   	 }else { 
   	   timeText = ` TIME: ${this.currentTime} `;}
   	  
   	   this.targets.labelTime.innerText = timeText;
  }
  
 /* Ends a round */   
  endRound(){
    this.totalTime += parseInt(this.currentTime)
    message.style.left = shiftElement(".completed", "--left")	
    message.classList.add("slideLeft")
    message.style.animationPlayState = "running"  
  }// end of endRound
  
 /* Ends the game */ 
  endGame(){
     this.isGameOver = true;
     this.isGameStarted = false;
     this.isButtonPressed = true;
     this.targets.btnGenerator.disabled = true;
   
     this.state.gameOver = true;  
     // Global game over text object
     gameOverText.style.left =shiftElement(".game-over", "--left");
     gameOverText.style.zIndex ="40"; 
     /* Input player username */   
     this.input = document.querySelector("input").addEventListener("focus", e => {  
    			     	  document.querySelector(".initials").style.justifyContent=shiftElement(".initials", "--justify")
		document.querySelector("#error").innerHTML = ""
    })
    setTimeout(()=>{
      this.targets.audio.src = sounds[5];
     this.targets.audio.play();
     	gameOverText.style.left  ="300vw";   				
     if(this.finalPos == 99 && Game.isChallenge){
         const congrats = document.querySelector(".congrats") 
         congrats.style.left=shiftElement(".congrats", "--left"); 
      }
      scoreBonus.style.left= shiftElement(".score-sheet", "--left");
      scoreBonus.style.zIndex="42";    				
     	this.computeScore();
     }, 2000); 
 }// end of endGame  
  
  closeScoreScreen(score){
  /* Closes the score results screen */
    const closeButton = document.querySelector("#close")		
    closeButton.addEventListener("click", e =>{ 
    const level = document.querySelector(".z-order")
    const menu = document.querySelector(".menu")
    level.style.left = "200vw"		
    scoreBonus.style.left="400vw";
    if(this.finalPos == 99 && Game.isChallenge) {
      document.querySelector(".congrats").style.left="400vw"
    }
    menu.style.top = "0" 
    window.location.reload()   				
    })
    /* Register player username and score */
    this.register = document.querySelector("#register")	
    this.register.addEventListener("click", e => {	
    message.classList.remove("slideLeft")  
    message.classList.remove("slideLeft2") 
    
    const level = document.querySelector(".z-order") 
    scoreBonus.style.left = "400vw"
    if(this.finalPos == 99 && Game.isChallenge) {
      document.querySelector(".congrats").style.left="600vw"
    }
    level.style.left = "200vw"
    playerInitials.style.left = shiftElement(".initials", "--left")
   }) // end of register buttonSum handler
    const lastScore = parseInt(this.records.scores[4])
    register.disabled = score > lastScore ? false : true
  }// end of closeScoreScreen
}

