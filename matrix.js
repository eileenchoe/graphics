/*
 * A 4x4 Matrix Library for 3D graphics application
 *
 */

(() => {
    class Matrix {
        constructor() {
            let m = arguments[0];
            if (!m) {
                m = [
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
                ];
            }
            this.elements = m;
        }

        multiply (m) {
            let result = [];
            let a = this.elements;
            let b = m.elements;
            let iA = 0;
            let iB = 0;

            for (let i = 0; i < 16; i++) {
                result[i] = a[iA] * b[iB] + a[iA + 4] * b[iB + 1] + a[iA + 8] * b[iB + 2] + a[iA + 12] * b[iB + 3];
                iA++;
                if (iA === 4) {
                    iA = 0;
                    iB += 4;
                }
            }
            return new Matrix(result);
        }

        // convenience function to prepare matrix data for direct consumption to WebGL/GLSL
        toFloat32Array() {
            return new Float32Array(this.elements);
        }
    }

    let getRotationMatrix = (angle, x, y, z) => {
        let axisLength = Math.sqrt(x * x + y * y + z * z);
        let s = Math.sin(angle * Math.PI / 180.0);
        let c = Math.cos(angle * Math.PI / 180.0);
        let oneMinusC = 1.0 - c;

        // Normalize the axis vector of rotation.
        x /= axisLength;
        y /= axisLength;
        z /= axisLength;

        // Now we can calculate the other terms.
        // "2" for "squared."
        let x2 = x * x;
        let y2 = y * y;
        let z2 = z * z;
        let xy = x * y;
        let yz = y * z;
        let xz = x * z;
        let xs = x * s;
        let ys = y * s;
        let zs = z * s;

        // GL expects its matrices in column major order.

        let elements = [
            x2 * oneMinusC + c,
            xy * oneMinusC + zs,
            xz * oneMinusC - ys,
            0.0,

            xy * oneMinusC - zs,
            y2 * oneMinusC + c,
            yz * oneMinusC + xs,
            0.0,

            xz * oneMinusC + ys,
            yz * oneMinusC - xs,
            z2 * oneMinusC + c,
            0.0,

            0.0,
            0.0,
            0.0,
            1.0
        ];

        return new Matrix(elements);
    };


    let getScaleMatrix = (sx, sy, sz) => {
        let elements = [
            sx,
            0,
            0,
            0,

            0,
            sy,
            0,
            0,

            0,
            0,
            sz,
            0,

            0,
            0,
            0,
            1
        ];
        return new Matrix(elements);
    };

    let getTranslationMatrix = (tx, ty, tz) => {
        let elements = [
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

            tx,
            ty,
            tz,
            1
        ];

        return new Matrix(elements);
    };

    let getOrthgraphicProjectionMatrix = (left, right, bottom, top, zNear, zFar) => {
        let width = right - left;
        let height = top - bottom;
        let depth = zFar - zNear;

        let elements = [
            2.0 / width,
            0.0,
            0.0,
            0.0,

            0.0,
            2.0 / height,
            0.0,
            0.0,

            0.0,
            0.0,
            -2.0 / depth,
            0.0,

            -(right + left) / width,
            -(top + bottom) / height,
            -(zFar + zNear) / depth,
            1.0
        ];

        return new Matrix(elements);
    };

    let getCameraMatrix = (px, py, pz, qx, qy, qz, ux, uy, uz) => {

        let p = new window.Vector(px, py, pz);
        let q = new window.Vector(qx, qy, qz);
        let u = new window.Vector(ux, uy, uz);

        let ze = p.subtract(q).unit;
        let ye = u.subtract(u.projection(ze)).unit;
        let xe = ye.cross(ze);

        let elements = [
            xe.x,
            ye.x,
            ze.x,
            0,

            xe.y,
            ye.y,
            ze.y,
            0,

            xe.z,
            ye.z,
            ze.z,
            0,

            -p.dot(xe),
            -p.dot(ye),
            -p.dot(ze),
            1
        ];

        return new Matrix(elements);

    };

    let getPerspectiveProjectionMatrix = (left, right, bottom, top, zNear, zFar) => {
        let elements = [
            2 * zNear / (right - left),
            0,
            0,
            0,

            0,
            2 * zNear / (top - bottom),
            0,
            0,

            (right + left) / (right - left),
            (top + bottom) / (top - bottom),
            -(zFar + zNear) / (zFar - zNear),
            -1,

            0,
            0,
            -(2 * zNear * zFar) / (zFar - zNear),
            0
        ];

        return new Matrix(elements);
    };

    window.Matrix4x4Library = {
        Matrix,
        getRotationMatrix,
        getScaleMatrix,
        getTranslationMatrix,
        getOrthgraphicProjectionMatrix,
        getPerspectiveProjectionMatrix,
        getCameraMatrix
    };

})();
