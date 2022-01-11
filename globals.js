import Game from "./game.js"

export function setCookie(cookieName, cookieValue, exDays){
		 const date = new Date()
		 date.setTime(date.getTime() + (exDays*24*60*60*1000))	
		/* const expDate = "Thur, 01 Jan 1970 00:00:00 UTC"*/
		 let expires = "expires=" + date.toUTCString()
		 document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/"
	}
export function getCookie(cookieName){
		let name = cookieName + "="
		let decodedCookie = decodeURIComponent(document.cookie)		
		let ca = decodedCookie.split(";")
		for(let i = 0; i < ca.length; i++){
				let c = ca[i]
				while(c.charAt(0) == ' '){
					 c = c.substring(1)
				}	
				if(c.indexOf(name) == 0){
						return 	c.substring(name.length, c.length)	
				}
		}
		return ""
	}
	
export function checkCookie(cookieName, cookieValue){
	let value = getCookie(cookieName)
	if(value === ""){
		setCookie(cookieName , cookieValue, 1)
	}
	return value
}
	
export function getDomElem(elem){
		return document.querySelector(elem);
}
/*BOARD 1*/	
// Locations of ladders
const ladders = new Map([["03", "55"],["11", "49"],["13", "54"],["21","57"],["40", "78"],["53","87"]]) 
Object.freeze(ladders)
// Locations of snakes
const snakes = new Map([["36", "02"],["27","09"],["46", "15"],["74", "31"],["93", "70"],["95", "41"]])	
Object.freeze(snakes)
/* BOARD 2*/
const ladders2 = new Map([["01", "17"],["10", "30"],["11", "27"],["21", "39"],["35", "61"],["40", "58"],["45", "54"], ["69", "93"], ["76", "83"], ["84", "96"]])
const snakes2 = new Map([["20", "14"],["22", "05"],["28", "14"],["34", "17"],["46", "31"], ["51", "37"], ["70", "33"],["81", "58"], ["94", "77"], ["98","78"]])
/* BOARD 3 */
const ladders3 = new Map([["01", "44"], ["03","26"], ["08","30"], ["46","83"], ["69","86"], ["70","90"]])
const snakes3 = new Map([["15","07"], ["51","27"], ["77","24"], ["92","88"], ["94","74"],["98","20"]])
/* BOARD 4, 5 */
const ladders4 = new Map([["07","28"], ["21","60"], ["53","67"], ["64","96"], ["71","92"]])
const snakes4 = new Map([["22","16"], ["44","04"], ["51","32"], ["66","27"], ["89","49"], ["98","23"]])
export const sounds = ["app_src_main_res_raw_correct.mp3", "app_src_main_res_raw_incorrect.mp3", "app_src_main_res_raw_metalgong.mp3", "app_src_main_res_raw_intro.mp3", "app_src_main_res_raw_snake.mp3", "mixkit-sad-game-over-trombone-471.wav",
"mixkit-game-over-dark-orchestra-633.wav"]				
Object.freeze(sounds)

export const gameState = {
  difficulty: "Easy",
  gameOver: true,
  score: 0, 
  time: 300,
  index: "00", 
  correct: 0, 
  numOfMoves: 0,
  round: 1,
  totalTime: 0,
  isChallenge: 0
 }
 
export const recordedScores = {
		initials: ["AAA", "BBB", "CCC", "DDD", "EEE"],
		scores: ["5000", "4000", "3000", "2000", "1000"]
}


// Game mode choice buttons   
// Easy mode
export const easyMode =  document.querySelector("#easy");
// Hard mode
export const hardMode = document.querySelector("#hard");

// Menu buttons
// Challenge button
export const challengeButton = document.querySelector("#upgrade")
// Play button
export const playButton = document.querySelector("#play")
// Resume button
export const resumeButton = document.querySelector("#resume")
// High score buttonconst 
export const highScoreButton = document.querySelector("#high-score")
// Help button
export const helpButton = getDomElem("#help")

export const initialsIds = ["#pos-one", "#pos-two", "#pos-three", "#pos-four", "#pos-five"]
Object.freeze(initialsIds)

export const scoresIds = ["#pos-one-score", "#pos-two-score", "#pos-three-score", "#pos-four-score", "#pos-five-score"]
Object.freeze(scoresIds)

export const timeObj = {startTime: undefined, previousTime: 0, gameTime: 0}

export function loop(timestamp){
  if(timeObj.startTime == undefined)
    timeObj.startTime = timestamp

  const elapsed = timestamp - timeObj.startTime;
  if(timeObj.previousTime !== timestamp){
    let time = Math.min(0.001 * elapsed, timeObj.gameTime)
    if(!Game.game.started){
      timeObj.startTime = undefined
      time = 0
      Game.game.update(time)
    }else{
      Game.game.update(time)
    }// if-else

    if(elapsed < timeObj.gameTime){
      timeObj.previousTime = timestamp
      window.requestAnimationFrame(loop)
    }// if
  }// if
}// end loop

export {ladders, ladders2, ladders3, ladders4, snakes, snakes2, snakes3, snakes4}



