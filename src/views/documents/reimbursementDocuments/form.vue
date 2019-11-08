<template>
  <el-dialog :append-to-body="true" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="部门"><el-input v-model="form.deptName" style="width: 370px;" /></el-form-item>
      <el-form-item label="报销人"><el-input v-model="form.userName" style="width: 370px;" /></el-form-item>
      <el-form-item label="报销摘要"><el-input v-model="form.reimbursementAbstract" style="width: 370px;" /></el-form-item>
      <el-form-item label="报销金额"><el-input v-model="form.amount" style="width: 370px;" /></el-form-item>
      <el-form-item label="附件"><el-input v-model="form.attachment" style="width: 370px;" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/reimbursementDocuments'
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
        reimbursementNo: '',
        deptName: '',
        userName: '',
        reimbursementAbstract: '',
        amount: '',
        attachment: '',
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
        reimbursementNo: '',
        deptName: '',
        userName: '',
        reimbursementAbstract: '',
        amount: '',
        attachment: '',
        createTime: '',
        updatetime: ''
      }
    }
  }
}
</script>

<style scoped></style>
