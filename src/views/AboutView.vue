<template>
  <div class="about">
    <ul>
      <li>ngBrain 采用socket.io 通信，您可以在浏览器控制台查看到数据</li>
      <li>使用方式，类似与 eventBus；采用on emit 来传递事件</li>
    </ul>
    <div class="username">
      <label>Username</label>
      <input type="text" v-model="username" />
    </div>

    <div class="password">
      <label>Password</label>
      <input type="password" v-model="password" />
    </div>

    <el-button type="primary" @click="submitForm">Login</el-button>
  </div>
</template>

<script type="typescript" setup>
import { onMounted, reactive, ref } from "vue";
import {io} from 'socket.io-client';

const username = ref('');
const password = ref('');
const socket = reactive(io('http://localhost:3000'));
onMounted(() => {
  socket.on('login_1', (data) =>{
    console.log(data, 'ngBrain,服务器接受到的数据，并给您返回了加工后的数据');
  })
})

function submitForm() {
  socket.emit('login', { username: username.value, password: password.value });
}
</script>

<style lang="less">
.about {
  display: flex;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  .username {
    margin: 32px 16px 14px 16px;
  }
  .password {
    margin: 14px 16px 32px 16px;
  }
}
</style>
