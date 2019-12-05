<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="公司">
        <el-select v-model="companyId" :style="style" clearable class="filter-item" placeholder="请选择公司" style="width: 370px;" @change="selectCompanyFun">
          <el-option v-for="(item, index) in companies" :key="item.name + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="deptId" :style="style" clearable class="filter-item" placeholder="请先选择公司" style="width: 370px;" @change="selectDeptFun">
          <el-option v-for="(item, index) in depts" :key="item.id + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请人" prop="users">
        <el-select v-model="userId" style="width: 370px;" placeholder="请先选择部门">
          <el-option v-for="(item, index) in users" :key="item.id + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <template>
          <el-select v-model="form.status" placeholder="请选择" style="width: 370px;" filterable>
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="申请事项" prop="accountingSubjects">
        <template>
          <el-select v-model="accountingSubjectsId" placeholder="请先选择公司" style="width: 370px;" >
            <el-option v-for="(item, index) in accountingSubjects" :key="item.id + index" :label="item.subjectName" :value="item.id" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="事项描述"><el-input v-model.trim="form.applicationDescription" style="width: 370px;" /></el-form-item>
      <el-form-item label="金额" prop="amount"><el-input v-model.number="form.amount" style="width: 370px;" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/applicationDocuments'
import { getAccountingSubjects } from '@/api/accountingSubjects'
import { getDepts } from '@/api/dept'
import { getUsers } from '@/api/user'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  components: { Treeselect },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    }
  },
  data() {
    const validAmount = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入金额'))
      } else if (!this.isvalidAmount(value)) {
        callback(new Error('请输入正确的金额'))
      } else {
        callback()
      }
    }
    return {
      dialog: false,
      loading: false,
      form: {
        status: '',
        applicationDescription: '',
        amount: ''
      },
      depts: [],
      deptId: null,
      companies: [],
      companyId: null,
      userId: null,
      users: [],
      accountingSubjectsId: null,
      accountingSubjects: [],
      rules: {
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        amount: [{ required: true, trigger: 'blur', validator: validAmount }]
      },
      statusTypeOptions: [{ key: 1, display_name: '已审批' }, { key: 0, display_name: '审批中' }]
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.form.deptId = this.deptId
      this.form.userId = this.userId
      this.form.companyId = this.companyId
      this.form.accountingSubjectsId = this.accountingSubjectsId
      this.form.user = null
      this.form.dept = null
      this.form.company = null
      this.form.accountingSubjects = null
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.companyId === null || this.companyId === undefined) {
            this.$message({
              message: '公司不能为空',
              type: 'warning'
            })
          } else if (this.deptId === null || this.deptId === undefined) {
            this.$message({
              message: '部门不能为空',
              type: 'warning'
            })
          } else if (this.userId === null || this.userId === undefined) {
            this.$message({
              message: '申请人不能为空',
              type: 'warning'
            })
          } else if (this.accountingSubjectsId === null || this.accountingSubjectsId === undefined) {
            this.$message({
              message: '事项不能为空',
              type: 'warning'
            })
          } else {
            this.loading = true
            if (this.isAdd) {
              this.doAdd()
            } else this.doEdit()
          }
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
      this.deptId = null
      this.userId = null
      this.accountingSubjectsId = null
      this.companyId = null
      this.depts = []
      this.users = []
      this.accountingSubjects = []
      this.form = {
        status: '',
        dept: {
          id: ''
        },
        company: {
          id: ''
        },
        user: {
          id: ''
        },
        accountingSubjects: {
          id: ''
        },
        applicationDescription: '',
        amount: null
      }
    },
    getAccountingSubjects(id) {
      getAccountingSubjects({ deleted: 0, companyId: id })
        .then(res => {
          this.accountingSubjects = res.content
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getUsers(id) {
      getUsers({
        deptId: id,
        enabled: true
      })
        .then(res => {
          this.users = res.content
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getDepts(id) {
      getDepts({ pid: id })
        .then(res => {
          this.depts = res.content
          for (var i = 0; i < this.depts.length; i++) {
            if (!this.depts[i].enabled) {
              this.depts[i].disabled = true
            }
          }
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getCompanies() {
      getDepts({ pid: 1 })
        .then(res => {
          this.companies = res.content
          for (var i = 0; i < this.companies.length; i++) {
            if (!this.companies[i].enabled) {
              this.companies[i].disabled = true
            }
          }
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    isvalidAmount(str) {
      const reg = /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/
      return reg.test(str)
    },
    selectCompanyFun(node) {
      this.getDepts(node)
      this.getAccountingSubjects(node)
      this.deptId = null
      this.accountingSubjectsId = null
    },
    selectDeptFun(node) {
      this.getUsers(node)
      this.userId = null
    }
  }
}
</script>

<style scoped></style>
