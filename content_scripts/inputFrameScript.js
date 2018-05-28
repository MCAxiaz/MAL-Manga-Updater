/**
 * Created by Axiaz on 2017-03-11.
 */

var form;
var subForm;
var username;
var password;
var notInList;
var plusOne;



function handleMessage(request, sender, sendResponse) {

    if (request==null || request.newID || request.update)
        return;

    plusOne = document.getElementById("plus_one");
    plusOne.onclick = addOne;

    console.log(request);
    document.title = request.malID;
    document.getElementById("link-to-mal").href = "https://myanimelist.net/manga/" + request.malID;
    document.getElementById("link-to-mal").textContent = request.title;
    document.getElementById(request.status).selected = true;
    document.getElementById("chapters_read").value = request.chapters;
    document.getElementById("total_chapters").textContent = "/" + request.totalChapters;
    document.getElementById("score").value = request.score;

    if (request.status == "0")
        notInList = true;
    else
        notInList = false;

    sendResponse({response: "MOOP"});
}

browser.runtime.onMessage.addListener(handleMessage);



function addOne() {
    document.getElementById("chapters_read").value++;
}


window.addEventListener("load", function(event) {
    form = document.getElementById("main-form");

    subForm = document.getElementById("sub-form");

    subForm.onsubmit = switchFrames;

    form.onsubmit = getCredentials;
});

function getCredentials() {
    browser.storage.sync.get("credentials")
        .then(function(results) {
                if (results.credentials) {
                    username = results.credentials.username;
                    password = results.credentials.password;
                    processStuff();
                }
                else
                    alert("Credentials Have Not Been Set")
            }
        );

    return false;
}

function processStuff() {
    var docString = constructPOSTParam();

    var xhr = new XMLHttpRequest();
    var auth = btoa(username+":"+password);

    var url;

    if (notInList)
        url = "https://myanimelist.net/api/mangalist/add/" + document.title + ".xml";
    else
        url = "https://myanimelist.net/api/mangalist/update/" + document.title + ".xml";

    if (document.getElementById("0").selected)
        url = "https://myanimelist.net/api/mangalist/delete/" + document.title + ".xml";


    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", "Basic " + auth);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        if (xhr.status == 200 || xhr.status == 201) {
            browser.runtime.sendMessage({update: {}})
                .then(function () {
                    console.log("finished updating");
                })
                .catch(function (err) {
                    console.log(err);
                })
        }
        else {
            alert("error updating");
        }
    };
    xhr.send("data=" + docString);
}

function switchFrames() {
    browser.runtime.sendMessage(null)
        .then(function (result) {
            console.log(result);
        })
        .catch(function (err) {
            console.log(err);
        })
}

function constructPOSTParam() {
    var formData = new FormData(form);

    var doc = document.implementation.createDocument (null, 'entry', null);
    var docRoot = doc.documentElement;

    var status = document.createElement("status");
    var statusVal = document.createTextNode(formData.get("status"));
    status.appendChild(statusVal);

    var chapter = document.createElement("chapter");
    var chapterVal = document.createTextNode(formData.get("chapter"));
    chapter.appendChild(chapterVal);

    var score = document.createElement("score");
    var scoreVal = document.createTextNode(formData.get("score"));
    score.appendChild(scoreVal);

    docRoot.appendChild(status);
    docRoot.appendChild(chapter);
    docRoot.appendChild(score);

    return (new XMLSerializer()).serializeToString(doc);
}