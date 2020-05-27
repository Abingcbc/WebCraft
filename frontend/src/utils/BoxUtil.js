import * as THREE from "three";
import {Matrix4} from "three";

var textureLoader = new THREE.TextureLoader();

const createBox = function (matrix) {

    var geometry = new THREE.BoxGeometry(100, 100, 100);
    geometry.applyMatrix4(matrix);
    var materials = [
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        }),
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        }),
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        }),
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        }),
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        }),
        new THREE.MeshLambertMaterial({
            map: textureLoader.load( '/textures/dirt.png' )
        })
    ];
    return new THREE.Mesh( geometry, materials );
};

const addNewBox = function (selectedBox) {
    let normal = selectedBox.face.normal;
    let rotate = selectedBox.object.rotation;
    let position = selectedBox.point;

    let offsetVector = new THREE.Vector3(normal.x, normal.y, normal.z);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotate.z);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotate.y);
    offsetVector = offsetVector.applyAxisAngle(new THREE.Vector3(1, 0, 0), rotate.x);
    offsetVector.round();
    let newPosition = new Matrix4();
    newPosition.makeTranslation(
        Math.round((position.x + offsetVector.x)/100)*100,
        Math.round((position.y + offsetVector.y)/100)*100,
        Math.round((position.z + offsetVector.z)/100)*100);
    return createBox(newPosition);
};

export { createBox, addNewBox }
