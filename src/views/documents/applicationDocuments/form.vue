<template>
  <el-dialog :append-to-body="true" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="部门">
        <template>
          <el-select v-model="form.deptName" placeholder="请选择" style="width: 370px;" filterable>
            <el-option v-for="item in options" :key="item.form.deptName" :label="item.label" :value="item.form.deptName" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="申请人">
        <template>
          <el-select v-model="form.userName" placeholder="请选择" style="width: 370px;" filterable>
            <el-option v-for="item in options" :key="item.form.userName" :label="item.label" :value="item.form.userName" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="test">
        <template>
          <el-select v-model="form.deptName" :remote-method="getDept" :loading="loading" multiple filterable remote reserve-keyword placeholder="请输入关键词">
            <el-option v-for="item in options" :key="item.form.deptName" :label="item.label" :value="item.form.deptName" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="状态"><el-input v-model="form.status" style="width: 370px;" /></el-form-item>
      <el-form-item label="申请事项"><el-input v-model="form.sujectName" style="width: 370px;" /></el-form-item>
      <el-form-item label="事项描述"><el-input v-model="form.applicationDescription" style="width: 370px;" /></el-form-item>
      <el-form-item label="金额"><el-input v-model="form.amount" style="width: 370px;" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/applicationDocuments'
export default {
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      form: {
        id: '',
        applicationNo: '',
        status: '',
        deptName: '',
        userName: '',
        sujectName: '',
        applicationDescription: '',
        amount: '',
        createTime: '',
        updatetime: ''
      },
      rules: {}
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.loading = true
      if (this.isAdd) {
        this.doAdd()
      } else this.doEdit()
    },
    doAdd() {
      add(this.form)
        .then(res => {
          this.resetForm()
          this.$notify({
            title: '添加成功',
            type: 'success',
            duration: 2500
          })
          this.loading = false
          this.$parent.init()
        })
        .catch(err => {
          this.loading = false
          console.log(err.response.data.message)
        })
    },
    doEdit() {
      edit(this.form)
        .then(res => {
          this.resetForm()
          this.$notify({
            title: '修改成功',
            type: 'success',
            duration: 2500
          })
          this.loading = false
          this.$parent.init()
        })
        .catch(err => {
          this.loading = false
          console.log(err.response.data.message)
        })
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.form = {
        id: '',
        applicationNo: '',
        status: '',
        deptName: '',
        userName: '',
        sujectName: '',
        applicationDescription: '',
        amount: '',
        createTime: '',
        updatetime: ''
      }
    }
  }
}
</script>

<style scoped></style>
