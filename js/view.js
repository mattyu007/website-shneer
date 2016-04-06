"use strict";

/**
 * Create and return the Shneer model class.
 * 
 * Based on view.js from cs349-specia, scaffolded by the course IAs.
 */

function createViewModule() {
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
        this.model.rootNode.addListener(this);
        _.each(this.model.shneerNodes, function(node) {
            node.addListener(self);
        });
    }
    
    _.extend(ShneerView.prototype, {
        /**
         * Resize the view.
         * 
         * @param width the target width for the canvas
         * @param height the target height for the canvas
         */
        resize: function(width, height) {
            // Resize the canvas
            this.canvas.width = width;
            this.canvas.height = height;
            
            // Tell the model to resize the root node 
            this.model.resizeScene(width, height);
        }
    });
    
    return {
        ShneerView: ShneerView
    };
}