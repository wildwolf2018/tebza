import Game, { shiftElement} from "./game.js"
import { loop, recordedScores, gameState, getDomElem, checkCookie, playButton, challengeButton, resumeButton, highScoreButton, helpButton, sounds, easyMode, hardMode, timeObj,initialsIds, scoresIds} from "./globals.js"

// Initializes the game state
function startGame(targets, rand){
  Game.game = new Game(targets, rand, gameState)
  Game.game.initializeGrid()
  Game.game.positionPlayer()
  Game.game.init(recordedScores)
}

// Game loop
timeObj.gameTime = gameState.time * 1000
/* Round number introduction message */
const introMessage = getDomElem(".gameStart")

/* Starts gameplay after splash screen fadeout */
function beginPlay(eventTarget, loop){
  introMessage.innerHTML = `Round ${gameState.round}`
  setTimeout(()=> {
    Game.game.started = true
    eventTarget.audio.pause()
    introMessage.classList.add("slideRight")}, 2000)
  window.requestAnimationFrame(loop)
}

/* Tests whether string is eqaul to boolean true value */
function isEqualToTrue(s, text = "true"){
  const index = s.indexOf(text)
  return s.substring(index, index + text.length) === text
}

function getStateCookieData(gameState, state){
  gameState.difficulty = state[0]
  gameState.gameOver = isEqualToTrue(state[1])
  gameState.score = parseInt(state[2])
  gameState.time = parseInt(state[3])
  gameState.index = state[4]
  gameState.correct = parseInt(state[5])
  gameState.numOfMoves = parseInt(state[6])
  gameState.round = parseInt(state[7])
  gameState.totalTime = parseInt(state[8])
  gameState.isChallenge = parseInt(state[9])
}


const defaultScores = {}
defaultScores.initials  = [...recordedScores.initials]
defaultScores.scores  = [...recordedScores.scores]

function loadDefaultScores(){
  for(let i = 0; i < 5; i++){
    recordedScores.initials[i] = defaultScores.initials[i]
    recordedScores.scores[i] = defaultScores.scores[i]
  }
}

function loadHighScores(recordedScores){
  const cookieValue = checkCookie("scores", "AAA 5000,BBB 4000,CCC 3000,DDD 2000,EEE 1000")
  if(cookieValue != "")	{
    const scores = cookieValue.split(",")
    for(let i = 0; i < 5; i++){
      recordedScores.initials[i] = scores[i].substring(0, scores[i].indexOf(" "))
      recordedScores.scores[i] = scores[i].substring(scores[i].indexOf(" ") + 1)
    }
  }else{
     loadDefaultScores()
  }
}

function displayScores(recordedScores){
  for(let i = 0; i < 5; i++){
    document.querySelector(initialsIds[i]).innerHTML = `${i+1}. ${recordedScores.initials[i]}`
    document.querySelector(scoresIds[i]).innerHTML = recordedScores.scores[i]
  }
}

function disableMenuButtons(){
  challengeButton.disabled = true
  playButton.disabled = true
  resumeButton.disabled = true
  highScoreButton.disabled = true
  helpButton.disabled = true
}

function modeHandler(evt){
  introScreen.classList.remove("intro-fadein")
  choiceDialog.classList.remove("intro-fadein")

  disableModeButtons()
  gameState.difficulty = evt.target.innerHTML
  chooseMode(gameState.difficulty)
  phaseOut()
}


function disableModeButtons(){
  splashToLevel = true
  easyMode.removeEventListener("click", modeHandler)
  hardMode.removeEventListener("click", modeHandler)
}

// Get the previous game state from cookie
window.addEventListener("load", e => {
  let name = checkCookie("gameState",`"Easy",${true},0,0,00,0,0,1,0,0`)
  if(name != ""){
    getStateCookieData(gameState, name.split(","))
  }
  resumeButton.disabled =   gameState.gameOver
  loadHighScores(recordedScores)
})

const menu = getDomElem(".menu")
const level = getDomElem(".z-order")
const introScreen = getDomElem(".intro-bg")
const choiceDialog = getDomElem(".dialog")
const highScores = getDomElem(".score-screen-container")
const help = getDomElem(".help-container")

function menuFadeOut(gameBoard){
  gameBoard.audio.play()
  menu.classList.add("splash-fadeout")
  introScreen.style.top = shiftElement(".intro-bg","--top")
  introScreen.style.left = shiftElement(".intro-bg","--left")
  choiceDialog.style.top=shiftElement(".dialog","--top")
  choiceDialog.style.left=shiftElement(".dialog","--left")
}

menu.addEventListener("animationend", e => {
  menu.style.top = "100vh"
  menu.style.opacity="1.0"
}, false)

function chooseMode(mode){
  const black = "rgba(0,0,0,0.0)"
  const white = "rgba(255,255,255,0.5)"
  let easy = easyMode.style
  let hard = hardMode.style
  
  if(mode==="Easy"){
    easy.background = white
    hard.background = black
    easy.color="rgba(0, 255,0,1.0)"
  }else{
    easy.background = black
    hard.background = white
    hard.color="rgba(0,255,0,1.0)"
  }
}

function setDefaultState(gameState){
  gameState.gameOver = false
  gameState.difficulty = "Easy"
  gameState.score = 0
  gameState.time = 300
  gameState.index = "00"
  gameState.correct = 0
  gameState.numOfMoves = 0
  gameState.round = 1
  gameState.totalTime = 0
  gameState.isChallenge = 0
}

function phaseOut(){
  splashToLevel = true
  choiceDialog.classList.add("splash-fadeout")
  introScreen.classList.add("splash-fadeout")
}

//Challenge Phase
challengeButton.addEventListener("click", e =>{
  disableMenuButtons()
  document.querySelector(".flex-item-score").style.color="#FFF"
  document.querySelector(".z-order").style.backgroundColor="#333"
  setDefaultState(gameState)
  gameState.time = 15
  timeObj.gameTime = gameState.time * 1000
  gameState.difficulty = "Hard"
  gameState.isChallenge = 1
  Game.isChallenge = true

  splashToLevel =true
  menuFadeOut(boardLevelElems)
  introScreen.style.opacity="1.0"
  choiceDialog.style.opacity="1.0"
  chooseMode("Hard")
  phaseOut()
  
  document.querySelector(".flex-item-time").style.color="#FF0000"
  document.querySelector(".flex-item-time").classList.add("counter")
})
// Proceed to title screen
playButton.addEventListener("click", e =>{
  disableMenuButtons()
  Game.isChallenge = false
  gameState.isChallenge = 0
  setDefaultState(gameState)
  menuFadeOut(boardLevelElems)
  introScreen.classList.add("intro-fadein")
  choiceDialog.classList.add("intro-fadein")
})

// Resume play
resumeButton.addEventListener	("click", e =>{
  if(gameState.isChallenge == 1){
    setDefaultState(gameState)
    resumeButton.disabled = true
    alert("No previous unfinished game")
    return
  }
  disableMenuButtons()
  Game.isChallenge = false
  gameState.isChallenge = 0
  splashToLevel =true
  menuFadeOut(boardLevelElems)
  introScreen.style.opacity="1.0"
  choiceDialog.style.opacity="1.0"
  chooseMode(gameState.difficulty)
  phaseOut()
})


// View high scores
const menuToScores =  getDomElem(".score-screen-container")
highScoreButton.addEventListener("click",e => {
    console.log("scores")
  displayScores(recordedScores)
  menu.style.top = "100vh"
  highScores.style.left = shiftElement(".score-screen-container", "--left")
})

// Return to menu screen from high score screen
const scoresToMenu = getDomElem("#close-scores")
scoresToMenu.addEventListener("click", e => {
menu.style.top = shiftElement(".menu", "--top")
highScores.style.left="-100vw"
})

function addVerticalScroll(selector){
  document.body.style.overflow="scroll"
  document.body.style.overflowX="hidden"
  document.querySelector(selector).style.overflow="scroll"
  document.querySelector(selector).style.overflowY="scroll"
  document.querySelector(selector).style.overflowX="hidden"
  document.querySelector(selector).scrollTop = 0
}

function disableVerticalScroll(selector){
  document.body.style.overflow="hidden"
  document.querySelector(selector).style.overflow="hidden"
  document.querySelector(selector).style.overflowY="hidden"
}

// View help screen
helpButton.addEventListener("click",e => {
  addVerticalScroll("p")

  help.style.left= shiftElement(".help-container", "--left")
  document.querySelector("body").style.backgroundColor=shiftElement(".help-container", "--body-bg")
  help.style.visibility ="visible"
  help.style.zIndex="45"
  menu.style.left = "-200vw"
  helpToMenu.disabled = false	})

// Return to menu screen from help screen
const helpToMenu = document.querySelector("#close-help")
helpToMenu.addEventListener("click", e => {
  disableVerticalScroll("p")
  menu.style.left = shiftElement(".menu", "--left")
  help.style.visibility ="hidden"
  help.style.zIndex="-5"
  helpToMenu.disabled = true
})

// Event listeners for chosen game mode
easyMode.addEventListener("click",  modeHandler)

hardMode.addEventListener("click",  modeHandler)

let splashToLevel = false
// Event handler for starting gameplay
introScreen.addEventListener("animationend", e => {
  if(splashToLevel){
    introScreen.style.left = "100vw"
    choiceDialog.style.left= "110vw"
    introScreen.style.opacity = "1.0"
    choiceDialog.style.opacity= "1.0"
    introMessage.innerHTML = `Round ${gameState.round}`
    introMessage.style.top = shiftElement(".gameStart", "--top")
    introMessage.style.left = shiftElement(".gameStart", "--left")
    beginPlay(boardLevelElems, loop)

  }else{
    introScreen.style.opacity="1.0"
    choiceDialog.style.opacity="1.0"
  }
}, false)

/* Remove the round announcement message animation */
introMessage.addEventListener("animationend", e => {
  introMessage.classList.remove("slideRight")

  document.querySelector(".completed").classList.remove("slideLeft")
  document.querySelector(".completed").classList.add("slideLeft1")

  introMessage.style.left="620vw"
}, false)

// Start splash screen fadeout
introScreen.addEventListener("animationstart", e => {
  if(splashToLevel){
    level.style.left = shiftElement(".z-order", "--left")
    level.classList.add("intro-fadein")
    document.querySelector("body").style.backgroundColor=shiftElement(".z-order", "--body-bg")
    startGame(boardLevelElems, randomize)// end of startGame
  }// if
}, false)

let game //Game board state
let startTime //Current delta time
let previousTime // Previous delta time

const boardLevelElems = {
labelScore: document.querySelector(".flex-item-score"),
labelTime: document.querySelector(".flex-item-time"),
labelResult: document.querySelector(".confirm"),
btnGenerator: document.querySelector("#gen"),
labelExpr: document.querySelector("#exp"),
audio: document.querySelector("#game_sound")
}
Object.freeze(boardLevelElems)

// Splash screen intro music
const intro = boardLevelElems.audio
intro.src = sounds[3]
// Generates two random integers
const randomize = (lower, upper) => {
  const range = upper - lower + 1
  const rand1 = Math.random()
  const rand2 = Math.random()

  const num1 = Math.floor(rand1 * range) + lower
  const num2 =  Math.floor(rand2 * range) + lower
  return [num1, num2]
}
