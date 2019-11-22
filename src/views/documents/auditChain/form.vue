<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="岗位" prop="jobs">
        <template>
          <el-select v-model="jobId" placeholder="请选择" style="width: 370px;" filterable @focus="getJobs">
            <el-option v-for="(item, index) in jobs" :key="item.name + index" :label="item.name" :value="item.id" />
          </el-select>
        </template>
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
import { getJobs } from '@/api/job'
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
        deleted: ''
      },
      jobId: null,
      jobs: [],
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
      this.form.jobId = this.jobId
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.jobId === null || this.jobId === undefined) {
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
      this.jobId = null
      this.form = {
        id: '',
        jobs: { id: '' },
        sorted: '',
        source: '',
        createTime: '',
        updateTime: '',
        deleted: ''
      }
    },
    getJobs() {
      getJobs({ enabled: 1 })
        .then(res => {
          this.jobs = res.content
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    }
  }
}
</script>

<style scoped></style>
