<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <q-form ref="formRef">
          <div class="row">
            <div class="col-12 col-md-6">
              <!-- 用户名 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 用户名：</label>
                <div>
                  <q-input
                    v-model="formData.username"
                    outlined
                    dense
                    style="width: 180px"
                    :disable="null != formData.id"
                    class="q-input-sm"
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <!-- 昵称 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 昵称：</label>
                <q-input
                  v-model="formData.realName"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
          </div>
          <div class="row" v-if="null == formData.id">
            <div class="col-12 col-md-6">
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 密码：</label>
                <q-input v-model="formData.password" dense outlined :type="isPwd ? 'password' : 'text'" style="width: 180px" class="q-input-sm">
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <!-- 手机 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 确认密码：</label>
                <q-input v-model="formData.verifyPassword" dense outlined :type="isVerifyPwd ? 'password' : 'text'"  style="width: 180px" class="q-input-sm">
                  <template v-slot:append>
                    <q-icon
                      :name="isVerifyPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isVerifyPwd = !isVerifyPwd"
                    />
                  </template>
                </q-input>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 col-md-6">
              <!-- 工号 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 工号：</label>
                <q-input
                  v-model="formData.no"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <!-- 手机 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 手机：</label>
                <q-input
                  v-model="formData.mobile"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 col-md-6">
              <!-- 邮箱 -->
              <div class="q-form-row">
                <label class="q-form-label"><span class="text-red">*</span> 邮箱：</label>
                <q-input
                  v-model="formData.email"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="q-form-row">
                <label class="q-form-label">签名：</label>
                <q-input
                  v-model="formData.sign"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 col-md-6">
              <!-- 备注 -->
              <div class="q-form-row">
                <label class="q-form-label">切换租户：</label>
                <q-select outlined v-model="formData.enableSwitchTenant"
                          :options="enableSwitchTenantOptions"
                          option-value="dictValue"
                          option-label="dictName"
                          emit-value
                          map-options
                          options-dense
                          dense
                          style="width: 180px"
                          class="q-select-sm"
                          placeholder="切换租户" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="q-form-row">
                <label class="q-form-label">备注：</label>
                <q-input
                  v-model="formData.remark"
                  outlined
                  dense
                  style="width: 180px"
                  class="q-input-sm"
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

    </q-card>
  </q-page>
</template>
<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
export default defineComponent({
  name: "testLogPage",

  setup() {
    return {
      formData: {
        
      }
    }
  }
})
</script>