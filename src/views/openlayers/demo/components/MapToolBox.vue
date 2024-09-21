<script setup lang="ts">
import { Tools } from '@element-plus/icons-vue'
import { ref } from 'vue'

const showBox = ref(false)
const toggleBox = () => {
  showBox.value = !showBox.value
}
</script>

<template>
  <div class="mapToolBox ol-unselectable" ref="mapToolBox">
    <div class="mapToolBoxIn" @click="toggleBox">
      <el-icon>
        <Tools />
      </el-icon>
      <span>工具</span>
    </div>
    <!-- <transition name="fade"> -->
    <div class="tool_open_box" v-show="showBox">
      <el-collapse>
        <el-collapse-item title="Consistency" name="1">
          <div>
            Consistent with real life: in line with the process and logic of real
            life, and comply with languages and habits that the users are used to;
          </div>
          <div>
            Consistent within interface: all elements should be consistent, such
            as: design style, icons and texts, position of elements, etc.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Feedback" name="2">
          <div>
            Operation feedback: enable the users to clearly perceive their
            operations by style updates and interactive effects;
          </div>
          <div>
            Visual feedback: reflect current state by updating or rearranging
            elements of the page.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Efficiency" name="3">
          <div>
            Simplify the process: keep operating process simple and intuitive;
          </div>
          <div>
            Definite and clear: enunciate your intentions clearly so that the
            users can quickly understand and make decisions;
          </div>
          <div>
            Easy to identify: the interface should be straightforward, which helps
            the users to identify and frees them from memorizing and recalling.
          </div>
        </el-collapse-item>
        <el-collapse-item title="Controllability" name="4">
          <div>
            Decision making: giving advices about operations is acceptable, but do
            not make decisions for the users;
          </div>
          <div>
            Controlled consequences: users should be granted the freedom to
            operate, including canceling, aborting or terminating current
            operation.
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <!-- </transition> -->
  </div>
</template>

<style lang="scss" scoped>
.mapToolBox {
  font-size: 14px;
  position: absolute;
  top: 10%;
  left: 15%;
  display: flex;
  z-index: 100;

  ::-webkit-scrollbar {
    width: 4px;
    height: 8px;
    background-color: #ebeef5;
  }

  ::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 6px rgba(16, 192, 255, 0.3);
    -webkit-box-shadow: inset 0 0 6px rgba(16, 192, 255, 0.2);
    background-color: #10c0ff;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(44, 70, 93, 0.8);
  }

  .mapToolBoxIn {
    display: flex;
    margin-right: 10px;
    box-shadow: 0 0 20px 10px #12316d inset;
    width: 51px;
    height: 51px;
    border: 1px solid #064b96;
    border-radius: 4px;
    background: #0b2438;
    color: #10c0ff;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    transition: right ease 0.5s;
    font-size: 14px;
    cursor: pointer;

    i {
      margin-bottom: 2px;
    }
  }

  .fade-enter-active {
    animation: fadeInLeft 0.5s;
  }

  .fade-leave-active {
    animation: fadeOutLeft 0.5s;
  }

  .tool_open_box {
    position: absolute;
    top: 60px;
    left: 0;
    height: 50vh;
    overflow-y: auto;
    width: 250px;
    border: 1px solid #2668e8;
    box-shadow: 0 0 20px 10px #12316d inset;
    background-color: #112266;
    padding: 10px;
    color: #fff;

    p {
      margin: 0 0 10px 0;
    }

    ul {
      display: grid;
      grid-template-columns: 33.3% 33.3% 33.3%;
      margin: 0 0 10px 0;
      padding: 0;

      li {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        position: relative;
        left: 0;
        top: 0;
        margin-bottom: 10px;

        &:hover {
          color: #00ddaa;
        }
      }
    }
  }

  .tool_open_setting {
    position: absolute;
    top: 60px;
    left: 260px;
    overflow-y: auto;
    width: 250px;
    border: 1px solid #2668e8;
    box-shadow: 0 0 20px 10px #12316d inset;
    background-color: #112266;
    padding: 10px;
    color: #fff;

    .close {
      color: #65caff;
      position: absolute;
      top: 5px;
      right: 14px;
      cursor: pointer;
    }

    .items {
      margin-top: 20px;

      &.wrap {
        display: flex;
        flex-wrap: wrap;

        .item {
          flex: 0 0 50%;
        }
      }

      .item {
        display: flex;
        align-items: center;
        margin: 10px 0;

        .label {
          margin: 0 10px;
        }

        .content {
          margin: 8px;
        }

        &.side {
          .el-input-number {
            width: 60px;

            :deep(.el-input__inner) {
              padding-left: 5px;
              padding-right: 5px;
            }
          }

          justify-content: space-between;

          :deep(.el-checkbox__label) {
            color: #aaa;
          }

          .is-checked {
            :deep(.el-checkbox__label) {
              color: #fff;
            }
          }
        }
      }
    }
  }

  .poi-list {
    width: 100%;
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding-left: 8px;
      margin: 10px 0;
      cursor: pointer;
      // background-color: "rgba(89, 180, 185, 1)";

      &:hover {
        color: #00ddaa;
      }

      &.highlight {
        color: #00ddaa;
      }
    }
  }
}
</style>
