'use strict';

window.addEventListener('load', function() {
    var shneer = document.getElementById('shneer');
    var r = document.getElementById('r');

    setInterval(function() {
        var e = document.createElement('span');
        e.style.fontSize = (Math.random() * 100 + 50) + '%';
        e.innerText = Math.random() < 0.85 ? 'e' : 'E';
        
        shneer.insertBefore(e, r);
    }, 20);
});