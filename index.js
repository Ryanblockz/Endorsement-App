import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://endorsement-app-930ff-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsements")
const inputFieldEl = document.getElementById("input-field")
const publishButtonEl = document.getElementById("publishButton")
const fromInput = document.getElementById("from-input")
const toInput = document.getElementById('to-input')
const endorseList = document.getElementById('endorsement-list')

let endorsementMap = {}

endorseList.addEventListener('click', function (event) {
    let elementType = event.target.tagName

    if (elementType === "BUTTON") {

        console.log("MAP", endorsementMap)
        let eventID = event.target.id
        const endorsement = endorsementMap[eventID]

        let currentLikes = Number(endorsement.likes)

        if (!endorsement) {
            return
        }
        endorsement.likes = currentLikes + 1
        const endorsementRef = ref(database, `endorsements/${eventID}`)
        set(endorsementRef, JSON.stringify(endorsement))
    }
})


onValue(endorsementsInDB, function (snapshot) {
    if (!snapshot.val()) {
        return
    }
    let endorsementList = Object.entries(snapshot.val()).sort(function (a, b) {
        let endorsementValueA = JSON.parse(a[1])
        let endorsementValueB = JSON.parse(b[1])
        return endorsementValueB.likes - endorsementValueA.likes
    })
    console.log(endorsementList)

    clearEndorsementList()
    endorsementMap = {}
    for (let i = 0; i < endorsementList.length; i++) {
        let keyValueList = endorsementList[i]
        let endorsementKey = keyValueList[0]
        let endorsementValue = keyValueList[1]
        let endorsement = JSON.parse(endorsementValue)
        endorsementMap[endorsementKey] = endorsement
        addEndorsementsToDom(endorsement.from, endorsement.to, endorsement.message, endorsement.likes, endorsementKey)
    }
})

function clearInputs() {
    inputFieldEl.value = ""
    toInput.value = ""
    fromInput.value = ""
}

publishButtonEl.addEventListener('click', function addEndorsement() {
    let endorsement = {
        from: fromInput.value,
        to: toInput.value,
        message: inputFieldEl.value,
        likes: 0
    }
    push(endorsementsInDB, JSON.stringify(endorsement))

    clearInputs()
})


function clearEndorsementList() {
    endorseList.innerHTML = ""
}

function addEndorsementsToDom(from, to, message, likes, id) {

    let newEl =
        `<div id="endorsement-container">
            <h5>From ${from}</h5>
            <section> ${message}</section>
            <div id="toLikeContainer"> 
                <h5>To ${to} </h5>
                <div>
                <button class="likeButton" id="${id}">&#10084;</button>
                <span id="like-count">${likes}</span>
            </div>
        </div>`

    endorseList.innerHTML += newEl
}