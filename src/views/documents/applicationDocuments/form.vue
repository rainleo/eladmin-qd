<template>
  <el-dialog :append-to-body="true" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="部门">
        <template>
          <el-select v-model="dept.name" placeholder="请选择" style="width: 370px;" filterable @focus="getDeptName">
            <el-option v-for="item in dept" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="申请人">
        <template>
          <el-select v-model="user.username" placeholder="请选择" style="width: 370px;" filterable @focus="getUserName">
            <el-option v-for="item in user" :key="item.id" :label="item.username" :value="item.id" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="状态">
        <template>
          <el-select v-model="form.status" placeholder="请选择" style="width: 370px;" filterable>
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
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
import { add, edit, getDeptName, getUserName } from '@/api/applicationDocuments'
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
      rules: {},
      dept: {
        name: ''
      },
      user: {
        username: ''
      },
      statusTypeOptions: [
        { key: 1, display_name: '已审批' },
        { key: 0, display_name: '审批中' }
      ]
    }
  },

  methods: {
    getDeptName() {
      getDeptName({ enabled: 1 }).then(res => {
        this.dept = res
      })
    },
    getUserName() {
      getUserName({ enabled: 1 }).then(res => {
        this.user = res.content
      })
    },
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
