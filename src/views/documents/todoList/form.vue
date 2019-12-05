<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="520px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
      <el-form-item label="公司">
        <el-select v-model="companyId" style="width: 350px;" clearable class="filter-item" placeholder="请选择公司" @change="selectCompanyFun">
          <el-option v-for="(item, index) in companies" :key="item.name + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="摘要" prop="todoAbstract"><el-input v-model.trim="form.todoAbstract" style="width: 350px;" /></el-form-item>
      <el-form-item label="预期完成时间" prop="expectedCompletionTime" style="width: 350px;">
        <template>
          <el-date-picker v-model="form.expectedCompletionTime" :picker-options="pickerOptions" type="datetime" placeholder="选择日期时间" align="right" style="width: 350px;" />
        </template>
      </el-form-item>
      <el-form-item label="抄送人" prop="copyPerson">
        <el-select v-model="copyPersonId" style="width: 350px;" placeholder="请选择抄送人" >
          <el-option v-for="(item, index) in copyPerson" :key="item.username + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="协助人员" prop="assistantPerson">
        <el-select v-model="assistantPersonId" style="width: 350px;" placeholder="请选择协助人员" >
          <el-option v-for="(item, index) in assistantPerson" :key="item.username + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <template>
          <el-select v-model="form.status" placeholder="请选择" style="width: 350px;" filterable>
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="待办内容" prop="content"><el-input v-model.trim="form.content" style="width: 350px;" /></el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/todoList'
import { getDepts } from '@/api/dept'
import { getUsers } from '@/api/user'

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
        todoAbstract: '',
        expectedCompletionTime: '',
        content: '',
        status: ''
      },
      copyPersonId: null,
      assistantPersonId: null,
      copyPerson: [],
      assistantPerson: [],
      companies: [],
      companyId: null,
      rules: {
        todoAbstract: [{ required: true, message: '摘要不能为空', trigger: 'blur' }],
        expectedCompletionTime: [{ required: true, message: '预期完成时间不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '待办内容不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      },
      statusTypeOptions: [{ key: 1, display_name: '已完成' }, { key: 0, display_name: '待完成' }],
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date())
            }
          },
          {
            text: '明天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          },
          {
            text: '一周后',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }
        ]
      },
      expectedCompletionTime: ''
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.form.companyId = this.companyId
      this.form.copyPersonId = this.copyPersonId
      this.form.assistantPersonId = this.assistantPersonId
      // 置空，防止关联的user对象不为空，关联修改数据库报错
      this.form.company = null
      this.form.copyPerson = null
      this.form.assistantPerson = null
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.companyId === null || this.companyId === undefined) {
            this.$message({
              message: '公司不能为空',
              type: 'warning'
            })
          } else if (this.copyPersonId === null || this.copyPersonId === undefined) {
            this.$message({
              message: '抄送人不能为空',
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
      this.copyPersonId = null
      this.assistantPersonId = null
      this.companyId = null
      this.copyPerson = []
      this.assistantPerson = []
      this.form = {
        status: '',
        todoAbstract: '',
        expectedCompletionTime: '',
        company: {
          id: ''
        },
        copyPerson: {
          id: ''
        },
        assistantPerson: {
          id: ''
        },
        content: ''
      }
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
    getUsers(id) {
      getUsers({
        companyId: id,
        enabled: true
      })
        .then(res => {
          this.copyPerson = res.content
          this.assistantPerson = res.content
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    selectCompanyFun(node) {
      this.getUsers(node)
      this.copyPersonId = null
      this.assistantPersonId = null
    }
  }
}
</script>

<style scoped></style>
