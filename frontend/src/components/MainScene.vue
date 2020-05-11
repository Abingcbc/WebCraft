<template>
    <div id="container"></div>
</template>

<script>
    import * as THREE from "three";
    import Stats from "stats-js";
    import {FirstPersonControls} from "../controls/FirstPersonControls";
    import {ImprovedNoise} from '../math/ImprovedNoise';
    import "../assets/css/main.css";

    export default {
        name: "MainScene",
        data() {
            return {
                worldWidth: 200,
                worldDepth: 200,
                data: [],
                status: {},
                scene: {},
                camera: {},
                controls: {},
                render: {},
                clock: {}
            }
        },
        mounted() {
            this.generateHeight(this.worldWidth, this.worldDepth);
            this.init();
            this.animate();
        },
        methods: {
            init() {
                const container = document.getElementById('container');
                // fov — 摄像机视锥体垂直视野角度
                // aspect — 摄像机视锥体长宽比
                // near — 摄像机视锥体近端面
                // far — 摄像机视锥体远端面
                this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 20000);
                this.camera.position.y = this.getHeight(this.worldWidth / 2, this.worldDepth / 2) * 100 + 100;

                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0xffffff);
                this.scene.fog = new THREE.FogExp2(0xffffff, 0.00015);

                // sides

                var light = new THREE.Color(0xffffff);
                var shadow = new THREE.Color(0x505050);

                var matrix = new THREE.Matrix4();
                // positive x
                // 创建正方体的六个面
                var pxGeometry = new THREE.PlaneGeometry(100, 100);
                pxGeometry.faces[0].vertexColors = [light, shadow, light];
                pxGeometry.faces[1].vertexColors = [shadow, shadow, light];
                pxGeometry.faceVertexUvs[0][0][0].y = 0.5;
                pxGeometry.faceVertexUvs[0][0][2].y = 0.5;
                pxGeometry.faceVertexUvs[0][1][2].y = 0.5;
                pxGeometry.rotateY(Math.PI / 2);
                pxGeometry.translate(50, 0, 0);

                var nxGeometry = new THREE.PlaneGeometry(100, 100);
                nxGeometry.faces[0].vertexColors = [light, shadow, light];
                nxGeometry.faces[1].vertexColors = [shadow, shadow, light];
                nxGeometry.faceVertexUvs[0][0][0].y = 0.5;
                nxGeometry.faceVertexUvs[0][0][2].y = 0.5;
                nxGeometry.faceVertexUvs[0][1][2].y = 0.5;
                nxGeometry.rotateY(-Math.PI / 2);
                nxGeometry.translate(-50, 0, 0);

                var pyGeometry = new THREE.PlaneGeometry(100, 100);
                pyGeometry.faces[0].vertexColors = [light, light, light];
                pyGeometry.faces[1].vertexColors = [light, light, light];
                pyGeometry.faceVertexUvs[0][0][1].y = 0.5;
                pyGeometry.faceVertexUvs[0][1][0].y = 0.5;
                pyGeometry.faceVertexUvs[0][1][1].y = 0.5;
                pyGeometry.rotateX(-Math.PI / 2);
                pyGeometry.translate(0, 50, 0);

                var py2Geometry = new THREE.PlaneGeometry(100, 100);
                py2Geometry.faces[0].vertexColors = [light, light, light];
                py2Geometry.faces[1].vertexColors = [light, light, light];
                py2Geometry.faceVertexUvs[0][0][1].y = 0.5;
                py2Geometry.faceVertexUvs[0][1][0].y = 0.5;
                py2Geometry.faceVertexUvs[0][1][1].y = 0.5;
                py2Geometry.rotateX(-Math.PI / 2);
                py2Geometry.rotateY(Math.PI / 2);
                py2Geometry.translate(0, 50, 0);

                var pzGeometry = new THREE.PlaneGeometry(100, 100);
                pzGeometry.faces[0].vertexColors = [light, shadow, light];
                pzGeometry.faces[1].vertexColors = [shadow, shadow, light];
                pzGeometry.faceVertexUvs[0][0][0].y = 0.5;
                pzGeometry.faceVertexUvs[0][0][2].y = 0.5;
                pzGeometry.faceVertexUvs[0][1][2].y = 0.5;
                pzGeometry.translate(0, 0, 50);

                var nzGeometry = new THREE.PlaneGeometry(100, 100);
                nzGeometry.faces[0].vertexColors = [light, shadow, light];
                nzGeometry.faces[1].vertexColors = [shadow, shadow, light];
                nzGeometry.faceVertexUvs[0][0][0].y = 0.5;
                nzGeometry.faceVertexUvs[0][0][2].y = 0.5;
                nzGeometry.faceVertexUvs[0][1][2].y = 0.5;
                nzGeometry.rotateY(Math.PI);
                nzGeometry.translate(0, 0, -50);

                //

                var geometry = new THREE.Geometry();

                for (var z = 0; z < this.worldDepth; z++) {
                    for (var x = 0; x < this.worldWidth; x++) {
                        var h = this.getHeight(x, z);
                        // 初始化时相机的视角
                        matrix.makeTranslation(
                            x * 100 - this.worldWidth / 2 * 100,
                            h * 100,
                            z * 100 - this.worldDepth / 2 * 100
                        );

                        var px = this.getHeight(x + 1, z);
                        var nx = this.getHeight(x - 1, z);
                        var pz = this.getHeight(x, z + 1);
                        var nz = this.getHeight(x, z - 1);

                        var pxpz = this.getHeight(x + 1, z + 1);
                        var nxpz = this.getHeight(x - 1, z + 1);
                        var pxnz = this.getHeight(x + 1, z - 1);
                        var nxnz = this.getHeight(x - 1, z - 1);

                        var a = nx > h || nz > h || nxnz > h ? 0 : 1;
                        var b = nx > h || pz > h || nxpz > h ? 0 : 1;
                        var c = px > h || pz > h || pxpz > h ? 0 : 1;
                        var d = px > h || nz > h || pxnz > h ? 0 : 1;

                        // 设置光线阴影
                        var colors;
                        if (a + c > b + d) {
                            colors = py2Geometry.faces[0].vertexColors;
                            colors[0] = b === 0 ? shadow : light;
                            colors[1] = c === 0 ? shadow : light;
                            colors[2] = a === 0 ? shadow : light;

                            colors = py2Geometry.faces[1].vertexColors;
                            colors[0] = c === 0 ? shadow : light;
                            colors[1] = d === 0 ? shadow : light;
                            colors[2] = a === 0 ? shadow : light;

                            geometry.merge(py2Geometry, matrix);

                        } else {
                            colors = pyGeometry.faces[0].vertexColors;
                            colors[0] = a === 0 ? shadow : light;
                            colors[1] = b === 0 ? shadow : light;
                            colors[2] = d === 0 ? shadow : light;

                            colors = pyGeometry.faces[1].vertexColors;
                            colors[0] = b === 0 ? shadow : light;
                            colors[1] = c === 0 ? shadow : light;
                            colors[2] = d === 0 ? shadow : light;

                            geometry.merge(pyGeometry, matrix);
                        }
                        if ((px !== h && px !== h + 1) || x === 0) {
                            colors = pxGeometry.faces[0].vertexColors;
                            colors[0] = pxpz > px && x > 0 ? shadow : light;
                            colors[2] = pxnz > px && x > 0 ? shadow : light;

                            colors = pxGeometry.faces[1].vertexColors;
                            colors[2] = pxnz > px && x > 0 ? shadow : light;

                            geometry.merge(pxGeometry, matrix);
                        }
                        if ((nx !== h && nx !== h + 1) || x === this.worldWidth - 1) {
                            colors = nxGeometry.faces[0].vertexColors;
                            colors[0] = nxnz > nx && x < this.worldWidth - 1 ? shadow : light;
                            colors[2] = nxpz > nx && x < this.worldWidth - 1 ? shadow : light;

                            colors = nxGeometry.faces[1].vertexColors;
                            colors[2] = nxpz > nx && x < this.worldWidth - 1 ? shadow : light;

                            geometry.merge(nxGeometry, matrix);
                        }
                        if ((pz !== h && pz !== h + 1) || z === this.worldDepth - 1) {
                            colors = pzGeometry.faces[0].vertexColors;
                            colors[0] = nxpz > pz && z < this.worldDepth - 1 ? shadow : light;
                            colors[2] = pxpz > pz && z < this.worldDepth - 1 ? shadow : light;

                            colors = pzGeometry.faces[1].vertexColors;
                            colors[2] = pxpz > pz && z < this.worldDepth - 1 ? shadow : light;

                            geometry.merge(pzGeometry, matrix);
                        }
                        if ((nz !== h && nz !== h + 1) || z === 0) {
                            colors = nzGeometry.faces[0].vertexColors;
                            colors[0] = pxnz > nz && z > 0 ? shadow : light;
                            colors[2] = nxnz > nz && z > 0 ? shadow : light;

                            colors = nzGeometry.faces[1].vertexColors;
                            colors[2] = nxnz > nz && z > 0 ? shadow : light;

                            geometry.merge(nzGeometry, matrix);
                        }
                    }

                }
                geometry = new THREE.BufferGeometry().fromGeometry(geometry);

                var texture = new THREE.TextureLoader().load('/textures/atlas.png');
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.LinearMipmapLinearFilter;

                var mesh = new THREE.Mesh(
                    geometry,
                    new THREE.MeshLambertMaterial({map: texture, vertexColors: true, side: THREE.DoubleSide})
                );
                this.scene.add(mesh);

                var ambientLight = new THREE.AmbientLight(0xcccccc);
                this.scene.add(ambientLight);

                var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
                directionalLight.position.set(1, 1, 0.5).normalize();
                this.scene.add(directionalLight);

                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(this.renderer.domElement);

                this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);

                this.controls.movementSpeed = 1000;
                this.controls.lookSpeed = 0.125;
                this.controls.lookVertical = true;
                this.controls.constrainVertical = true;
                this.controls.verticalMin = 1.1;
                this.controls.verticalMax = 2.2;

                this.clock = new THREE.Clock();

                // 设置性能监控显示
                this.status = new Stats();
                container.appendChild(this.status.dom);
            },
            getHeight(x, z) {
                return (this.data[x + z * this.worldWidth] * 0.2) | 0;
            },
            generateHeight(width, height) {
                var perlin = new ImprovedNoise(),
                    size = width * height, quality = 2, z = Math.random() * 100;

                for (var j = 0; j < 4; j++) {
                    if (j == 0) for (var m = 0; m < size; m++) this.data[m] = 0;
                    for (var i = 0; i < size; i++) {
                        var x = i % width, y = (i / width) | 0;
                        this.data[i] += perlin.noise(x / quality, y / quality, z) * quality;
                    }
                    quality *= 4;
                }
            },
            animate() {
                requestAnimationFrame(this.animate);
                this.controls.update(this.clock.getDelta());
                this.renderer.render(this.scene, this.camera);
                this.status.update();
            },
        },
    }
</script>

<style>

    body {
        background-color: #fff;
        color: #61443e;
    }

    a {
        color: #a06851;
    }

</style>
