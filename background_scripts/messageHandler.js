/**
 * Created by Axiaz on 2017-03-12.
 */


function handleMessage(request, sender, sendResponse) {
    return browser.tabs.query({active: true, currentWindow: true})
        .then(function (tabs) {
            return browser.tabs.sendMessage(tabs[0].id, request)
        })
        .then(function (response) {
            console.log(response);
            return {reponse: "meep"};
        })
}

browser.runtime.onMessage.addListener(handleMessage);
