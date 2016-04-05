"use strict";

/**
 * Create and return the Shneer model class.
 * 
 * Based on view.js from cs349-specia, scaffolded by the course IAs.
 */

function createView() {
    var ShneerView = function(model, canvas) {
        var self = this;
        
        // The Shneer model
        this.model = model;
        
        // The current canvas and context
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        
        // Callback for the scene graph to trigger a redraw of the scene
        this.update = function() {
            // Clear the canvas
            self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
            
            // Rerender the scene
            self.model.rootNode.renderAll(self.context);
        }
        
        // Add the view as a listener to all the nodes
        _.each(this.model.nodes, function(node) {
            node.addListener(self);
        });
    }
}