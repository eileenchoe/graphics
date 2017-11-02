(() => {

    class Mesh {

        constructor (vertices, indices) {
            if (!arguments[0]) {
                this.vertices = [];
                this.indices = [];
            } else {
                this.vertices = vertices;
                this.indices = indices;
            }
        }

        addVertex (vertex) {
            this.vertices.push(vertex);
        }

        addIndex (index) {
            this.indices.push(index);
        }

        toRawTriangleArray () {
            let result = [];

            for (let i = 0, maxi = this.indices.length; i < maxi; i += 1) {
                for (let j = 0, maxj = this.indices[i].length; j < maxj; j += 1) {
                    result = result.concat(
                        this.vertices[this.indices[i][j]]
                    );
                }
            }

            return result;
        }

        toRawLineArray () {
            let result = [];
            let segmentsSoFar = { };

            for (let i = 0, maxi = this.indices.length; i < maxi; i += 1) {
                for (let j = 0, maxj = this.indices[i].length; j < maxj; j += 1) {
                    let fromIndex = this.indices[i][j];
                    let toIndex = this.indices[i][(j + 1) % maxj];
                    let oneKey = fromIndex + " " + toIndex;
                    let otherKey = toIndex + " " + fromIndex;
                    if (!segmentsSoFar[oneKey] && !segmentsSoFar[otherKey]) {
                        result = result.concat(
                            this.vertices[fromIndex],
                            this.vertices[toIndex]
                        );

                        segmentsSoFar[oneKey] = true;
                    }
                }
            }

            return result;
        }

        /*
         * Utility function for computing normal vectors based on indexed vertices.
         * The secret: take the cross product of each triangle.  Note that vertex order
         * now matters---the resulting normal faces out from the side of the triangle
         * that "sees" the vertices listed counterclockwise.
         *
         * The vector computations involved here mean that the Vector module must be
         * loaded up for this function to work.
         */
        toNormalArray () {
            var result = [];

            // For each face...
            for (var i = 0, maxi = this.indices.length; i < maxi; i += 1) {
                // We form vectors from the first and second then second and third vertices.
                var p0 = this.vertices[this.indices[i][0]];
                var p1 = this.vertices[this.indices[i][1]];
                var p2 = this.vertices[this.indices[i][2]];

                // Technically, the first value is not a vector, but v can stand for vertex
                // anyway, so...
                var v0 = new window.Vector(p0[0], p0[1], p0[2]);
                var v1 = new window.Vector(p1[0], p1[1], p1[2]).subtract(v0);
                var v2 = new window.Vector(p2[0], p2[1], p2[2]).subtract(v0);
                var normal = v1.cross(v2).unit;

                // We then use this same normal for every vertex in this face.
                for (var j = 0, maxj = this.indices[i].length; j < maxj; j += 1) {
                    result = result.concat(
                        [ normal.x, normal.y, normal.z ]
                    );
                }
            }

            return result;
        }

        /*
         * Another utility function for computing normals, this time just converting
         * every vertex into its unit vector version.  This works mainly for objects
         * that are centered around the origin.
         */
        toVertexNormalArray () {
            var result = [];

            // For each face...
            for (var i = 0, maxi = this.indices.length; i < maxi; i += 1) {
                // For each vertex in that face...
                for (var j = 0, maxj = this.indices[i].length; j < maxj; j += 1) {
                    var p = this.vertices[this.indices[i][j]];
                    var normal = new window.Vector(p[0], p[1], p[2]).unit;
                    result = result.concat(
                        [ normal.x, normal.y, normal.z ]
                    );
                }
            }

            return result;
        }

    }

    // Beginning of the mesh-maker library of functions

    /*
     * Returns the vertices for a small icosahedron.
     */
    let icosahedron = () => {
        // The core icosahedron coordinates.
        const X = 0.525731112119133606;
        const Z = 0.850650808352039932;

        let vertices = [
            [ -X, 0.0, Z ],
            [ X, 0.0, Z ],
            [ -X, 0.0, -Z ],
            [ X, 0.0, -Z ],
            [ 0.0, Z, X ],
            [ 0.0, Z, -X ],
            [ 0.0, -Z, X ],
            [ 0.0, -Z, -X ],
            [ Z, X, 0.0 ],
            [ -Z, X, 0.0 ],
            [ Z, -X, 0.0 ],
            [ -Z, -X, 0.0 ]
        ];

        let indices = [
            [ 1, 4, 0 ],
            [ 4, 9, 0 ],
            [ 4, 5, 9 ],
            [ 8, 5, 4 ],
            [ 1, 8, 4 ],
            [ 1, 10, 8 ],
            [ 10, 3, 8 ],
            [ 8, 3, 5 ],
            [ 3, 2, 5 ],
            [ 3, 7, 2 ],
            [ 3, 10, 7 ],
            [ 10, 6, 7 ],
            [ 6, 11, 7 ],
            [ 6, 0, 11 ],
            [ 6, 1, 0 ],
            [ 10, 1, 6 ],
            [ 11, 0, 9 ],
            [ 2, 11, 9 ],
            [ 5, 2, 9 ],
            [ 11, 2, 7 ]
        ];

        return new Mesh(vertices, indices);
    };

    let cube = () => {
        // The core icosahedron coordinates.
        const X = 0.5;
        const Y = 0.5;
        const Z = 0.5;

        let vertices = [
            [ -X, Y, -Z ],
            [ -X, -Y, -Z ],
            [ X, Y, -Z ],
            [ X, -Y, -Z ],
            [ X, -Y, Z ],
            [ X, Y, Z ],
            [ -X, Y, Z ],
            [ -X, -Y, Z ]
        ];

        // maybe double check that its counter clockwise...

        let indices = [
            [ 0, 1, 2 ],
            [ 2, 3, 0 ],
            [ 2, 3, 5 ],
            [ 3, 4, 5 ],
            [ 4, 5, 6 ],
            [ 7, 4, 6 ],
            [ 7, 6, 0 ],
            [ 1, 7, 0 ],
            [ 0, 2, 6 ],
            [ 2, 5, 6 ],
            [ 1, 3, 7 ],
            [ 3, 4, 7 ]
        ];

        return new Mesh(vertices, indices);
    };


    // http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html
    let sphere = (numIterations) => {

        numIterations = numIterations || 2;

        // Use the vertices and indices from the icosahedron
        let vertices = icosahedron().vertices;
        let indices = icosahedron().indices;

        let sharpen = (vertices, indices) => {

            let sphereIndices = [];

            // begin putting the midpoints in at the end of the vertex array
            let midVertexIndex = vertices.length;

            let midVertices = new Object();

            // object with entries in form
            // key: {
            //     vertex: [x,y,z],
            //     index: indexInTheVerticesArray
            // }

            let midPointGenerator = (indexA, indexB) => {
                // sorts the indices
                let aLess = indexA < indexB;
                let v1 = aLess ? indexA : indexB;
                let v2 = aLess ? indexB : indexA;
                let midPointKey = v1 + ", " + v2;

                // simple hashmap-like data structure
                if (midVertices.hasOwnProperty(midPointKey)) {
                    return midVertices[midPointKey];
                } else {
                    let x = (vertices[indexA][0] + vertices[indexB][0]) / 2;
                    let y = (vertices[indexA][1] + vertices[indexB][1]) / 2;
                    let z = (vertices[indexA][2] + vertices[indexB][2]) / 2;

                    let length = Math.sqrt(x * x + y * y + z * z);
                    let vertex = [x / length, y / length, z / length];

                    let entry = {
                        vertex: vertex,
                        index: midVertexIndex
                    };
                    // save to data structure
                    midVertexIndex += 1;
                    midVertices[midPointKey] = entry;
                    vertices.push(vertex);
                    return entry;
                }
            };

            indices.forEach((face) => {

                let a = midPointGenerator(face[0], face[1]);
                let b = midPointGenerator(face[1], face[2]);
                let c = midPointGenerator(face[0], face[2]);

                sphereIndices.push([face[0], a.index, c.index]);
                sphereIndices.push([face[1], b.index, a.index]);
                sphereIndices.push([face[2], c.index, b.index]);
                sphereIndices.push([a.index, b.index, c.index]);
            });

            return {
                vertices: vertices,
                indices: sphereIndices
            };

        };

        let iterations = 0;
        let value = sharpen(vertices, indices);

        while (iterations < numIterations) {
            vertices = value.vertices;
            indices = value.indices;
            value = sharpen(vertices, indices);
            iterations++;
        }

        return new Mesh(value.vertices, value.indices);

    };

    // A basic lathe function. Rotates around the y axis. Takes in an array of points.

    let lathe = (points, segments, angleStart, angleEnd) => {
        segments = Math.floor(segments) || 12;
        angleStart = angleStart || 0.0;
        angleEnd = angleEnd || 360;

        let inverseSegments = 1 / segments;
        let indices = [];
        let vertices = points;
        let numPoints = points.length;

        for (let i = 0; i < segments; i++) {
            // get the rotation matrix at that angle, and about the y axis
            let angle = angleStart + (i + 1) * inverseSegments * angleEnd;
            let rotMat = window.Matrix4x4Library.getRotationMatrix(angle, 0, 1, 0).elements;

            // rotate the points, save the new vertex
            for (let j = 0; j < numPoints; j++) {
                vertices.push(rotMatMultiply(rotMat, points[j]));
            }

            // set up helpful indices to build indices array
            let startIndex = i * numPoints;
            let midIndex = startIndex + numPoints;

            // create the corresponding indices. 2 * (numPoints - 1) triangles should be created for each segment
            // loop through the number of points
            for (let offset = 0; offset < numPoints - 1; offset++) {
                let start = startIndex + offset;
                let mid = midIndex + offset;
                indices.push([start, mid, mid + 1]);
                indices.push([start, mid + 1, start + 1]);
            }
        }
        return new Mesh(vertices, indices);
    };

    // This should probably go into the matrix class as well.
    let rotMatMultiply = (rotMat, vec3) => {
        return [rotMat[0] * vec3[0] + rotMat[4] * vec3[1] + rotMat[8] * vec3[2],
            rotMat[1] * vec3[0] + rotMat[5] * vec3[1] + rotMat[9] * vec3[2],
            rotMat[2] * vec3[0] + rotMat[6] * vec3[1] + rotMat[10] * vec3[2]];
    };


    window.MeshMaker = {
        Mesh,
        icosahedron,
        sphere,
        cube,
        lathe
    };

})();
