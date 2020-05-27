<template>
    <div id="main">
        <div style="padding-top: 100px; padding-bottom: 100px">
            <img src="../assets/webcraft.png" alt=""/>
        </div>
        <div>
            <el-button @click="showLogin = true" class="MineCraftButton" v-if="!logined">
                <span>登录</span>
            </el-button>
        </div>
        <el-dialog title="登录" :visible.sync="showLogin">
            <el-form :model="loginForm" style="width: 300px; margin: 0px auto">
                <el-form-item label="用户名">
                    <el-input v-model="loginForm.username" autocomplete="off" class="MineCraftInput"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" show-password class="MineCraftInput"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showLogin = false" class="MineCraftButton">取 消</el-button>
                <el-button type="primary" @click="login" class="MineCraftButton">确 定</el-button>
            </div>
        </el-dialog>
        <div>
            <el-button class="MineCraftButton" @click="showRegister = true" v-if="!logined">
                <span>注册</span>
            </el-button>
        </div>
        <el-dialog title="注册" :visible.sync="showRegister">
            <el-form :model="registerForm" style="width: 300px; margin: 0px auto">
                <el-form-item label="用户名">
                    <el-input v-model="registerForm.username" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="registerForm.password" show-password/>
                </el-form-item>
                <el-form-item label="重复密码">
                    <el-input v-model="registerForm.password" show-password/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showRegister = false" class="MineCraftButton">取 消</el-button>
                <el-button type="primary" @click="register" class="MineCraftButton">确 定</el-button>
            </div>
        </el-dialog>
        <div>
            <el-button class="MineCraftButton" v-if="logined">
                <span>创建新的世界</span>
            </el-button>
        </div>
        <el-dialog title="创建新的世界" :visible.sync="showCreate">
            <el-form :model="createForm" style="width: 300px; margin: 0px auto">
                <el-form-item label="世界名称">
                    <el-input v-model="createForm.fileName" autocomplete="off" class="MineCraftInput"/>
                </el-form-item>
                <el-form-item label="世界大小">
                    <el-input-number v-model="createForm.worldSize" min="2" max="100"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showCreate = false" class="MineCraftButton">取 消</el-button>
                <el-button type="primary" @click="create" class="MineCraftButton">确 定</el-button>
            </div>
        </el-dialog>
        <div>
            <el-button class="MineCraftButton" @click="load" v-if="logined">
                <span>读取存档</span>
            </el-button>
        </div>
        <el-dialog title="读取存档" :visible.sync="showLoad">
            <el-button v-for="(world, index) in savedWorldList" :key="index" class="file"
                       @click.native="chooseFile(index)">
                <el-row style="font-size: 30px">{{ world.filename }}</el-row>
                <el-row>
                    世界大小：{{world.worldSize}}
                </el-row>
                <el-row>
                    创建时间：{{world.createTime}}
                </el-row>
                <el-row>
                    最近修改时间：{{world.updateTime}}
                </el-row>
            </el-button>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showLoad = false" class="MineCraftButton">取 消</el-button>
                <el-button type="primary" @click="confirmFile" class="MineCraftButton">确 定</el-button>
            </div>
        </el-dialog>
        <div>
            <el-button class="MineCraftButton" @click="logout" v-if="logined">
                <span>登出</span>
            </el-button>
        </div>
    </div>
</template>

<script>
    import "../assets/css/main.css";

    export default {
        name: "HomePage",
        data() {
            return {
                showLogin: false,
                loginForm: {
                    username: "",
                    password: ""
                },
                showRegister: false,
                registerForm: {
                    username: "",
                    password: "",
                    repeatPassword: ""
                },
                logined: false,
                showCreate: false,
                createForm: {
                    fileName: "",
                    worldSize: "",
                },
                showLoad: false,
                savedWorldList: [],
                chosenFileIndex: 0
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                if (localStorage.getItem("WebCraftToken")) {
                    this.logined = true;
                }
                this.logined = true;
            },
            login() {
                this.$axios({
                    method: 'post',
                    url: '/login',
                    headers: {
                        'Authorization': 'Basic YnJvd3NlcjpzZWNyZXQ='
                    },
                    data: {
                        'grant_type': 'password',
                        'username': this.loginForm.username,
                        'password': this.loginForm.password
                    }
                }).then((response) => {
                    if (response.status === 200) {
                        this.showLogin = false;
                        localStorage.setItem("WebCraftToken", response.data.access_token);
                        localStorage.setItem("WebCraftUser", this.loginForm.username);
                        this.logined = true;
                        window.location.href = "/";
                    } else {
                        alert("用户名或密码错误！");
                    }
                })
            },
            register() {
                if (this.registerForm.password !== this.registerForm.repeatPassword) {
                    alert("两次输入密码不一致！");
                } else {
                    this.$axios({
                        method: 'post',
                        url: '/register',
                        data: {
                            'username': this.loginForm.username,
                            'password': this.loginForm.password
                        }
                    }).then((response) => {
                        if (response.status === 200) {
                            alert("注册成功！");
                            this.showRegister = false;
                            this.showLogin = true;
                        } else {
                            alert("注册失败！");
                        }
                    })
                }
            },
            create() {
                // 由main页面负责上传，因为文件内容只有在main页面才能确定
                this.$router.push({
                    name: 'main',
                    params: {
                        'type': 'new', 'info': this.createForm
                    }
                })
            },
            load() {
                // this.$axios({
                //     method: 'get',
                //     url: '/file/' + localStorage.getItem("WebCraftUser")
                // }).then((response) => {
                //     if (response.status === 200) {
                //         this.savedWorldList = response.data;
                //     }
                // })
                for (let i = 0; i < 10; i++) {
                    this.savedWorldList.push({
                        fileId: i,
                        filename: 'ad',
                        createTime: 'adasdf',
                        updateTime: 'adfasdf',
                        worldSize: 10
                    })
                }
                this.showLoad = true;
            },
            chooseFile(index) {
                console.log(index);
                this.chosenFileIndex = index;
            },
            confirmFile() {
                this.$router.push({
                    name: 'main',
                    params: {
                        'type': 'old',
                        'info': this.savedWorldList[this.chosenFileIndex]
                    }
                });
            },
            logout() {
                localStorage.removeItem("WebCraftToken");
                localStorage.removeItem("WebCraftUser");
                window.location.href = "/";
            }
        }
    }
</script>

<style>
    #main {
        background-image: url("../assets/minecraft-background.jpg");
        background-size: 100% 100%;
        height: 100%;
        text-align: center;
    }

    .el-dialog__footer {
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
    }

    .dialog-footer .MineCraftButton {
        width: 100px;
        display: inline-block;
    }

    .el-input__inner {
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
        font-family: Minecraft;
        color: white;
        font-size: 20px;
    }

    .el-form-item__label {
        font-size: 20px;
        font-family: Minecraft;
        color: white;
    }

    .MineCraftInput {
        width: 300px;
    }

    .file {
        width: 200px;
        display: inline-block;
        margin: 10px;
        background-image: url('http://charliecowan.co.uk/mcbuttongenerator/button_center.png');
        background-repeat: repeat;
        font-family: Minecraft;
        color: white;
    }

</style>
