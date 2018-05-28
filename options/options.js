/**
 * Created by Michael Chen on 2017-06-07.
 */

var username = document.getElementById("username");
var password = document.getElementById("password");
var form = document.getElementById("main-form");


form.onsubmit = doStuff;


function doStuff() {
    browser.storage.sync.set({
        credentials: {
            username: username.value,
            password: password.value
        }
        })
        .then(function(){
            console.log("Added credentials");
        })
}

browser.storage.sync.get("credentials")
    .then(function (result) {
        if (result.credentials) {
            username.value = result.credentials.username;
            password.value = result.credentials.password;
        } else {
            username.value = "";
            password.value = "";
        }
    });