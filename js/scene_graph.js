"use strict";

/**
 * Create and return the scene graph classes.
 * 
 * Based on scene_graph.js from cs349-specia, scaffolded by the course IAs.
 */
function createSceneGraph() {
    
    var SG_DEBUG_SHOW_BOUNDING_BOXES = false;
    
    /**
     * The abstract base scene graph node.
     * 
     * @param id a node identifier
     * @param parent the parent node
     */
    var GraphNode = function(id, parent) {
        // An identifier for this node.
        this.id = id;
        
        // The local transformation (relative to the parent) and
        // the global transformation (relative to the canvas).
        this.localTransformation = new AffineTransform();
        this.globalTransformation = new AffineTransform();
        
        // If a valid parent was passed in, save the parent, and add this
        // node as a child of the parent.
        this.parent = parent ? parent : null;
        if (this.parent) {
            this.parent.addChild(this);
        }
        
        // A list of child nodes.
        this.children = [];
        
        // The local bounding box of this node, in the local coordinate space.
        // Should be overridden by concrete child nodes.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
        
        // A list of listeners.
        this.listeners = [];
        
        // Whether this node should notify its listeners of updates.
        this.shouldNotifyListeners = true;
    }
    
    _.extend(GraphNode.prototype, {
        /**
         * Notify all listeners to update due to a change in this node.
         */
        notify: function() {
            if (this.shouldNotifyListeners) {
                _.each(this.listeners, function(listener) {
                    listener.update();
                });
            }
        },
        
        /**
         * Add a listener, if it hasn't already been added.
         * 
         * @param listener the listener to add
         */
        addListener: function(listener) {
            if (!_.contains(this.listeners, listener)) {
                this.listeners.push(listener);
            }
        },
        
        /**
         * Remove a listener, if it was previously added to this node.
         * 
         * @param listener the listener to remove
         */
        removeListener: function(listener) {
            this.listeners = _.without(this.listeners, listener);
        },
        
        /**
         * Add a child to this node, if it hasn't already been added.
         * 
         * Triggers an update of the global transformations in the node being added.
         * 
         * @param node the node to add
         */
        addChild: function(node) {
            if (!_.contains(this.children, node)) {
                this.children.push(node);
                
                // Set this node to be the child's parent
                node.parent = this;
                
                // Update the global transformations of the new child
                node.updateAllGlobalTransformations();
            }
        },
        
        /**
         * Remove a child from this node, if it was previously added to this node.
         * 
         * @param node the node to remove
         */
        removeChild: function(node) {
            this.children = _.without(this.children, node);
        },
        
        /**
         * Apply an AffineTransform to the Canvas context.
         * 
         * @param context the canvas context
         * @param transformation the affine transform
         */
        applyTransformationToContext: function(context, transformation) {
            context.transform(transformation.m00_, 
                transformation.m10_,
                transformation.m01_,
                transformation.m11_,
                transformation.m02_,
                transformation.m12_);
        },
        
        /**
         * Update the global transformation of this node only.
         */
        updateGlobalTransformation: function() {
            // If this is the root of the scene graph
            if (!this.parent) {
                // Update the global transformation with the local transformation
                this.globalTransformation.copyFrom(this.localTransformation);
            }

            // Otherwise (if this is not the root of the scene graph)
            else {
                // Clone the global transformation of the parent
                var parentGlobalTransformationClone = this.parent.globalTransformation.clone();

                // Concatenate it with this node's local transformation
                parentGlobalTransformationClone.concatenate(this.localTransformation);
                this.globalTransformation.copyFrom(parentGlobalTransformationClone);
            }
        },
        
        /**
         * Recursively update the global transformation of this node and those
         * of its children.
         */
        updateAllGlobalTransformations: function() {
            // Update this node's global transformation
            this.updateGlobalTransformation();
            
            // Update each child node's global transformations recursively
            _.each(this.children, function(node) {
                node.updateAllGlobalTransformations();
            });
        },
        
        /**
         * Render this node only.
         * 
         * @param context the Canvas context
         */
        renderLocal: function(context) {
            // Base implementation does nothing; concrete nodes should override
            // this and render themselves. 
        },
        
        /**
         * Recursively render this node and its children.
         * 
         * @param context the Canvas context
         */
        renderAll: function(context) {
            context.save();
            
            // Apply the local transformation
            this.applyTransformationToContext(context, this.localTransformation);
            
            // Render this node
            this.renderLocal(context);
            
            if (SG_DEBUG_SHOW_BOUNDING_BOXES) {
                context.save();

                // Draw the origin
                context.strokeStyle = this.color ? this.color : "black";
                context.beginPath();
                context.lineWidth = 2;
                context.moveTo(-4,  4);
                context.lineTo( 4, -4);
                context.moveTo( 4,  4);
                context.lineTo(-4, -4);
                context.stroke();

                // Draw the bounding rect
                context.strokeStyle = this.color ? this.color : "black";
                context.lineWidth = 1;
                context.strokeRect(
                    /* x */ this.localBoundingBox.x,
                    /* y */ this.localBoundingBox.y,
                    /* w */ this.localBoundingBox.w,
                    /* h */ this.localBoundingBox.h
                );

                // Label the item
                context.font = "100% 'Karla', sans-serif";
                context.textAlign = "right";
                context.textBaseline = "middle";
                context.fillStyle = this._debug_colour;
                context.fillText(
                    /* string */ ' ' + this.id + ' ',
                    /* x      */ this.localBoundingBox.x,
                    /* y      */ this.localBoundingBox.y);

                context.restore();
            }
            
            // Render each child recursively
            _.each(this.children, function(child) {
                child.renderAll(context);
            })
            
            context.restore();
        },
        
        /**
         * Rotate this node and its children.
         * 
         * @param theta angle of rotation clockwise (in radians)
         * @param x x-coordinate of the centre of rotation
         * @param y y-coordinate of the centre of rotation
         */
        rotate: function(theta, x, y) {
            // Rotate the local transformation
            this.localTransformation.rotate(theta, x, y);
            
            // Recursively update the global transformations
            this.updateAllGlobalTransformations();
            
            // Notify listeners about the change
            this.notify();
        },
        
        /**
         * Translate this node and its children.
         * 
         * @param dx amount to translate horizontally in the local coordinate space
         * @param dy amount to translate vertically in the local coordinate space
         */
        translate: function(dx, dy) {
            // Translate the local transformation
            this.localTransformation.translate(dx, dy);
            
            // Recursively update the global transformations
            this.updateAllGlobalTransformations();
            
            // Notify listeners about the change
            this.notify();
        },
        
        /**
         * Translate this node and its children with respect to the global coordinate space.
         * 
         * @param dx amount to translate horizontally in the global coordinate space
         * @param dy amount to translate vertically in the global coordinate space
         */
        translateAsGlobal: function(dx, dy) {
            // Transform the global deltas so that they are relative to the local
            // coordinate space
            var transformedPoints = [];
            this.globalTransformation.createInverse().transform(
                /* src    */ [0, 0, dx, dy],
                /* srcOff */ 0,
                /* dst    */ transformedPoints, 
                /* dstOff */ 0,
                /* numPts */ 2
            );
            
            // Calculate the delta in the local coordinate space
            var deltaX = transformedPoints[2] - transformedPoints[0];
            var deltaY = transformedPoints[3] - transformedPoints[1];
            
            // Translate in the local coordinate space
            this.translate(deltaX, deltaY);
        },
        
        /**
         * Scale this node and its children.
         * 
         * @param sy horizontal scaling factor
         * @param sy vertical scaling factor
         */
        scale: function(sx, sy) {
            // Scale the local transformation
            this.localTransformation.scale(sx, sy);
            
            // Recursively update the global transformations
            this.updateAllGlobalTransformations();
            
            // Notify listeners about the change
            this.notify();
        }
    });
    
    
    /**
     * The root node of the scene.
     * 
     * @param id a node identifier
     * @param parent the parent node
     */
    var RootNode = function(id, parent) {
        // Inherit the constructor of GraphNode
        GraphNode.apply(this, arguments);
        
        // Override the local bounding box
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 1000,
            h: 600
        };
    };
    
    // Inherit the other methods of GraphNode
    _.extend(RootNode.prototype, GraphNode.prototype);
    
    
    /**
     * A text node with the text "shneer".
     * 
     * @param id a node identifier
     * @param parent the parent node
     */
    var ShneerNode = function(id, parent) {
        GraphNode.apply(this, arguments);
        
        // Override the local bounding box        
        this.localBoundingBox = {
            x: -30,
            y: -10,
            w: 60,
            h: 20
        };
        
        // Randomly scale and translate the node
        var factor = Math.random() * 5;
        this.scale(
            factor,
            factor
        );
        this.translate(
            Math.random() * (this.parent.localBoundingBox.x + this.parent.localBoundingBox.w),
            Math.random() * (this.parent.localBoundingBox.y + this.parent.localBoundingBox.h) 
        );
        
        // Select a random colour for this shneer
        this.color = "hsl(" + Math.floor(Math.random() * 360) + ", 100%, 60%)";
    }
    
    _.extend(ShneerNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            context.save();
            
            // Render the word "shneer"
            context.font = "100% 'Karla', sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = this.color;
            context.fillText(
                /* string */ "shneer",
                /* x      */ this.localBoundingBox.x + this.localBoundingBox.w / 2,
                /* y      */ this.localBoundingBox.y + this.localBoundingBox.h / 2
            )
            
            context.restore();
        }
    });
    
    return {
        RootNode: RootNode,
        ShneerNode: ShneerNode
    }
}