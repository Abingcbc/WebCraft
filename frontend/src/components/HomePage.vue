<template>
    <div id="main">
        <div style="padding-top: 100px; padding-bottom: 100px">
            <img src="../assets/webcraft.png" alt=""/>
        </div>
        <div>
            <el-button @click="showLogin = true" class="MineCraftButton">
                <span>登录</span>
            </el-button>
        </div>
        <el-dialog title="登录" :visible.sync="showLogin">
            <el-form :model="loginForm">
                <el-form-item label="用户名">
                    <el-input v-model="loginForm.username" autocomplete="off"/>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" show-password/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showLogin = false">取 消</el-button>
                <el-button type="primary" @click="login">确 定</el-button>
            </div>
        </el-dialog>
        <div>
            <el-button  class="MineCraftButton" @click="showRegister = true">
                <span>注册</span>
            </el-button>
        </div>
        <el-dialog title="注册" :visible.sync="showRegister">
            <el-form :model="registerForm">
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
                <el-button @click="showRegister = false">取 消</el-button>
                <el-button type="primary" @click="register">确 定</el-button>
            </div>
        </el-dialog>
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
                }
            }
        },
        methods: {
            login() {
                this.showLogin = false;
                this.$router.push("/main");
            },
            register() {
                this.showRegister = false
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
</style>
