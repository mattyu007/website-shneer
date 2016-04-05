"use strict";

window.addEventListener("load", function() {
    // Create the model and the view modules
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    
    // Create the Shneer model and view
    var canvas = document.getElementById("canvas");
    var model = new modelModule.ShneerModel();
    var view = new viewModule.ShneerView(model, canvas);
})