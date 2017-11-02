describe("3D object implementation", () => {

    beforeEach(() => {
        fixture.setBase("test");
        fixture.load("tres.fixture.html");
    });

    afterEach(() => {
        fixture.cleanup();
    });

    let TRES = window.TRES;
    let MeshMaker = window.MeshMaker;
    let Matrix4x4Library = window.Matrix4x4Library;
    let sphereMesh = MeshMaker.sphere().toRawLineArray();
    let sphereNormals = MeshMaker.sphere().toNormalArray();
    let boxMesh = MeshMaker.cube().toRawLineArray();
    let color = { r: 0.0, g: 0.5, b: 0.0 };
    let green = { r: 0.0, g: 1.0, b: 0.0 };
    let red = { r: 1.0, g: 0.0, b: 0.0 };

    it("should correctly instantiate a 3d object", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let tres = new TRES(sphereMesh, gl.LINES, color, gl);

        expect(tres.mesh).toEqual(sphereMesh);
        expect(tres.mode).toEqual(gl.LINES);
        expect(tres.color).toEqual(color);
        expect(tres.gl).toEqual(gl);

        expect(tres.children).toEqual([]);
        expect(tres.transformationMatrix).toEqual(new window.Matrix4x4Library.Matrix());
        expect(tres.finalTransformationMatrix).toEqual(new window.Matrix4x4Library.Matrix());
        expect(tres.buffer).toEqual([]);
        expect(tres.colorBuffer).toEqual([]);

    });

    it("should correctly set its scale and update its local tranformation matrix", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let sphereB = new TRES(sphereMesh, gl.LINES, color, gl);
        sphereB.scale({ sx: 0.5, sy: 0.6, sz: 0.7 });
        expect(sphereB.transformationMatrix).toEqual(Matrix4x4Library.getScaleMatrix(0.5, 0.6, 0.7));
    });

    it("should correctly set its rotation and update its local tranformation matrix", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let sphereB = new TRES(sphereMesh, gl.LINES, color, gl);
        sphereB.rotate({ angle: 20, x: 0.9, y: 0.5, z: 0.7 });
        expect(sphereB.transformationMatrix).toEqual(
            Matrix4x4Library.getRotationMatrix(20, 0.9, 0.5, 0.7)
        );
    });

    it("should correctly set its translation and update its local tranformation matrix", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let sphereB = new TRES(sphereMesh, gl.LINES, color, gl);
        sphereB.translate({ tx: 0.8, tz: 0.6});
        expect(sphereB.transformationMatrix).toEqual(
            Matrix4x4Library.getTranslationMatrix(0.8, 0, 0.6)
        );
    });

    it("should default its transformationMatrix to the identity matrix if no tranforms are applied", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let sphereB = new TRES(sphereMesh, gl.LINES, color, gl);

        expect(sphereB.transformationMatrix).toEqual(
            new Matrix4x4Library.Matrix()
        );

    });

    it("should correctly set its projection", () => {
        let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
        let sphereB = new TRES(sphereMesh, gl.LINES, color, gl);
        sphereB.projection(window.Matrix4x4Library.getOrthgraphicProjectionMatrix(
            -4, // aspect ratio
            4,
            -2,
            2,
            -10,
            10
        ).toFloat32Array());
        expect(sphereB.projectionMatrix).toEqual(window.Matrix4x4Library.getOrthgraphicProjectionMatrix(
            -4, // aspect ratio
            4,
            -2,
            2,
            -10,
            10
        ).toFloat32Array());
    });

    describe("adding a child", () => {

        it("should add the child to its child array", () => {
            let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));

            let parent = new TRES(sphereMesh, gl.LINES, green, gl);
            parent.translate({ tx: 0.1, ty: 0.3, tz: -7.0 });
            parent.scale({ sx: 1.7, sy: 1.7, sz: 1.7 });

            let child = new TRES(boxMesh, gl.LINES, red, gl);
            child.scale({ sx: 1.0, sz: 0.5 });


            expect(parent.children.length).toEqual(0);
            parent.addChild(child);
            expect(parent.children.length).toEqual(1);
            expect(parent.children[0]).toEqual(child);
            expect(parent.hasChild()).toBeTrue;
        });
    });

    describe("final tranformation matrix", () => {
        it("should be set correctly", () => {
            let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));

            let parent = new TRES(sphereMesh, gl.LINES, green, gl);
            parent.translate({ tx: 0.1, ty: 0.3, tz: -0.5 });

            let child = new TRES(boxMesh, gl.LINES, red, gl);
            child.scale({ sx: 1.0, sz: 0.5 });

            expect(child.finalTransformationMatrix).toEqual(new Matrix4x4Library.Matrix());

            child.setFinalTransformationMatrix(parent.transformationMatrix.multiply(child.transformationMatrix));

            let parentTranslate = Matrix4x4Library.getTranslationMatrix(0.1, 0.3, -0.5);

            expect(parentTranslate).toEqual(parent.transformationMatrix);

            let childScale = Matrix4x4Library.getScaleMatrix(1.0, 1.0, 0.5);

            expect(childScale).toEqual(child.transformationMatrix);

            let finalTranformation = parentTranslate.multiply(childScale);

            expect(child.finalTransformationMatrix).toEqual(
                finalTranformation
            );

        });
    });

    describe("tranformation set up and draw", () => {
        it("should be set up and executed correctly, without throwing any errors ", () => {
            let gl = window.GLSLUtilities.getGL(document.getElementById("hello-webgl"));
            let sphereB = new TRES(sphereMesh, gl.LINES, color, gl, sphereNormals, false);
            sphereB.translate({ tx: 0.8, tz: 0.6});
            sphereB.setFinalTransformationMatrix(sphereB.transformationMatrix);

            // before the set up, the colors haven't been expanded into an Array
            sphereB.setUp();
            expect(sphereB.color.length).toBeGreaterThan(3);
            // sphereB.draw(shaderProgram);

        });
    });

});
