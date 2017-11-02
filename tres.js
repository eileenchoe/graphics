/*
 * 3D object class
 */

(() => {

    class TRES {

        constructor(mesh, mode, color, gl, normal, emitsLight) {
            this.gl = gl;
            this.mesh = mesh;
            this.mode = mode;
            this.color = color;
            this.normals = normal;
            this.emitsLight = emitsLight;

            this.children = [];

            this.transformationMatrix = new window.Matrix4x4Library.Matrix();
            this.finalTransformationMatrix = new window.Matrix4x4Library.Matrix();

            this.projectionMatrix = new window.Matrix4x4Library.Matrix();
            this.cameraMatrix = new window.Matrix4x4Library.Matrix();

            this.buffer = [];
            this.colorBuffer = [];
            this.normalBuffer = [];
        }

        // projection and camera should only be set once, in the high level scene object
        projection (matrix) {
            this.projectionMatrix = matrix;
        }

        camera (matrix) {
            this.cameraMatrix = matrix;
        }

        scale (specs) {
            let sx = specs.sx || 1.0;
            let sy = specs.sy || 1.0;
            let sz = specs.sz || 1.0;

            let scaleMatrix = window.Matrix4x4Library.getScaleMatrix(sx, sy, sz);
            this.transformationMatrix = this.transformationMatrix.multiply(scaleMatrix);

        }

        rotate (specs) {
            let angle = specs.angle || 0.0;
            let x = specs.x || 0;
            let y = specs.y || 0;
            let z = specs.z || 0;

            let rotateMatrix = window.Matrix4x4Library.getRotationMatrix(angle, x, y, z);
            this.transformationMatrix = this.transformationMatrix.multiply(rotateMatrix);
        }

        translate (specs) {
            let tx = specs.tx || 0.0;
            let ty = specs.ty || 0.0;
            let tz = specs.tz || 0.0;

            let translateMatrix = window.Matrix4x4Library.getTranslationMatrix(tx, ty, tz);
            this.transformationMatrix = this.transformationMatrix.multiply(translateMatrix);
        }

        addChild(child) {
            this.children.push(child);
        }

        hasChild() {
            return this.children.length > 0;
        }

        // update the composition of its local and inherited transformations
        setFinalTransformationMatrix (m) {
            this.finalTransformationMatrix = m;
        }

        setUp() {
            // Converts mesh and color to corresponding buffers assigned to 3d object.
            this.buffer = GLSLUtilities.initVertexBuffer(this.gl, this.mesh);
            if (this.color.length === this.mesh.length) {
                this.colorBuffer = GLSLUtilities.initVertexBuffer(this.gl, this.color);
            } else {
                let colors = [];
                for (let i = 0, maxi = this.mesh.length / 3; i < maxi; i += 1) {
                    colors = colors.concat(
                        this.color.r,
                        this.color.g,
                        this.color.b
                    );
                }
                this.color = colors;
                this.colorBuffer = GLSLUtilities.initVertexBuffer(this.gl, colors);
                this.normalBuffer = GLSLUtilities.initVertexBuffer(this.gl, this.normals);
            }
        }

        draw (shaderProgram) {

            this.gl.useProgram(shaderProgram);
            let vertexPosition = this.gl.getAttribLocation(shaderProgram, "vertexPosition");
            this.gl.enableVertexAttribArray(vertexPosition);
            let vertexColor = this.gl.getAttribLocation(shaderProgram, "vertexColor");
            this.gl.enableVertexAttribArray(vertexColor);
            let normalVector = this.gl.getAttribLocation(shaderProgram, "normalVector");
            this.gl.enableVertexAttribArray(normalVector);

            let modelViewMatrix = this.gl.getUniformLocation(shaderProgram, "modelViewMatrix");
            let projectionMatrix = this.gl.getUniformLocation(shaderProgram, "projectionMatrix");
            let cameraMatrix = this.gl.getUniformLocation(shaderProgram, "cameraMatrix");

            let lightPosition = this.gl.getUniformLocation(shaderProgram, "lightPosition");
            let lightDiffuse = this.gl.getUniformLocation(shaderProgram, "lightDiffuse");
            let lightEmitted = this.gl.getUniformLocation(shaderProgram, "lightEmitted");

            if (this.emitsLight) {
                this.gl.uniform3fv(lightEmitted, [1, 1, 0.3]);
            } else {
                this.gl.uniform3fv(lightEmitted, [0, 0, 0]);
            }

            this.gl.uniform3fv(lightPosition, [0.0, 0.5, 0]);
            this.gl.uniform3fv(lightDiffuse, [1.0, 1.0, 1.0]);

            this.gl.uniformMatrix4fv(projectionMatrix, this.gl.FALSE, this.projectionMatrix.toFloat32Array());
            this.gl.uniformMatrix4fv(cameraMatrix, this.gl.FALSE, this.cameraMatrix.toFloat32Array());

            // Set the varying colors.
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
            this.gl.vertexAttribPointer(vertexColor, 3, this.gl.FLOAT, false, 0, 0);

            this.gl.uniformMatrix4fv(modelViewMatrix, this.gl.FALSE, this.finalTransformationMatrix.toFloat32Array());

            // Set the varying normal vectors.
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(normalVector, 3, this.gl.FLOAT, false, 0, 0);

            // Set the varying vertex coordinates.
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            this.gl.vertexAttribPointer(vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.drawArrays(this.mode, 0, this.mesh.length / 3);
        }

    }

    window.TRES = TRES;

})();
