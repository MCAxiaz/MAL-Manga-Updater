/**
 * Created by Axiaz on 2017-03-03.
 */
var modal;
var normalModal;
var manualModal;
var batotoID;
var mangaName;

var username;
var password;

setupButton();
setupModal();




function hideModal() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        hideModal();
    }
};

function handleMessage(request, sender, sendResponse) {

    if (request == null)
        showManualInputDiv();
    else if (request.newID) {
        var obj = {};
        obj[batotoID] = request.newID;
        browser.storage.sync.set(obj)
            .then(function () {
                hideModal();
                sendResponse({response: "Done"});
            })
    } else if (request.update) {
        hideModal();
    }
}

browser.runtime.onMessage.addListener(handleMessage);

function setupModal() {
    modal = document.createElement("div");
    normalModal = document.createElement("div");
    manualModal = document.createElement("div");

    modal.className = "modal";
    normalModal.className = "modal-content";
    manualModal.className = "modal-content";

    setupFrame();
    modal.append(normalModal);
    modal.append(manualModal);
    document.body.append(modal);
}
function setupButton() {

    //gets the element to which the button is appended
    var ele = document.getElementsByClassName("ipsType_pagetitle")[0];

    var newbutton = document.createElement("img");
    newbutton.src = browser.extension.getURL("icons/mal-favi.ico");
    newbutton.style.cursor = "pointer";
    newbutton.title = "Update your manga list for this series";
    ele.append(newbutton);
    newbutton.onclick = getCredentials;
}
function setupFrame() {
    var iframe = document.createElement("iframe");
    iframe.src = browser.extension.getURL("content_scripts/inputFrame.html");
    iframe.frameBorder="0";
    iframe.height = "230px";

    normalModal.append(iframe);

    var manual_iframe = document.createElement("iframe");
    manual_iframe.src = browser.extension.getURL("content_scripts/manualFrame.html");
    manual_iframe.frameBorder="0";
    manual_iframe.height = "90px";

    manualModal.append(manual_iframe);
}

function showNormalDiv() {
    modal.style.display = "block";
    normalModal.style.display = "inline-block";
    manualModal.style.display = "none";
}
function showManualInputDiv() {
    modal.style.display = "block";
    manualModal.style.display = "inline-block";
    normalModal.style.display = "none";
}

function getCredentials() {
    browser.storage.sync.get("credentials")
        .then(function(results) {
                if (results.credentials) {
                    username = results.credentials.username;
                    password = results.credentials.password;
                    showModal();
                }
                else {
                    alert("Set credentials first");
                }
            }
        )
}

function showModal() {
    checkIDStorage()
        .then(function(malID) {
            getMangaInfo(malID);
        })
        .catch(function() {
            searchMAL();
        })
}
function checkIDStorage()   {
    return new Promise(function (fulfill, reject) {
        getBatotoID();

        browser.storage.sync.get(batotoID)
            .then(function (retrievedData) {
                if (retrievedData[batotoID]) {
                    fulfill(retrievedData[batotoID]);
                } else {
                    reject();
                }
            })
    })
}
function getBatotoID() {
    var ele = document.getElementsByClassName("ipsType_pagetitle")[0];
    mangaName = ele.innerText;
    mangaName = mangaName.substring(0, mangaName.length-1);
    batotoID = document.URL;
    var IDIndex = batotoID.lastIndexOf("-");
    batotoID = batotoID.substring(IDIndex+2);
}

function searchMAL() {

    var auth = btoa(username+":"+password);
    var requestURL = setRequestURL();
    var xhr = new XMLHttpRequest();

    xhr.open("GET", requestURL);
    xhr.setRequestHeader("Authorization", "Basic " + auth);
    xhr.onload = function() {
        if (xhr.status == 200) {
            var malID = parseResponse(xhr.responseXML);
            var IDIndex = batotoID.lastIndexOf("-");
            var obj = {};
            obj[batotoID] = malID;
            browser.storage.sync.set(obj)
                .then(function () {
                    getMangaInfo(malID);
                })
        } else if (xhr.status == 401) {
            alert("Invalid Credentials.");
        } else {
            showManualInputDiv();
        }
    };
    xhr.send();
}

function setRequestURL() {
    var url = "https://myanimelist.net/api/manga/search.xml?q=";
    url += mangaName;
    url = encodeURI(url);
    return url;
}

function parseResponse(response) {
    var malID = response.getElementsByTagName("id")[0].childNodes[0].nodeValue;
    return malID;
}



//Retrieves and Displays actual manga list details
function getMangaInfo(malID) {
    var url = "https://myanimelist.net/malappinfo.php?u=" + username + "&status=all&type=manga";
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.onload = function() {
        if (xhr.status == 200)
            displayMangaInfo(xhr.responseXML, malID);
    };
    xhr.send();
}

function displayMangaInfo(xmldoc, malID) {
    var idlist = xmldoc.getElementsByTagName("series_mangadb_id");
    var totalChapters = 0;
    var chapters = 0;
    var score = 0;
    var status = 0;
    var title = mangaName;


    for (var i = 0; i < idlist.length; i++) {
        if (idlist[i].childNodes[0].nodeValue == malID) {
            var parentNode = idlist[i].parentNode;
            totalChapters = parentNode.getElementsByTagName("series_chapters")[0].childNodes[0].nodeValue;
            chapters = parentNode.getElementsByTagName("my_read_chapters")[0].childNodes[0].nodeValue;
            score = parentNode.getElementsByTagName("my_score")[0].childNodes[0].nodeValue;
            status = parentNode.getElementsByTagName("my_status")[0].childNodes[0].nodeValue;
            title = parentNode.getElementsByTagName("series_title")[0].childNodes[0].nodeValue;
            break;
        }
    }

    setupDivInfo(totalChapters, chapters, score, status, title, malID);
}

function setupDivInfo(totalChapters, chapters, score, status, title, malID) {

    var infoObj = {
        title: title,
        totalChapters: totalChapters,
        chapters: chapters,
        score: score,
        status: status,
        malID: malID
    };

    browser.runtime.sendMessage(infoObj)
        .then(function (result) {
            showNormalDiv();
        })
        .catch(function (err) {
            console.log(err);
        })
}

