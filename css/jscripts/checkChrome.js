$(function () {

    var winNav = window.navigator;
    var vendorName = winNav.vendor;

    var isChrome = window.chrome;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    var usingChrome = isIOSChrome || isChrome !== null && typeof isChrome !== "undefined" && vendorName == "Google Inc." && isOpera === false && isIEedge === false;
    console.log(usingChrome);
    if (!usingChrome) {
        window.alert("Hello :) This website is best experienced in Chrome. Some features may not be full supported.");
    }
});