import * as THREE from "three";
import {Mesh} from "three";

var textureLoader = new THREE.TextureLoader();

const loadMaterials = function (type) {
    switch (type) {
        case 0: // 泥土块
            return [
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                })
            ];
        case 1: // 草块
            return [
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/grass.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/grass_dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/grass_dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/grass_dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/grass_dirt.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/dirt.png')
                })
            ];
        case 2: // 砖块
            return [
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                }),
                new THREE.MeshLambertMaterial({
                    map: textureLoader.load('/textures/brick.png')
                })
            ];
    }
};

const createBox = function (x, y, z, type) {
    if (type !== 3) {
        let geometry = new THREE.BoxGeometry(100, 100, 100);
        let materials = loadMaterials(type);
        let result = new THREE.Mesh( geometry, materials );
        result.position.x = x;
        result.position.y = y;
        result.position.z = z;
        return result;
    } else {
        let geometry = new THREE.Geometry();
        let boxSize = 100;
        let innerBoxSize = boxSize / Math.sqrt(2);
        geometry.vertices = [
            new THREE.Vector3(innerBoxSize / 2, -boxSize / 2, innerBoxSize / 2),
            new THREE.Vector3(innerBoxSize / 2, -boxSize / 2, -innerBoxSize / 2),
            new THREE.Vector3(-innerBoxSize / 2, -boxSize / 2, -innerBoxSize / 2),
            new THREE.Vector3(-innerBoxSize / 2, -boxSize / 2, innerBoxSize / 2),

            new THREE.Vector3(innerBoxSize / 2, boxSize / 2, innerBoxSize / 2),
            new THREE.Vector3(innerBoxSize / 2, boxSize / 2, -innerBoxSize / 2),
            new THREE.Vector3(-innerBoxSize / 2, boxSize / 2, -innerBoxSize / 2),
            new THREE.Vector3(-innerBoxSize / 2, boxSize / 2, innerBoxSize / 2),

            new THREE.Vector3(boxSize / 2, -boxSize / 2, boxSize / 2),
            new THREE.Vector3(boxSize / 2, -boxSize / 2, -boxSize / 2),
            new THREE.Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2),
            new THREE.Vector3(-boxSize / 2, -boxSize / 2, boxSize / 2),

            new THREE.Vector3(boxSize / 2, boxSize / 2, boxSize / 2),
            new THREE.Vector3(boxSize / 2, boxSize / 2, -boxSize / 2),
            new THREE.Vector3(-boxSize / 2, boxSize / 2, -boxSize / 2),
            new THREE.Vector3(-boxSize / 2, boxSize / 2, boxSize / 2),
        ];
        geometry.faces = [
            //内部交叉面
            new THREE.Face3(0, 2, 6),
            new THREE.Face3(0, 6, 4),
            new THREE.Face3(3, 1, 5),
            new THREE.Face3(3, 5, 7),
            //外部方块面
            new THREE.Face3(8, 11, 10),
            new THREE.Face3(8, 10, 9),
            new THREE.Face3(8, 15, 11),
            new THREE.Face3(8, 12, 15),
            new THREE.Face3(8, 9, 13),
            new THREE.Face3(8, 13, 12),
            new THREE.Face3(14, 12, 13),
            new THREE.Face3(14, 15, 12),
            new THREE.Face3(14, 13, 9),
            new THREE.Face3(14, 9, 10),
            new THREE.Face3(14, 11, 15),
            new THREE.Face3(14, 10, 11),
        ];
        for (let faceIndex in geometry.faces) {
            if (faceIndex < 4) {
                geometry.faces[faceIndex].materialIndex = 0;
            } else {
                geometry.faces[faceIndex].materialIndex = 1;
            }
        }
        let imagePoint = [//切图位置
            [
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0.5, 0),
                new THREE.Vector2(1, 0),
            ],
            [
                new THREE.Vector2(0, 0.5),
                new THREE.Vector2(0.5, 0.5),
                new THREE.Vector2(1, 0.5),
            ],
            [
                new THREE.Vector2(0, 1),
                new THREE.Vector2(0.5, 1),
                new THREE.Vector2(1, 1),
            ]
        ];
        geometry.faceVertexUvs[0][0] = [imagePoint[0][0], imagePoint[0][2], imagePoint[2][2]];
        geometry.faceVertexUvs[0][1] = [imagePoint[0][0], imagePoint[2][2], imagePoint[2][0]];
        geometry.faceVertexUvs[0][2] = geometry.faceVertexUvs[0][0];
        geometry.faceVertexUvs[0][3] = geometry.faceVertexUvs[0][1];
        for (let i = 4; i < 16; i++) {
            geometry.faceVertexUvs[0][i] = [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
        }
        geometry.computeFaceNormals();
        let result = new Mesh(geometry,
            [new THREE.MeshLambertMaterial({
                map: textureLoader.load('/textures/tallgrass.png'),
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }),
                new THREE.MeshBasicMaterial({
                    transparent: true,
                    opacity: 0
                })
            ]);
        result.position.x = x;
        result.position.y = y;
        result.position.z = z;
        return result;
    }
};

const addNewBox = function (selectedBox, createDataHandler, type) {
    let normal = selectedBox.face.normal;
    let rotate = selectedBox.object.rotation;
    let position = selectedBox.object.position;

    if (type !== 3 && selectedBox.object.geometry instanceof THREE.Geometry) {
        // 覆盖花
        createDataHandler(Math.floor(position.x/100),
            Math.floor(position.y/100),
            Math.floor(position.z/100), type);
        return createBox(Math.floor(position.x/100)*100,
            Math.floor(position.y/100)*100,
            Math.floor(position.z/100)*100, type
        );
    } else {
        let offsetVector = new THREE.Vector3(normal.x, normal.y, normal.z);
        offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotate.z);
        offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotate.y);
        offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(1, 0, 0), rotate.x);
        offsetVector.floor();
        createDataHandler(Math.floor((position.x + offsetVector.x * 100)/100),
            Math.floor((position.y + offsetVector.y * 100)/100),
            Math.floor((position.z + offsetVector.z * 100)/100), type);
        return createBox(Math.floor((position.x + offsetVector.x * 100)/100)*100,
            Math.floor((position.y + offsetVector.y * 100)/100)*100,
            Math.floor((position.z + offsetVector.z * 100)/100)*100, type
        );
    }
};

export { createBox, addNewBox }
