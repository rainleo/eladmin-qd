<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="90px">
      <el-form-item label="科目代码" prop="subjectCode"><el-input v-model.trim="form.subjectCode" style="width: 370px;" /></el-form-item>
      <el-form-item label="科目名称" prop="subjectName"><el-input v-model.trim="form.subjectName" style="width: 370px;" /></el-form-item>
      <el-form-item label="辅助账类型" prop="auxiliaryAccountType"><el-input v-model.trim="form.auxiliaryAccountType" style="width: 370px;" /></el-form-item>
      <el-form-item label="辅助核算项目明细" prop="itemDetails"><el-input v-model.trim="form.itemDetails" style="width: 370px;" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/accountingSubjects'
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
        subjectCode: '',
        subjectName: '',
        auxiliaryAccountType: '',
        itemDetails: '',
        createTime: '',
        updatetime: ''
      },
      rules: {
        subjectCode: [{ required: true, message: '科目代码不能为空', trigger: 'blur' }],
        subjectName: [{ required: true, message: '科目名称不能为空', trigger: 'blur' }],
        auxiliaryAccountType: [{ required: true, message: '辅助账类型不能为空', trigger: 'blur' }],
        itemDetails: [{ required: true, message: '辅助核算项目明细不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          if (this.isAdd) {
            this.doAdd()
          } else this.doEdit()
        } else {
          return false
        }
      })
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
        subjectCode: '',
        subjectName: '',
        auxiliaryAccountType: '',
        itemDetails: '',
        createTime: '',
        updatetime: ''
      }
    }
  }
}
</script>

<style scoped></style>
