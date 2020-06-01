<template>
    <div id="container">
        <el-alert
                title="成功加载世界"
                type="success"
                center
                show-icon
                v-if="loadSuccess"
        >
        </el-alert>
        <div class="blocker">
            <img class="blockerImg" v-for="blockUrl in blockerList"
                 :key="blockUrl" :src="blockUrl" alt=""
                 @click="selectBlock(blockUrl)"
            />
        </div>
        <img src="../assets/img/cross.png" class="cross" alt=""/>
        <el-dialog
                class="menu"
                title="菜单"
                :visible.sync="menuShow"
                width="30%"
                :before-close="closeMenu"
                v-loading.fullscreen.lock="fullscreenLoading"
        >
            <el-button class="MineCraftButton">
                <span>保存</span>
            </el-button>
            <el-button class="MineCraftButton">
                <span>返回主页</span>
            </el-button>
            <el-button class="MineCraftButton">
                <span>回到游戏</span>
            </el-button>
        </el-dialog>
    </div>
</template>

<script>
    import * as THREE from "three";
    import Stats from "stats-js";
    import {FirstPersonControls} from "../controls/FirstPersonControls";
    import {createBox} from "@/utils/BoxUtil";
    import "../assets/css/main.css";
    import {getHeight} from "@/utils/SpaceUtil";

    export default {
        name: "MainScene",
        data() {
            return {
                filename: "",
                worldWidth: 10,
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
                menuShow: false,
                fullscreenLoading: false,
                loadSuccess: false,
                boxHelper: {
                    createDataHandler: this.createDataHandler,
                    removeDataHandler: this.removeDataHandler
                }
            }
        },
        mounted() {
            // 非法进入
            // if (this.$route.params.type === undefined ||
            //     localStorage.getItem("WebCraftToken") === undefined) {
            //     this.$router.push("/");
            // }
            // if (this.$route.params.type === 'new') {
            //     this.filename = this.$route.params.info.filename;
            //     this.worldWidth = this.$route.params.info.worldSize;
            //     this.createNewWorld();
            // } else {
            //     // this.$axios({
            //     //     method: 'get',
            //     //     url: ''
            //     // })
            // }
            this.createNewWorld();
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
                this.camera.position.x = 100 * Math.floor(this.worldWidth / 2);
                this.camera.position.z = 100 * Math.floor(this.worldWidth / 2);
                this.camera.position.y = getHeight(100000,
                    this.data[Math.floor(this.worldWidth / 2)][Math.floor(this.worldWidth / 2)],
                ) * 100 + 150;

                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0xffffff);
                this.scene.fog = new THREE.FogExp2(0xffffff, 0.00015);

                this.loadWorld();

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
                    this.renderer.domElement, this.data, this.objects, this.worldWidth,
                    this.escHandler, this.boxHelper
                );

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
            generateHeight(width) {
                // 高度恒定为30
                for (let x = 0; x < width; x++) {
                    const temp = [];
                    for (let z = 0; z < width; z++) {
                        temp.push([
                            {
                                start: 0,
                                end: 30,
                                type: 0
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
            loadWorld() {
                for (var z = 0; z < this.worldWidth; z++) {
                    for (var x = 0; x < this.worldWidth; x++) {
                        let heightArray = this.data[x][z];
                        for (let i = 0; i < heightArray.length; i++) {
                            for (let j = heightArray[i].start; j <= heightArray[i].end; j++) {
                                if (this.shouldDisplay(x, j, z)) {
                                    let box = createBox(
                                        x * 100,
                                        j * 100,
                                        z * 100);
                                    this.scene.add(box);
                                    this.objects.push(box);
                                }
                            }

                        }
                    }
                }
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
            escHandler() {
                this.pauseViewChange();
                this.menuShow = true;
            },
            closeMenu() {
                this.recoverViewChange();
                this.menuShow = false;
            },
            createNewWorld() {
                this.fullscreenLoading = true;
                this.generateHeight(this.worldWidth);
                this.$axios({
                    method: 'post',
                    url: '/api/create',
                    headers: {
                        'Authorization': 'bearer ' + localStorage.getItem("WebCraftToken")
                    },
                    data: {
                        username: localStorage.getItem("WebCraftUser"),
                        filename: this.filename,
                        fileContent: JSON.stringify(this.data)
                    }
                }).then((response) => {
                    if (response.status === 200) {
                        this.fullscreenLoading = false;
                        this.loadSuccess = true;
                        setTimeout(() => {
                            this.loadSuccess = false
                        }, 2000);
                    }
                })
            },
            createDataHandler(x, y, z) {
                let heightArray = this.data[x][z];
                for (let i = 0; i < heightArray.length; i++) {
                    if (i+1 === heightArray.length) {
                        heightArray[i].end += 1;
                    } else {
                        if (heightArray[i] < y || y < heightArray[i+1] ) {
                            // 在已有的上面放置方块
                            if (heightArray[i] + 1 === y) {
                                heightArray[i].end += 1;
                            } else if (heightArray[i+1].start-1 === y){
                                heightArray[i+1].start -= 1;
                            } else {
                                // 通过四周进行悬空的方块
                                heightArray.splice(i+1, 0, {
                                    start: y,
                                    end: y,
                                    type: 0
                                })
                            }
                            break;
                        }
                    }
                }
            },
            removeDataHandler(x, y, z) {
                let heightArray = this.data[x][z];
                for (let i = 0; i < heightArray.length; i++) {
                    // 方块一定属于某个方块段之内
                    if (heightArray[i].start <= y && y <= heightArray[i].end) {
                        // 方块段可以移除
                        if (heightArray[i].start === heightArray[i].end) {
                            heightArray.splice(i, 1);
                        } else if (heightArray[i].start === y) {
                            heightArray[i].start += 1;
                        } else if (heightArray[i].end === y) {
                            heightArray[i].end -= 1;
                        } else {
                            let tempEnd = heightArray[i].end;
                            let tempType = heightArray[i].type;
                            heightArray.splice(i+1, 0, {
                                start: y+1,
                                end: tempEnd,
                                type: tempType
                            });
                            heightArray[i].end = y-1;
                        }
                    }
                }
                this.data[x][z] = heightArray;
                if (x-1 >= 0 && this.isBlockExist(x-1, y, z) &&
                    !this.isBlockDisplayed(x-1, y, z)) {
                    let newBox = createBox(
                        (x-1) * 100,
                        y * 100,
                        z * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
                if (z-1 >= 0 && this.isBlockExist(x, y, z-1) &&
                    !this.isBlockDisplayed(x, y, z-1)) {
                    let newBox = createBox(
                        x * 100,
                        y * 100,
                        (z-1) * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
                if (x+1 < this.worldWidth && this.isBlockExist(x+1, y, z) &&
                    !this.isBlockDisplayed(x+1, y, z)) {
                    let newBox = createBox(
                        (x+1) * 100,
                        y * 100,
                        z * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
                if (z+1 < this.worldWidth && this.isBlockExist(x, y, z+1) &&
                    !this.isBlockDisplayed(x, y, z+1)) {
                    let newBox = createBox(
                        x * 100,
                        y * 100,
                        (z+1) * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
                if (this.isBlockExist(x, y+1, z) &&
                    !this.isBlockDisplayed(x, y+1, z)) {
                    let newBox = createBox(
                        x * 100,
                        (y+1) * 100,
                        z * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
                if (this.isBlockExist(x, y-1, z) &&
                    !this.isBlockDisplayed(x, y-1, z)) {
                    let newBox = createBox(
                        x * 100,
                        (y-1) * 100,
                        z * 100);
                    this.scene.add(newBox);
                    this.objects.push(newBox);
                }
            },
            shouldDisplay(x, y, z) {
                return !this.isBlockExist(x-1, y, z) ||
                        !this.isBlockExist(x+1, y, z) ||
                        !this.isBlockExist(x, y+1, z) ||
                        !this.isBlockExist(x, y-1, z) ||
                        !this.isBlockExist(x, y, z+1) ||
                        !this.isBlockExist(x, y, z-1);
            },
            isBlockExist(x, y, z) {
                if (x < 0 || x >= this.worldWidth || z < 0 || z >= this.worldWidth) {
                    return true;
                }
                let result = false;
                let heightArray = this.data[x][z];
                for (let i = 0; i < heightArray.length; i++) {
                    if (heightArray[i].start <= y && y <= heightArray[i].end) {
                        result = true;
                    }
                }
                return result;
            },
            isBlockDisplayed(x, y, z) {
                for (let object of this.objects) {
                    if (Math.floor(object.position.x/100) === x &&
                            Math.floor(object.position.y/100) === y &&
                            Math.floor(object.position.z/100) === z
                    ) {
                        return true;
                    }
                }
                return false;
            }
        }
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

    .menu {
        text-align: center;
    }

    .el-dialog__header {
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
    }

    .el-dialog__title {
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
        font-family: Minecraft;
        color: white;
        font-size: 30px;
    }

    .el-dialog__body {
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
    }

    .menu .MineCraftButton {
        width: 100px;
        display: inline-block;
    }

</style>
