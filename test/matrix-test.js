describe("Matrix implementation", () => {
    let Matrix4x4Library = window.Matrix4x4Library;

    it("should correctly instantiate the identity matrix", () => {
        let m = new Matrix4x4Library.Matrix();

        expect(m.elements).toEqual([
            1,
            0,
            0,
            0,

            0,
            1,
            0,
            0,

            0,
            0,
            1,
            0,

            0,
            0,
            0,
            1
        ]);
    });

    it("should correctly convert its elements into a float 32 array, for direct use by WebGL/GLSL", () => {
        let m = new Matrix4x4Library.Matrix();
        expect(m.toFloat32Array()).toEqual(new Float32Array(m.elements));
    });

    it("should correctly instantiate the rotation matrix", () => {
        let m = Matrix4x4Library.getRotationMatrix(20, 1, 2, 3);
        expect(m.elements).toEqual([
            0.9440002907297721,
            0.2828415246805782,
            -0.16989444669697615,
            0,

            -0.26561084490512343,
            0.9569233005613632,
            0.11725474792746571,
            0,

            0.19574046636015827,
            -0.0655627086011015,
            0.9784616502806815,
            0,

            0,
            0,
            0,
            1
        ]);
    });

    it("should correctly instantiate the translation matrix", () => {
        let m = Matrix4x4Library.getTranslationMatrix(1, 2, 3);
        expect(m.elements).toEqual([
            1,
            0,
            0,
            0,

            0,
            1,
            0,
            0,

            0,
            0,
            1,
            0,

            1,
            2,
            3,
            1
        ]);
    });

    it("should correctly instantiate the scale matrix", () => {
        let m = Matrix4x4Library.getScaleMatrix(1, 2, 3);
        expect(m.elements).toEqual([
            1,
            0,
            0,
            0,

            0,
            2,
            0,
            0,

            0,
            0,
            3,
            0,

            0,
            0,
            0,
            1
        ]);
    });

    it("should correctly instantiate the orthographic projection matrix", () => {
        let m = Matrix4x4Library.getOrthgraphicProjectionMatrix(1, 2, -1, 1, 1, 3);
        expect(m.elements).toEqual([2, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, -3, -0, -2, 1]);
    });

    it("should correctly instantiate the perspective projection matrix", () => {
        let m = Matrix4x4Library.getPerspectiveProjectionMatrix(3, 4, -2, 4, 3, 5);
        expect(m.elements).toEqual([6, 0, 0, 0, 0, 1, 0, 0, 7, 0.3333333333333333, -4, -1, 0, 0, -15, 0]);
    });

    it("should correctly perform matrix multiplication", () => {
        let a = Matrix4x4Library.getScaleMatrix(1, 2, 3);
        let b = Matrix4x4Library.getTranslationMatrix(1, 2, 3);
        let aMultiplyB = a.multiply(b);
        let bMultiplyA = b.multiply(a);

        expect(aMultiplyB.elements).toEqual([
            1,
            0,
            0,
            0,

            0,
            2,
            0,
            0,

            0,
            0,
            3,
            0,

            1,
            4,
            9,
            1
        ]);

        expect(bMultiplyA.elements).toEqual([
            1,
            0,
            0,
            0,

            0,
            2,
            0,
            0,

            0,
            0,
            3,
            0,

            1,
            2,
            3,
            1
        ]);

    });

});
