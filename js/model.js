"use strict";

/**
 * Create and return the Shneer model class.
 * 
 * Based on model.js from cs349-specia, scaffolded by the course IAs.
 */

function createModelModule() {
    var ShneerModel = function() {
        var self = this;
        
        // Create the scene graph module
        this.sceneGraphModule = createSceneGraph();
        
        // The list of nodes
        this.nodes = [];
        
        // Create the scene graph
        this.rootNode = new this.sceneGraphModule.RootNode("scene");
        
        // Create the Shneer nodes
        for (var i = 0; i < 10; i++) {
            var node = new this.sceneGraphModule.ShneerNode("shneer" + i, this.rootNode);
            this.nodes.push(node);
        }
        
        // Function to determine if a node is inside the scene bounding box
        var NodeVisibility = {
            VISIBLE: 1,
            EXCEEDED_LEFT: 2,
            EXCEEDED_RIGHT: 3,
            EXCEEDED_TOP: 4,
            EXCEEDED_BOTTOM: 5
        };
        var visibilityInScene = function(node) {
            // Convert the node bounding box to be relative to the root scene
            var localBoundingBoxCorners = [
                /* TL.x */ node.localBoundingBox.x,
                /* TL.y */ node.localBoundingBox.y,
                /* TR.x */ node.localBoundingBox.x + node.localBoundingBox.w,
                /* TR.y */ node.localBoundingBox.y,
                /* BR.x */ node.localBoundingBox.x + node.localBoundingBox.w,
                /* BR.y */ node.localBoundingBox.y + node.localBoundingBox.h,
                /* BL.x */ node.localBoundingBox.x,
                /* BL.y */ node.localBoundingBox.y + node.localBoundingBox.h
            ];
            var globalBoundingBoxCorners = [];
            node.globalTransformation.transform(
                /* src    */ localBoundingBoxCorners,
                /* srcOff */ 0,
                /* dst    */ globalBoundingBoxCorners,
                /* dstOff */ 0,
                /* numPts */ 4
            );
            
            // Split globalBoundingBoxCorners into x and y arrays
            var globalX = [], globalY = [];
            for (var i = 0; i < 8; i++) {
                if (i % 2 == 0) {
                    globalX.push(globalBoundingBoxCorners[i]);
                }
                else {
                    globalY.push(globalBoundingBoxCorners[i]);
                }
            }
            
            // Determine if the node is inside the scene
            var visibility;
            if (_.max(globalX) < self.rootNode.localBoundingBox.x) {
                visibility = NodeVisibility.EXCEEDED_LEFT;
            }
            else if (_.min(globalX) > self.rootNode.localBoundingBox.x + self.rootNode.localBoundingBox.w) {
                visibility = NodeVisibility.EXCEEDED_RIGHT;
            }
            else if (_.max(globalY) < self.rootNode.localBoundingBox.y) {
                visibility = NodeVisibility.EXCEEDED_TOP;
            }
            else if (_.min(globalY) > self.rootNode.localBoundingBox.y + self.rootNode.localBoundingBox.h) {
                visibility = NodeVisibility.EXCEEDED_BOTTOM; 
            }
            else {
                visibility = NodeVisibility.VISIBLE;
            }
            
            return {
                visibility: visibility,
                globalWidth: _.max(globalX) - _.min(globalX),
                globalHeight: _.max(globalY) - _.min(globalY)
            }
        }
        
        // The animation loop
        var tick = function() {
            _.each(self.nodes, function(node) {
                node.shouldNotifyListeners = false;
                
                // Translate the node to the left
                node.translate(-3, 0);
                
                // Check if the node has fallen off the canvas
                var status = visibilityInScene(node);
                if (status.visibility == NodeVisibility.EXCEEDED_LEFT) {
                    // Translate the node back to the right
                    node.translateAsGlobal(self.rootNode.localBoundingBox.w + status.globalWidth, 0);
                    
                    // Randomly change the y-coordinate of the node as well
                    node.translateAsGlobal(0, (Math.random > 0.5 ? -1 : 1) * Math.random() * self.rootNode.localBoundingBox.h);
                }
                if (status.visibility == NodeVisibility.EXCEEDED_BOTTOM) {
                    node.translateAsGlobal(0, Math.random() * -self.rootNode.localBoundingBox.h);
                }
                else if (status.visibility == NodeVisibility.EXCEEDED_TOP) {
                    node.translateAsGlobal(0, Math.random * self.rootNode.localBoundingBox.h);
                }
                
                node.shouldNotifyListeners = true;
            });
            
            self.rootNode.notify();
            
            window.requestAnimationFrame(tick);
        }
        
        window.requestAnimationFrame(tick);
    }
    
    _.extend(ShneerModel.prototype, {
        /**
         * Add a new Shneer node to the scene.
         * 
         * @param listener the view to be notified of changes
         */
        addShneer: function(listener) {
            var node = new this.sceneGraphModule.ShneerNode("shneer", this.rootNode);
            node.addListener(listener);
            
            this.nodes.push(node);
        },
        
        /**
         * Remove a Shneer node from the scene, if any exist.
         */
        removeShneer: function() {
            // TODO
        },
        
        /**
         * Resize the root node.
         * 
         * @param width the target width
         * @param height the target height
         */
        resizeScene: function(width, height) {
            // Resize the root node
            this.rootNode.localBoundingBox.w = width;
            this.rootNode.localBoundingBox.h = height;
        }
    });
    
    return {
        ShneerModel: ShneerModel
    };
}