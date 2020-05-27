<template>
    <div id="container">
        <div class="blocker">
            <img class="blockerImg" v-for="blockUrl in blockerList"
                 :key="blockUrl" :src="blockUrl" alt=""
                 @click="selectBlock(blockUrl)"
            />
        </div>
        <img src="../assets/img/cross.png" class="cross" alt=""/>
    </div>
</template>

<script>
    import * as THREE from "three";
    import Stats from "stats-js";
    import {FirstPersonControls} from "../controls/FirstPersonControls";
    import {createBox} from "@/utils/BoxUtil";
    import "../assets/css/main.css";

    export default {
        name: "MainScene",
        data() {
            return {
                worldWidth: 20,
                data: [], // 自定义的JSON格式，为了判断高度以及保存
                objects: [], // three.js 中的对象，为了判断是否相交
                status: {},
                scene: {},
                camera: {},
                controls: {},
                render: {},
                clock: {},
                blockerList: [
                    "/textures/dirt.png",
                    "/textures/stonebrick_carved.png"
                ],
                currentBlock: "",
            }
        },
        mounted() {
            this.generateHeight(this.worldWidth);
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
                // 均使用默认参数，防止之后更改，这里先写明
                this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 20000);
                // 设置相机位置到地图的中心
                this.camera.position.x = 100 * this.worldWidth / 2;
                this.camera.position.z = 100 * this.worldWidth / 2;
                this.camera.position.y = this.getHeight(this.worldWidth / 2, this.worldWidth / 2) * 100 + 150;

                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0xffffff);
                this.scene.fog = new THREE.FogExp2(0xffffff, 0.00015);

                var matrix = new THREE.Matrix4();
                for (var z = 0; z < this.worldWidth; z++) {
                    for (var x = 0; x < this.worldWidth; x++) {
                        var h = this.getHeight(x, z);
                        matrix.makeTranslation(
                            x * 100,
                            h * 100,
                            z * 100
                        );
                        const box = createBox(matrix);
                        this.scene.add(box);
                        this.objects.push(box);
                    }
                }

                // 添加环境光
                var ambientLight = new THREE.AmbientLight(0xcccccc);
                this.scene.add(ambientLight);
                // 添加直射光线，模拟日照
                var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
                directionalLight.position.set(1, 1, 0.5).normalize();
                this.scene.add(directionalLight);

                this.renderer = new THREE.WebGLRenderer();
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                container.appendChild(this.renderer.domElement);

                this.controls = new FirstPersonControls(this.scene, this.camera,
                    this.renderer.domElement, this.data, this.objects, this.worldWidth);

                this.controls.movementSpeed = 500;
                this.controls.lookSpeed = 0.1;
                this.controls.constrainVertical = true;
                this.controls.verticalMin = 1.1;
                this.controls.verticalMax = 2.2;

                this.clock = new THREE.Clock();

                // 设置性能监控显示
                this.status = new Stats();
                container.appendChild(this.status.dom);

            },
            getHeight(x, z) {
                if (x < 0 || z < 0 || x >= 200 || z >= 200) {
                    return 0;
                }
                return this.data[x][z][0].end;
            },
            generateHeight(width) {
                // 高度恒定为30
                for (let x = 0; x < width; x++) {
                    const temp = [];
                    for (let z = 0; z < width; z++) {
                        temp.push([
                            {
                                start: 0,
                                end: 30
                            }
                        ])
                    }
                    this.data.push(temp);
                }
                // 随机生成十座山
                // for (let x = 0; x < 1; x++) {
                //     let mX = Math.floor(Math.random() * width);
                //     let mZ = Math.floor(Math.random() * width);
                //     this.data[mX][mZ][0].end = 40;
                //     for (let i = 0; i < 20; i++) {
                //         if (i < 10) {
                //             let j = 0;
                //             for (;j < 2*i; j++) {
                //                 if (mX - i >= 0 && mZ - i + j >= 0 && mZ - i + j < width) {
                //                     this.data[mX - i][mZ - i + j][0].end = 40;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX - i + j>= 0 && mX - i + j < width && mZ + i < width) {
                //                     this.data[mX - i + j][mZ + i][0].end = 40;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX + i < width && mZ + i - j < width && mZ + i - j >= 0) {
                //                     this.data[mX + i][mZ + i - j][0].end = 40;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX + i - j < width && mX + i - j >= 0 && mZ - i >= 0) {
                //                     this.data[mX + i - j][mZ - i][0].end = 40;
                //                 }
                //             }
                //         } else {
                //             let j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX - i >= 0 && mZ - i + j >= 0 && mZ - i + j < width) {
                //                     if (this.data[mX - i][mZ - i + j][0].end < 50-i)
                //                         this.data[mX - i][mZ - i + j][0].end = 50-i;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX - i + j>= 0 && mX - i + j < width && mZ + i < width) {
                //                     if (this.data[mX - i + j][mZ + i][0].end <50-i)
                //                         this.data[mX - i + j][mZ + i][0].end = 50-i;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX + i < width && mZ + i - j < width && mZ + i - j >= 0) {
                //                     if (this.data[mX + i][mZ + i - j][0].end < 50-i)
                //                         this.data[mX + i][mZ + i - j][0].end = 50-i;
                //                 }
                //             }
                //             j = 0;
                //             for (; j < 2*i; j++) {
                //                 if (mX + i - j < width && mX + i - j >= 0 && mZ - i >= 0) {
                //                     if (this.data[mX + i - j][mZ - i][0].end < 50-i)
                //                         this.data[mX + i - j][mZ - i][0].end = 50-i;
                //                 }
                //             }
                //         }
                //     }
                // }
            },
            animate() {
                requestAnimationFrame(this.animate);
                this.controls.update(this.clock.getDelta());
                this.renderer.render(this.scene, this.camera);
                this.status.update();
            },
            selectBlock(blockUrl) {
                this.currentBlock = blockUrl;
            },
            pauseViewChange() {
                this.controls.lockView();
            },
            recoverViewChange() {
                this.controls.releaseView();
            },
        }
        ,
    }
</script>

<style>
    body {
        background-color: #fff;
        color: #61443e;
    }

    #container {
    }

    .cross {
        position: absolute;
        z-index: 1;
        margin: auto;
        width: 40px;
        height: 40px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        user-select: none;

    }

    .blocker {
        position: absolute;

        bottom: 0px;
        left: 35%;
        width: 300px;
        height: 80px;

        z-index: 4;

        background-color: rgba(0, 0, 0, 0.5);
    }

    .blockerImg {
        height: 60px;
        width: 60px;
        margin: 10px;
        user-select: none;
    }

</style>
