import {
    MathUtils,
    Spherical,
    Vector3,
    Raycaster, Vector2
} from "three";

import {
    isConflict,
    getHeight
} from "@/utils/SpaceUtil"

import {
    addNewBox
} from "@/utils/BoxUtil";

var FirstPersonControls = function (scene, camera, domElement,
									data, objects, worldWidth,
									escHandler) {

    if (domElement === undefined) {
        domElement = document;
    }

    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.data = data;
    this.objects = objects;
    this.worldWidth = worldWidth;
    this.escHandler = escHandler;
    this.directRay = new Raycaster();

    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;

    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;

    this.mouseX = 0;
    this.mouseY = 0;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.createNewBox = false;
    this.removeBox = false;
    this.viewLock = false;

    this.viewHalfX = 0;
    this.viewHalfY = 0;

    // private variables

    var lat = 0;
    var lon = 0;

    var lookDirection = new Vector3();
    var spherical = new Spherical();
    var target = new Vector3();

    if (this.domElement !== document) {

        this.domElement.setAttribute('tabindex', -1);

    }

    this.handleResize = function () {

        if (this.domElement === document) {

            this.viewHalfX = window.innerWidth / 2;
            this.viewHalfY = window.innerHeight / 2;

        } else {

            this.viewHalfX = this.domElement.offsetWidth / 2;
            this.viewHalfY = this.domElement.offsetHeight / 2;

        }

    };

    this.onMouseDown = function (event) {

        if (this.domElement !== document) {
            this.domElement.focus();
        }

        event.preventDefault();
        event.stopPropagation();

        switch (event.button) {

            case 0:
                this.createNewBox = true;
                break;
            case 2:
                this.removeBox = true;
                break;

        }

    };

    this.onMouseUp = function (event) {

        event.preventDefault();
        event.stopPropagation();
        switch (event.button) {
            case 0:
                this.createNewBox = false;
                break;
            case 2:
                this.removeBox = false;
                break;
        }
    };

    this.onMouseMove = function (event) {

        if (this.domElement === document) {
            if (Math.abs(event.pageX - this.viewHalfX) < 100) {
                this.mouseX = 0;
            } else {
                this.mouseX = event.pageX - this.viewHalfX;
            }
            if (Math.abs(event.pageY - this.viewHalfY) < 100) {
                this.mouseY = 0;
            } else {
                this.mouseY = event.pageY - this.viewHalfY;
            }

        } else {
            if (Math.abs(event.pageX - this.domElement.offsetLeft - this.viewHalfX) < 100) {
                this.mouseX = 0;
            } else {
                this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
            }
            if (Math.abs(event.pageY - this.domElement.offsetTop - this.viewHalfY) < 100) {
                this.mouseY = 0;
            } else {
                this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
            }

        }

    };

    this.onKeyDown = function (event) {

        // event.preventDefault();

        switch (event.keyCode) {

            case 38: /*up*/
            case 87: /*W*/
                this.moveForward = true;
                break;

            case 37: /*left*/
            case 65: /*A*/
                this.moveLeft = true;
                break;

            case 40: /*down*/
            case 83: /*S*/
                this.moveBackward = true;
                break;

            case 39: /*right*/
            case 68: /*D*/
                this.moveRight = true;
                break;

			case 27: /*esc*/
				this.escHandler();
				break;

        }

    };

    this.onKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: /*up*/
            case 87: /*W*/
                this.moveForward = false;
                break;

            case 37: /*left*/
            case 65: /*A*/
                this.moveLeft = false;
                break;

            case 40: /*down*/
            case 83: /*S*/
                this.moveBackward = false;
                break;

            case 39: /*right*/
            case 68: /*D*/
                this.moveRight = false;
                break;

        }

    };

    this.lookAt = function (x, y, z) {

        if (x.isVector3) {

            target.copy(x);

        } else {

            target.set(x, y, z);

        }

        this.camera.lookAt(target);

        setOrientation(this);

        return this;

    };

    this.update = function () {

        var targetPosition = new Vector3();

        return function update(delta) {
            // 移动控制
            var actualMoveSpeed = delta * this.movementSpeed;
            if (this.moveForward) {
                let keepY = this.camera.position.y;
                this.camera.translateZ(-(actualMoveSpeed));
                let pos = this.camera.position;
                if (pos.x < 0 || pos.z < 0
                    || Math.round(pos.x / 100) >= this.worldWidth
                    || Math.round(pos.z / 100) >= this.worldWidth) {
                    this.camera.translateZ((actualMoveSpeed));
                    this.camera.position.y = keepY;
                    return;
                }
                let heightArray = this.data[Math.round(pos.x / 100)][Math.round(pos.z / 100)];
                if (isConflict(pos.y - 100, heightArray)) {
                    this.camera.translateZ((actualMoveSpeed));
                    this.camera.position.y = keepY;
                } else {
                    this.camera.position.y = getHeight(heightArray) + 150;
                }
            }
            if (this.moveBackward) {
                let keepY = this.camera.position.y;
                this.camera.translateZ(actualMoveSpeed);
                let pos = this.camera.position;
                if (pos.x < 0 || pos.z < 0
                    || Math.round(pos.x / 100) >= this.worldWidth
                    || Math.round(pos.z / 100) >= this.worldWidth) {
                    this.camera.translateZ(-actualMoveSpeed);
                    this.camera.position.y = keepY;
                    return;
                }
                let heightArray = this.data[Math.round(pos.x / 100)][Math.round(pos.z / 100)];
                if (isConflict(pos.y - 100, heightArray)) {
                    this.camera.translateZ(-actualMoveSpeed);
                    this.camera.position.y = keepY;
                } else {
                    this.camera.position.y = getHeight(heightArray) + 150;
                }
            }
            if (this.moveLeft) {
                let keepY = this.camera.position.y;
                this.camera.translateX(-actualMoveSpeed);
                let pos = this.camera.position;
                if (pos.x < 0 || pos.z < 0
                    || Math.round(pos.x / 100) >= this.worldWidth
                    || Math.round(pos.z / 100) >= this.worldWidth) {
                    this.camera.translateX(actualMoveSpeed);
                    this.camera.position.y = keepY;
                    return;
                }
                let heightArray = this.data[Math.round(pos.x / 100)][Math.round(pos.z / 100)];
                if (isConflict(pos.y - 100, heightArray)) {
                    this.camera.translateX(actualMoveSpeed);
                    this.camera.position.y = keepY;
                } else {
                    this.camera.position.y = getHeight(heightArray) + 150;
                }
            }
            if (this.moveRight) {
                let keepY = this.camera.position.y;
                this.camera.translateX(actualMoveSpeed);
                let pos = this.camera.position;
                if (pos.x < 0 || pos.z < 0
                    || Math.round(pos.x / 100) >= this.worldWidth
                    || Math.round(pos.z / 100) >= this.worldWidth) {
                    this.camera.translateX(-actualMoveSpeed);
                    this.camera.position.y = keepY;
                    return;
                }
                let heightArray = this.data[Math.round(pos.x / 100)][Math.round(pos.z / 100)];
                if (isConflict(pos.y - 100, heightArray)) {
                    this.camera.translateX(-actualMoveSpeed);
                    this.camera.position.y = keepY;
                } else {
                    this.camera.position.y = getHeight(heightArray) + 150;
                }
            }

            //视角控制
            if (!this.viewLock) {
                var actualLookSpeed = delta * this.lookSpeed;
                var verticalLookRatio = 1;
                if (this.constrainVertical) {
                    verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
                }
                lon -= this.mouseX * actualLookSpeed;
                lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
                lat = Math.max(-85, Math.min(85, lat));
                var phi = MathUtils.degToRad(90 - lat);
                var theta = MathUtils.degToRad(lon);
                if (this.constrainVertical) {
                    phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
                }
                var position = this.camera.position;
                targetPosition.setFromSphericalCoords(1, phi, theta).add(position);
                this.camera.lookAt(targetPosition);
            }

            // 创建控制
            if (this.createNewBox || this.removeBox) {
                let type = 0;
                if (this.removeBox) {
                    type = 1;
                }
                // 避免单次点击多次检测
                this.createNewBox = false;
                this.removeBox = false;
                this.directRay.setFromCamera(new Vector2(0, 0), this.camera);
                let selectedBoxes = this.directRay.intersectObjects(this.objects);
                if (selectedBoxes.length > 0) {
                    if (selectedBoxes[0] && selectedBoxes[0].distance <= 1000) {
                        // 左键点击，创建新的方块
                        if (type === 0) {
                            let newBox = addNewBox(selectedBoxes[0]);
                            this.scene.add(newBox);
                            this.objects.push(newBox);
                        } else {
                            let index = this.objects.findIndex(
                                e => e.id === selectedBoxes[0].object.id);
                            this.objects.splice(index, 1);
                            this.scene.remove(this.scene.getObjectById(selectedBoxes[0].object.id));
                        }
                    }
                }
            }
        };

    }();

    this.lockView = () => {
        this.viewLock = true;
    };

    this.releaseView = () => {
        this.viewLock = false;
    };


    function contextmenu(event) {

        event.preventDefault();

    }

    this.dispose = function () {

        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        this.domElement.removeEventListener('mousedown', _onMouseDown, false);
        this.domElement.removeEventListener('mousemove', _onMouseMove, false);
        this.domElement.removeEventListener('mouseup', _onMouseUp, false);

        window.removeEventListener('keydown', _onKeyDown, false);
        window.removeEventListener('keyup', _onKeyUp, false);

    };

    var _onMouseMove = bind(this, this.onMouseMove);
    var _onMouseDown = bind(this, this.onMouseDown);
    var _onMouseUp = bind(this, this.onMouseUp);
    var _onKeyDown = bind(this, this.onKeyDown);
    var _onKeyUp = bind(this, this.onKeyUp);

    this.domElement.addEventListener('contextmenu', contextmenu, false);
    this.domElement.addEventListener('mousemove', _onMouseMove, false);
    this.domElement.addEventListener('mousedown', _onMouseDown, false);
    this.domElement.addEventListener('mouseup', _onMouseUp, false);

    window.addEventListener('keydown', _onKeyDown, false);
    window.addEventListener('keyup', _onKeyUp, false);

    function bind(scope, fn) {

        return function () {

            fn.apply(scope, arguments);

        };

    }

    function setOrientation(controls) {

        var quaternion = controls.camera.quaternion;

        lookDirection.set(0, 0, -1).applyQuaternion(quaternion);
        spherical.setFromVector3(lookDirection);

        lat = 90 - MathUtils.radToDeg(spherical.phi);
        lon = MathUtils.radToDeg(spherical.theta);

    }

    this.handleResize();

    setOrientation(this);

};

export {FirstPersonControls};
