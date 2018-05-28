/**
 * Created by Axiaz on 2017-03-11.
 */

var form;
var subForm;

window.addEventListener("load", function(event) {
    form = document.getElementById("main-form");
    form.onsubmit = processStuff;
});


function processStuff() {
    var inputVal = document.getElementById("mal_id_input").value;
    console.log("MAL ID: " + inputVal);

    browser.runtime.sendMessage({newID: inputVal})
        .then(function (result) {
            //alert("ID succesfully updated");
            console.log("Updated storage");
        })
        .catch(function (err) {
            console.log(err);
            console.log("ERRROR MESSAGING");
        });

    return false;
}