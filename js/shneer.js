"use strict";

window.addEventListener("load", function() {
    // Create the model and the view modules
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    
    // Create the Shneer model and view
    var canvas = document.getElementById("canvas");
    var model = new modelModule.ShneerModel();
    var view = new viewModule.ShneerView(model, canvas);
    
    // Hook up the Add Shneer button
    document.getElementById("add-shneer").addEventListener("click", function() {
        model.addShneer(view);
    });
    
    // Hook up the Remove Shneer button
    document.getElementById("remove-shneer").addEventListener("click", function() {
        model.removeShneer();
    })
    
    // Resize the canvas to fit the viewport exactly
    var resizeHandler = function() {
        view.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resizeHandler);
    
    resizeHandler();
})