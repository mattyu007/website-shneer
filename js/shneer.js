'use strict';

var shneer = document.getElementById('shneer');

window.addEventListener('load', function() {
    setInterval(function() {
        shneer.innerText = shneer.innerText.replace("er", "eer");
    }, 20);
});