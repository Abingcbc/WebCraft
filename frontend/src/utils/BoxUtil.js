import * as THREE from "three";

var textureLoader = new THREE.TextureLoader();

const createBox = function (x, y, z) {

    let geometry = new THREE.BoxGeometry(100, 100, 100);
    let materials = [
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
    let result = new THREE.Mesh( geometry, materials );
    result.position.x = x;
    result.position.y = y;
    result.position.z = z;
    return result;
};

const addNewBox = function (selectedBox, createDataHandler) {
    let normal = selectedBox.face.normal;
    let rotate = selectedBox.object.rotation;
    let position = selectedBox.object.position;

    let offsetVector = new THREE.Vector3(normal.x, normal.y, normal.z);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotate.z);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotate.y);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(1, 0, 0), rotate.x);
    offsetVector.floor();
    createDataHandler(Math.floor((position.x + offsetVector.x * 100)/100),
        Math.floor((position.y + offsetVector.y * 100)/100),
        Math.floor((position.z + offsetVector.z * 100)/100));
    return createBox(Math.floor((position.x + offsetVector.x * 100)/100)*100,
        Math.floor((position.y + offsetVector.y * 100)/100)*100,
        Math.floor((position.z + offsetVector.z * 100)/100)*100
        );
};

export { createBox, addNewBox }
