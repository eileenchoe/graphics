describe("window.MeshMaker implementation", () => {

    describe("Mesh object", () => {
        it("should initially be an empty mesh upon instantiation without arguments", () => {
            let mesh = new window.MeshMaker.Mesh();
            expect(mesh.vertices).toEqual([]);
            expect(mesh.indices).toEqual([]);
        });

        it("should add and access vertices and indices correctly", () => {
            let mesh = new window.MeshMaker.Mesh();
            mesh.addVertex([1, 2, 3]);
            mesh.addVertex([4, 5, 6]);
            mesh.addVertex([7, 8, 9]);
            mesh.addIndex([0, 1, 2]);

            expect(mesh.vertices).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);

            expect(mesh.indices).toEqual([
                [0, 1, 2]
            ]);
        });

        it("should instatiate the correct mesh when given vertices and indices as arguments", () => {
            let vertices = [
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ];
            let indices = [
                [0, 1, 2]
            ];

            let mesh = new window.MeshMaker.Mesh(vertices, indices);
            expect(mesh.vertices).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);
            expect(mesh.indices).toEqual([
                [0, 1, 2]
            ]);

        });

        it("should convert to raw triangle array correctly", () => {
            let mesh = new window.MeshMaker.Mesh(
                [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ],
                [
                    [0, 1, 2]
                ]
            );

            let triangleArray = mesh.toRawTriangleArray();
            expect(triangleArray).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });

        it("should convert to raw line array correctly", () => {
            let mesh = new window.MeshMaker.Mesh(
                [
                    [1, 2, 3],
                    [4, 5, 6],
                    [7, 8, 9]
                ],
                [
                    [0, 1, 2]
                ]
            );

            let lineArray = mesh.toRawLineArray();
            expect(lineArray).toEqual([1, 2, 3, 4, 5, 6, 4, 5, 6, 7, 8, 9, 7, 8, 9, 1, 2, 3]);
        });
    });

    describe("icosahedron", () => {
        it("should correctly create an icosahedron mesh", () => {
            let mesh = window.MeshMaker.icosahedron();
            expect(mesh.vertices.length).toEqual(12);
            expect(mesh.indices.length).toEqual(20);
            expect(mesh.vertices[0]).toEqual([ -0.525731112119133606, 0.0, 0.850650808352039932]);
            expect(mesh.vertices[5]).toEqual([0.0, 0.850650808352039932, -0.525731112119133606]);
            expect(mesh.indices[0]).toEqual([ 1, 4, 0 ]);
            expect(mesh.indices[9]).toEqual([3, 7, 2 ]);
        });
    });

    describe("sphere", () => {
        it("should correctly create a sphere mesh", () => {
            let mesh = window.MeshMaker.sphere();
            let mesh2 = window.MeshMaker.sphere(2);
            expect(mesh).toEqual(mesh2);
        });
    });

    describe("cube", () => {
        it("should correctly create a cube mesh", () => {
            let mesh = window.MeshMaker.cube();
            expect(mesh.vertices.length).toEqual(8);
            expect(mesh.indices.length).toEqual(12);
            expect(mesh.vertices[0]).toEqual([ -0.5, 0.5, -0.5]);
            expect(mesh.indices[3]).toEqual([ 3, 4, 5 ]);
        });
    });

    describe("lathe", () => {
        it("should correctly create a lathed mesh", () => {
            let mesh = window.MeshMaker.lathe([[.5, .5, .5], [.5, 0, .5], [.2, -.3, .3], [.2, -.9, .3]], 5);
            expect(mesh.vertices.length).toEqual(24);
            expect(mesh.indices.length).toEqual(30);
            expect(mesh.vertices[5]).toEqual([0.6300367553350505, 0, -0.32101976096010304]);
            expect(mesh.indices[9]).toEqual([5, 10, 6]);
        });
    });

});
