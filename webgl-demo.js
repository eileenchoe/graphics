((canvas) => {

    let Matrix4x4Library = window.Matrix4x4Library;
    let TRES = window.TRES;
    let MeshMaker = window.MeshMaker;


    // Grab the WebGL rendering context.
    let gl = GLSLUtilities.getGL(canvas);
    if (!gl) {
        alert("No WebGL context found...sorry.");
        // No WebGL, no use going on...
        return;
    }

    // Set up settings that will not change.
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Initialize the shaders.
    let abort = false;
    let shaderProgram = GLSLUtilities.initSimpleShaderProgram(
        gl,
        $("#vertex-shader").text(),
        $("#fragment-shader").text(),

        // Very cursory error-checking here...
        (shader) => {
            abort = true;
            alert("Shader problem: " + gl.getShaderInfoLog(shader));
        },

        // Another simplistic error check: we don't even access the faulty
        // shader program.
        () => {
            abort = true;
            alert("Could not link shaders...sorry.");
        }
    );

    // If the abort variable is true here, we can't continue.
    if (abort) {
        alert("Fatal errors encountered; we cannot continue.");
        return;
    }

    let animationActive = true;
    let previousTimestamp = null;
    let currentRotation = 0.0;

    let t = Math.PI;
    let z = 0;

    class planet {
        constructor (name, radius) {
            this.radius = radius;
            this.x = 0;
            this.y = 0;
            this.diffx = 0;
            this.diffy = 0;
            this.name = name;
        }

        updateLocation(t) {
            let newX = this.radius * Math.cos(t);
            let newY = -this.radius * Math.sin(t);

            this.diffx = this.x - newX;
            this.diffy = this.y - newY;

            this.x = newX;
            this.y = newY;
        }
    }

    let planets = {
        mercury: new planet("mercury", 28),
        venus: new planet("venus", 15),
        earth: new planet("earth", 20),
        mars: new planet("mars", 45),
        jupiter: new planet("jupiter", 4),
        saturn: new planet("saturn", 9),
        uranus: new planet("uranus", 29),
        neptune: new planet("neptune", 33)
    };


    // https://www.universetoday.com/15462/how-far-are-the-planets-from-the-sun/
    // https://nssdc.gsfc.nasa.gov/planetary/factsheet/\

    // dist - average distance from the sun in AU
    // diameter - planet diameter in km

    const PLANET_INFO = {
        mercury: { dist: .387, diameter: 4879 },
        venus: { dist: .722, diameter: 12104 },
        earth: { dist: 1, diameter: 12756 },
        mars: { dist: 1.52, diameter: 6792 },
        jupiter: { dist: 5.20, diameter: 142984 },
        saturn: { dist: 9.58, diameter: 120536 },
        uranus: { dist: 19.2, diameter: 51118 },
        neptune: { dist: 30.1, diameter: 49528 }
    };

    let mercuryScale = PLANET_INFO.mercury.diameter / PLANET_INFO.jupiter.diameter;
    let venusScale = PLANET_INFO.venus.diameter / PLANET_INFO.jupiter.diameter;
    let earthScale = PLANET_INFO.earth.diameter / PLANET_INFO.jupiter.diameter;
    let marsScale = PLANET_INFO.mars.diameter / PLANET_INFO.jupiter.diameter;
    let jupiterScale = PLANET_INFO.jupiter.diameter / PLANET_INFO.jupiter.diameter;
    let saturnScale = PLANET_INFO.saturn.diameter / PLANET_INFO.jupiter.diameter;
    let uranusScale = PLANET_INFO.uranus.diameter / PLANET_INFO.jupiter.diameter;
    let neptuneScale = PLANET_INFO.neptune.diameter / PLANET_INFO.jupiter.diameter;

    const FRAMES_PER_SECOND = 60;
    const MILLISECONDS_PER_FRAME = 10000 / FRAMES_PER_SECOND;

    const DEGREES_PER_MILLISECOND = 0.033;
    const FULL_CIRCLE = 360.0;

    // MESHES
    let sphereRawMesh = MeshMaker.sphere(2);
    let sphereMesh = sphereRawMesh.toRawTriangleArray();
    let sphereNormals = sphereRawMesh.toNormalArray();

    let ringPoints = [[1.5, 0.1, 0], [2, 0.1, 0], [2.5, 0, 0], [2, -0.1, 0], [1.5, 0.1, 0]];
    let ringRawMesh = MeshMaker.lathe(ringPoints, 30);
    let ringMesh = ringRawMesh.toRawTriangleArray();
    let ringNormals = ringRawMesh.toNormalArray();

    // COLORS
    let yellow = { r: 1.0, g: 1.0, b: 0 / 255 };
    let purple = { r: 230 / 255, g: 130 / 255, b: 238 / 255};

    let neptuneBlue = { r: 92 / 255, g: 134 / 255, b: 228 / 255};
    let saturnYellow = { r: 245 / 255, g: 192 / 255, b: 68 / 255 };
    let uranusBlue = { r: 204 / 255, g: 243 / 255, b: 246 / 255 };
    let jupiterBrown = { r: 184 / 255, g: 168 / 255, b: 144 / 255 };

    let mercuryGrey = { r: 105 / 255, g: 105 / 255, b: 105 / 255 };
    let marsRed = { r: 162 / 255, g: 91 / 255, b: 62 / 255 };
    let venusOrange = { r: 197 / 255, g: 124 / 255, b: 5 / 255 };
    let earthBlue = { r: 53 / 255, g: 68 / 255, b: 155 / 255};

    // PERSPECTIVE PROJECTION Matrix
    // let orthographicProjMatrix = window.Matrix4x4Library.getPerspectiveProjectionMatrix(
    //     -12,
    //     12,
    //     -4,
    //     4,
    //     -15,
    //     15
    // );

    // ORTHOGRAPHIC PROJECTION MATRIX
    let orthographicProjMatrix = window.Matrix4x4Library.getOrthgraphicProjectionMatrix(
        -12,
        12,
        -4,
        4,
        -15,
        15
    );

    let cameraP = { x: 0, y: 0, z: 0 };

    // CAMERA Matrix
    let cameraMatrix = window.Matrix4x4Library.getCameraMatrix(
        cameraP.x, cameraP.y, cameraP.z,
        0, cameraP.y, -1,
        0, 1, 0
    );
    // let cameraMatrix = new window.Matrix4x4Library.Matrix();

    // 3D OBJECT CREATION
    let scene = new TRES(); // high level 3d object. its children are the 3d objects to draw.
    scene.projection(orthographicProjMatrix);
    scene.camera(cameraMatrix);

    let mercury = new TRES(sphereMesh, gl.TRIANGLES, mercuryGrey, gl, sphereNormals, false);
    mercury.setUp();
    mercury.scale({sx: mercuryScale, sy: mercuryScale, sz: mercuryScale});

    let venus = new TRES(sphereMesh, gl.TRIANGLES, venusOrange, gl, sphereNormals, false);
    venus.setUp();
    venus.scale({sx: venusScale, sy: venusScale, sz: venusScale});

    let saturn = new TRES(sphereMesh, gl.TRIANGLES, saturnYellow, gl, sphereNormals, false);
    saturn.setUp();
    saturn.scale({sx: saturnScale, sy: saturnScale, sz: saturnScale});
    saturn.rotate({angle: 8, x: 0.5, y: 0, z: 0 });

    let earth = new TRES(sphereMesh, gl.TRIANGLES, earthBlue, gl, sphereNormals, false);
    earth.setUp();
    earth.scale({sx: earthScale, sy: earthScale, sz: earthScale});

    let mars = new TRES(sphereMesh, gl.TRIANGLES, marsRed, gl, sphereNormals, false);
    mars.setUp();
    mars.scale({sx: marsScale, sy: marsScale, sz: marsScale});

    let jupiter = new TRES(sphereMesh, gl.TRIANGLES, jupiterBrown, gl, sphereNormals, false);
    jupiter.setUp();
    jupiter.scale({sx: jupiterScale, sy: jupiterScale, sz: jupiterScale});

    let uranus = new TRES(sphereMesh, gl.TRIANGLES, uranusBlue, gl, sphereNormals, false);
    uranus.setUp();
    uranus.scale({sx: uranusScale, sy: uranusScale, sz: uranusScale});

    let neptune = new TRES(sphereMesh, gl.TRIANGLES, neptuneBlue, gl, sphereNormals, false);
    neptune.setUp();
    neptune.scale({sx: neptuneScale, sy: neptuneScale, sz: neptuneScale});

    let ring = new TRES(ringMesh, gl.TRIANGLES, purple, gl, ringNormals, false);
    ring.setUp();

    let sun = new TRES(sphereMesh, gl.TRIANGLES, yellow, gl, sphereNormals, true);
    sun.setUp();
    sun.scale({sx: 0.75, sy: 0.75, sz: 0.75});

    saturn.addChild(ring);

    scene.addChild(mercury);
    scene.addChild(saturn);
    scene.addChild(earth);
    scene.addChild(sun);
    scene.addChild(mars);
    scene.addChild(venus);
    scene.addChild(jupiter);
    scene.addChild(uranus);
    scene.addChild(neptune);

    let advanceScene = (timestamp) => {
        // Check if the user has turned things off.
        if (!animationActive) {
            return;
        }

        // Initialize the timestamp.
        if (!previousTimestamp) {
            previousTimestamp = timestamp;
            window.requestAnimationFrame(advanceScene);
            return;
        }

        // Check if it's time to advance.
        var progress = timestamp - previousTimestamp;
        if (progress < MILLISECONDS_PER_FRAME) {
            // Do nothing if it's too soon.
            window.requestAnimationFrame(advanceScene);
            return;
        }

        // All clear.
        currentRotation += DEGREES_PER_MILLISECOND * progress;

        cameraMatrix = window.Matrix4x4Library.getCameraMatrix(
            cameraP.x, cameraP.y, cameraP.z,
            0, cameraP.y, -1,
            0, 1, 0
        );

        scene.camera(cameraMatrix);

        mercury.translate({tx: planets.mercury.diffx, ty: z, tz: planets.mercury.diffy});
        saturn.translate({tx: planets.saturn.diffx, ty: z, tz: planets.saturn.diffy});
        earth.translate({tx: planets.earth.diffx, ty: z, tz: planets.earth.diffy});
        mars.translate({tx: planets.mars.diffx, ty: z, tz: planets.mars.diffy});
        venus.translate({tx: planets.venus.diffx, ty: z, tz: planets.venus.diffy});
        jupiter.translate({tx: planets.jupiter.diffx, ty: z, tz: planets.jupiter.diffy});
        uranus.translate({tx: planets.uranus.diffx, ty: z, tz: planets.uranus.diffy});
        neptune.translate({tx: planets.neptune.diffx, ty: z, tz: planets.neptune.diffy});

        var transformStack = new Array();

        let drawObjects = (objects) => {
            let children = objects.children;
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                transformStack.push(child.transformationMatrix);
                if (child.hasChild()){
                    drawObjects(child);
                }
                let m = new Matrix4x4Library.Matrix();
                for (let j = transformStack.length - 1; j >= 0; j--) {
                    m = m.multiply(transformStack[j]);
                }
                transformStack.pop();
                child.projection(scene.projectionMatrix);
                child.camera(scene.cameraMatrix);
                child.setFinalTransformationMatrix(m);
                child.draw(shaderProgram);
                // need continue here so that eslint doesn't complain about shaderProgram not being used
                continue;
            }
        };

        let drawScene = () => {
            // Clear the display.
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            drawObjects(scene);

            // All done.
            gl.flush();
        };

        drawScene();

        t += 0.1;

        planets.earth.updateLocation(t);
        planets.saturn.updateLocation(t);
        planets.mars.updateLocation(t);
        planets.mercury.updateLocation(t);
        planets.venus.updateLocation(t);
        planets.jupiter.updateLocation(t);
        planets.uranus.updateLocation(t);
        planets.neptune.updateLocation(t);

        if (currentRotation >= FULL_CIRCLE) {
            currentRotation -= FULL_CIRCLE;
        }

        if (t > 2 * Math.PI) {
            t = 0;
        }

        // Request the next frame.
        previousTimestamp = timestamp;
        window.requestAnimationFrame(advanceScene);
    };

    // Draw the initial scene.
    advanceScene();

    // Animation Toggle Using Buttons
    $("#start").click(() => {
        $("#start").hide();
        $("#pause").toggle();
        animationActive = !animationActive;
        if (animationActive) {
            previousTimestamp = null;
            window.requestAnimationFrame(advanceScene);
        }
    });

    $("#pause").click(() => {
        $("#start").toggle();
        $("#pause").hide();
        animationActive = !animationActive;
        if (animationActive) {
            previousTimestamp = null;
            window.requestAnimationFrame(advanceScene);
        }
    });

    let leftArrowPressed = () => {
        cameraP.x += .1;
    };

    let rightArrowPressed = () => {
        cameraP.x -= .1;
    };

    let upArrowPressed = () => {
        cameraP.y -= .1;
    };

    let downArrowPressed = () => {
        cameraP.y += .1;
    };

    document.onkeydown = function(evt) {
        evt = evt || window.event;
        switch (evt.keyCode) {
        case 37:
            leftArrowPressed();
            break;
        case 39:
            rightArrowPressed();
            break;
        case 38:
            upArrowPressed();
            break;
        case 40:
            downArrowPressed();
            break;
        }
    };


})(document.getElementById("hello-webgl"));
