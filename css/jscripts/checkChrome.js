$(function () {
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    console.log(isChrome);
    if (!isChrome) {
        window.alert("Hello :) This website is best experienced in Chrome. Some features may not be full supported.");
    }
});