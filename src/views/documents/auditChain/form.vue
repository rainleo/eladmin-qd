<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="公司">
        <el-select v-model="companyId" clearable class="filter-item" placeholder="请选择公司" style="width: 370px;" @change="selectCompanyFun">
          <el-option v-for="(item, index) in companies" :key="item.name + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="deptId" clearable class="filter-item" placeholder="请先选择公司" style="width: 370px;" @change="selectDeptFun">
          <el-option v-for="(item, index) in depts" :key="item.id + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位">
        <el-select v-model="jobId" clearable class="filter-item" placeholder="请先选择部门" style="width: 370px;">
          <el-option v-for="(item, index) in jobs" :key="item.name + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="审批级别" prop="sorted">
        <template>
          <el-select v-model="form.sorted" clearable placeholder="审批级别" class="filter-item" style="width: 370px;">
            <el-option v-for="item in sortedTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="审批范围" prop="source">
        <template>
          <el-select v-model="form.source" clearable placeholder="审批范围" class="filter-item" style="width: 370px;">
            <el-option v-for="item in sourceTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from '@/api/auditChain'
import { getDepts } from '@/api/dept'
import { getAllJob } from '@/api/job'
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
      sortedTypeOptions: [
        { key: 1, display_name: '第一级' },
        { key: 2, display_name: '第二级' },
        { key: 3, display_name: '第三级' },
        { key: 4, display_name: '第四级' },
        { key: 5, display_name: '第五级' },
        { key: 6, display_name: '第六级' }
      ],
      sourceTypeOptions: [{ key: 0, display_name: '申请流程' }, { key: 1, display_name: '报销流程' }],
      form: {
        id: '',
        jobs: { id: '' },
        sorted: '',
        source: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        job: { id: '' },
        dept: { id: '' }
      },
      depts: [],
      deptId: null,
      jobId: null,
      jobs: [],
      companies: [],
      companyId: null,
      rules: {
        sorted: [{ required: true, message: '审批级别不能为空', trigger: 'blur' }],
        source: [{ required: true, message: '审批范围不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.form.deptId = this.deptId
      this.form.jobId = this.jobId
      this.form.companyId = this.companyId
      this.form.dept = null
      this.form.company = null
      this.form.job = null
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
          } else if (this.jobId === null || this.jobId === undefined) {
            this.$message({
              message: '岗位不能为空',
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
      this.jobId = null
      this.companyId = null
      this.depts = []
      this.jobs = []
      this.form = {
        id: '',
        jobs: { id: '' },
        sorted: '',
        source: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        job: { id: '' }, dept: { id: '' }, company: { id: '' }
      }
    },
    getJobs(id) {
      getAllJob(id)
        .then(res => {
          this.jobs = res.content
          for (var i = 0; i < this.jobs.length; i++) {
            if (!this.jobs[i].enabled) {
              this.jobs[i].disabled = true
            }
          }
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getDepts(id) {
      getDepts({ pid: id === null ? -1 : id })
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
    selectCompanyFun(node) {
      this.getDepts(node)
      this.deptId = null
    },
    selectDeptFun(node) {
      this.getJobs(node)
      this.jobId = null
    }
  }
}
</script>

<style scoped></style>
