// ========================
// class for managing timerClock 
const workoutColor = 'black'
const restColor = 'red'
const currColor = 'blue'
let beepOn = true 
const longBeep = 300 
const shortBeep = 100
let repeatSchedule = true 

class TimerClockManager {
    constructor(timerClock, totalSeconds, workoutType) {
        this.timerClock = timerClock
        this.clockTime = document.createElement('h2')
        this.clockType = document.createElement('h3') 
        this.clockInterval = null 
        this.totalSeconds = totalSeconds || 0
        this.workoutType = workoutType || 'Workout'

        this.timerClock.appendChild(this.clockTime)
        this.timerClock.appendChild(this.clockType)

        // add buttons 
        this.timerStart = document.createElement('button')
        this.timerPause = document.createElement('button')
        this.timerReset = document.createElement('button')
        this.timerStart.innerText = 'Start'
        this.timerPause.innerText = 'Pause'
        this.timerReset.innerText = 'Reset'
        this.timerClock.appendChild(this.timerStart)
        this.timerClock.appendChild(this.timerPause)
        this.timerClock.appendChild(this.timerReset)

        this.timerStart.addEventListener('click',() => {
            this.startInterval()
        })
        this.timerPause.addEventListener('click',() => {
            this.stopInterval()
        })
        this.timerReset.addEventListener('click',() => {
            resetSchedule()
        })

        // load initial
        this.loadTimer(this.totalSeconds, this.workoutType)
    }

    renderClock() {
        // renders the clock using all the current settings
        // any change in the variables totalSeconds or workoutType will change how the timer is rendered (internal state instead of external input)
        this.loadTimer(this.totalSeconds, this.workoutType)
    }

    assignTimer(totalS, workoutT) {
        this.totalSeconds = cleanSeconds(totalS)
        this.workoutType = workoutT 
        this.renderClock()
    }

    loadTimer(totalS, workoutT) {
        // clean the totalSeconds variable 
        const totalSecs = cleanSeconds(totalS)
        // loads a given totalSeconds and workoutType as a method
        let clockStyle = `color:${workoutColor};border:1px solid ${workoutColor}`
        if (workoutT.toLowerCase() === 'rest') {
            clockStyle = `color:${restColor};border:1px solid ${restColor}`
        }
        this.clockTime.innerText = secondsToTime(totalSecs)
        this.clockType.innerText = workoutT
        this.timerClock.setAttribute('style', clockStyle)
    }

    startInterval() {
        // clear interval in case 
        clearInterval(this.clockInterval)

        // set interval and assign it to this.clockInterval
        // interval time is one seconds, 1000 ms 
        const intervalMS = 1000
        this.clockInterval = setInterval(() => {
            // everyone 1 seconds, check if the timer can go down 
            // if seconds is positive, subtract one and rerender
            // if negative or zero, stop the interval
            console.log('Current time is: ' + this.totalSeconds)

            // beeps on last 3 seconds 
            if (beepOn && this.totalSeconds <= 3 && this.totalSeconds >= 1) {
                beep(shortBeep)
            }

            if (this.totalSeconds > 0) {
                this.totalSeconds -= 1 
                this.clockTime.innerText = secondsToTime(this.totalSeconds)
            } else {
                // this.stopInterval() 
                nextTimer()
            }
        }, intervalMS)
    }

    stopInterval() {
        console.log('Clock stopped')
        clearInterval(this.clockInterval)
    }

}

// ========================
// timerClock variables & functions 
const timerClock = document.querySelector('#timerClock')

// use a class to manage the timerClock
// constructor loads the values and buttons into empty div
const tcManager = new TimerClockManager(timerClock, 0, 'Workout')


// ========================
// timerAdder functions 
const tATotalSeconds = document.querySelector('#timerAdder-totalSeconds')
const tAWorkoutType = document.querySelectorAll('input[name="workoutType"]')
const timerSchedule = document.querySelector('#timerSchedule')

// script to get the value of the correct radiobutton of taWorkoutType which is an array
function taWorkoutTypeGetValue() {
    console.log('in here')
    for (let i = 0; i < tAWorkoutType.length; i++) {
        console.log('checking', tAWorkoutType[i])
        if (tAWorkoutType[i].checked) return tAWorkoutType[i].value
    }
    return 'Workout'
}

// initialize value of stored vars to be equal of those in html 
// initial array of timers is empty 
let timerAddSeconds = tATotalSeconds.value 
let timerAddType = taWorkoutTypeGetValue() 
let timerSchArray = [] 
let timerCurrInd = 0 

// listener for form submit 
const timerAdderForm = document.querySelector('#timerAdderForm')
timerAdderForm.addEventListener('submit', (e) => {
    e.preventDefault()
    timerAdd()
    tcManager.stopInterval()
    renderSchedule()
})

// functions for timerAdder and timerSchedule
function timerAdd() {
    // add the totalSeconds and workoutType to an object and add it to an array 
    timerSchArray.push({
        totalSeconds: tATotalSeconds.value,
        workoutType: taWorkoutTypeGetValue()  
    })
    resetSchedule()
}

function renderSchedule() {
    // empty out timerSchedule first 
    timerSchedule.innerHTML = ''

    // assumes consistent schema for each timer 
    // timer.totalSeconds and timer.workoutType 
    timerSchArray.forEach((timer,ind) => {
        const newTimer = document.createElement('div')
        newTimer.setAttribute('class','scheduleTimer')
        
        const newSeconds = document.createElement('h4')
        newSeconds.innerText = timer.totalSeconds 
        const newType = document.createElement('h4')
        newType.innerText = timer.workoutType 

        newTimer.appendChild(newSeconds)
        newTimer.appendChild(newType)

        let clockStyle = `color:${workoutColor};border:1px solid ${workoutColor}`
        if (timer.workoutType.toLowerCase() === 'rest') {
            clockStyle = `color:${restColor};border:1px solid ${restColor}`
        }
        if (timerCurrInd === ind) {
            clockStyle = `color:${currColor};border:1px solid ${currColor}`
        }

        newTimer.setAttribute('style', clockStyle)

        // delete button that takes into account array index 
        const deleteButton = document.createElement('button')
        deleteButton.innerText = 'Delete'
        deleteButton.addEventListener('click', () => {
            // remove from array and rerender schedule 
            timerSchArray.splice(ind, 1)
            resetSchedule()
        })
        newTimer.appendChild(deleteButton)

        // add this new timer box to the timerSchedule div 
        timerSchedule.appendChild(newTimer)
    })
}


// functions to load up a timer, and to reset (load first timer)
function resetSchedule() {
    tcManager.stopInterval()
    console.log(timerSchArray)
    timerCurrInd = 0 
    if (timerSchArray.length > 0) {
        tcManager.assignTimer(timerSchArray[0].totalSeconds, timerSchArray[0].workoutType)
    }  
    renderSchedule()
}

// function that iterates through array 
// timerSchArray using timerCurrInd 
function nextTimer() {
    if (timerCurrInd < timerSchArray.length-1) {
        timerCurrInd += 1
    } else if (!repeatSchedule) {
        beep(longBeep)
        resetSchedule()
    } else {
        timerCurrInd = 0
    }

    console.log('timer index:', timerCurrInd)
    console.log('incoming timer:', timerSchArray[timerCurrInd])

    tcManager.assignTimer(timerSchArray[timerCurrInd].totalSeconds, timerSchArray[timerCurrInd].workoutType)

    renderSchedule()
}

// ========================
// helper functions 

function secondsToTime(secs) {
    // turns number of seconds into X:XX:XX 
    // 60 seconds to a minute, 3600 seconds to an hour
    
    if (secs < 0) {
        return 'Time negative!'
    }
    if (secs % 1 !== 0) {
        return 'Time not an integer value of seconds!'
    }

    const hours = Math.floor(secs/3600)
    const minutes = Math.floor((secs%3600)/60)
    const seconds = (secs%3600)%60

    return `${hours}:${minutes < 10 ? 0 : ''}${minutes}:${seconds < 10 ? 0 : ''}${seconds}`
}

function cleanSeconds(secs) {
    // force seconds to be an integer between 0 and 86400 inclusive
    if (typeof secs === 'string') secs = parseInt(secs)
    if (typeof secs !== 'number') return 0
    if (secs < 0) return 0
    if (secs > 86400) return 86400
    if (secs % 1 !== 0) return Math.floor(secs)
    return secs
}

// controls for sound - on off button changes volume to zero 
// button that turns beeps on and off
// button that turns repeat on and off 
const beepButton = document.querySelector('#beepButton')
const repeatButton = document.querySelector('#repeatButton')

function beepToggle() {
    beepOn = !beepOn 
    beepButton.innerText = `Beep ${beepOn ? 'On' : 'Off'}`
    if (beepOn) beep(longBeep)
}
function repeatToggle() {
    repeatSchedule = ! repeatSchedule
    repeatButton.innerText = `Repeat Timers ${repeatSchedule ? 'On' : 'Off'}`
}

beepButton.addEventListener('click', beepToggle)
repeatButton.addEventListener('click', repeatToggle)

// stored schedules div 
const storedSchedules = document.querySelector('#storedSchedules')
const storeThisSchedule = document.querySelector('#storeThisSchedule')
const storedSchList = document.querySelector('#storedSchList')
storeThisSchedule.addEventListener('click', storeSchedule)
displaySchedules()

// store current schedule to array then to local storage 
function storeSchedule() {
    console.log('store schedules')
    // grab the ONE, current schedule
    const currSchedule = timerSchArray 
    console.log('Storing: ', currSchedule)

    // try to grab the current storage array 
    const currStoredStr = localStorage.getItem('interval-workout-schedules') 
    const currStored = JSON.parse(currStoredStr)

    let newStored = []

    if (currStored) {
        // storage is not empty
        newStored = currStored
    }
    
    if (currSchedule.length > 0) newStored.push(currSchedule)
    localStorage.setItem('interval-workout-schedules', JSON.stringify(newStored))

    displaySchedules()
}

function displaySchedules() {
    console.log('display schedules')
    // reset list area 
    storedSchList.innerHTML = ''

    // load all from local storage and display
    const currStoredStr = localStorage.getItem('interval-workout-schedules') 
    const currStored = JSON.parse(currStoredStr)

    for (schInd in currStored) {
        // make an element that has the schedule info, and a delete button 
        const singleSch = document.createElement('div')
        singleSch.setAttribute('class', 'singleSchedule')

        for (timerInd in currStored[schInd]) {
            const timer = currStored[schInd][timerInd]
            const newTimer = document.createElement('span')
            newTimer.innerText = timer.totalSeconds + ' secs to ' + timer.workoutType + '; '
            newTimer.setAttribute('style', timer.workoutType !== 'Rest' ? 'color: black' : 'color: red')
            singleSch.appendChild(newTimer)    
        } // end of for loop over timers of one schedule 

        // load schedule to timerSchArray 
        const loadButton = document.createElement('button')
        loadButton.innerText = 'Load'
        singleSch.appendChild(loadButton)
        loadButton.addEventListener('click', () => {
            timerSchArray = currStored[schInd].slice()
            renderSchedule()
        })

        // delete button
        const delButton = document.createElement('button')
        delButton.innerText = 'Delete'
        delButton.setAttribute('value', schInd)
        singleSch.appendChild(delButton)
        delButton.addEventListener('click', e => {
            const delInd = e.target.value 
            // load in current array (whenever button is pressed)
            const currStoredStr = localStorage.getItem('interval-workout-schedules') 
            const currStored = JSON.parse(currStoredStr)
            console.log('Deleting index: ', delInd)
            // delete based on index schInd
            currStored.splice(delInd,1)
            localStorage.setItem('interval-workout-schedules', JSON.stringify(currStored))
            displaySchedules()
        })

        storedSchList.appendChild(singleSch)
    } // end of for loop over all schedules
    // no setItem at the end of display because no change (delButton has a callback)
}