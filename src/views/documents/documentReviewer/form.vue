<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="公司">
        <el-select v-model="companyId" clearable class="filter-item" placeholder="请选择公司" style="width: 370px;" @change="selectCompanyFun">
          <el-option v-for="(item, index) in companies" :key="item.name + index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="单据ID" prop="documents">
        <el-select v-model="documentId" :options="documents" placeholder="请选择单据ID" style="width: 370px;" @change="selectSourceFun">
          <el-option v-for="(item, index) in documents" :key="index" :label="item.id" :value="item.id">
            <span style="float: left">{{ item.id }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.source }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.applicationUser }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="审批顺序" prop="sorted">
        <el-select v-model="form.sorted" clearable class="filter-item" style="width: 370px;" placeholder="请选择审批顺序" @change="selectSortedFun">
          <el-option v-for="(item, index) in sortedTypeOptions" :key="item.display_name + index" :label="item.display_name" :value="item.sortedkey" :disabled="item.disabled" />
        </el-select>
      </el-form-item>

      <el-form-item label="审批人" prop="users">
        <el-select v-model="userId" style="width: 370px;" placeholder="请先选择ID和审批顺序">
          <el-option v-for="(item, index) in users" :key="item.username + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="审批状态" prop="auditStatus">
        <template>
          <el-select v-model="form.auditStatus" placeholder="请选择审批状态" class="filter-item" style="width: 370px;">
            <el-option v-for="(item, index) in auditStatusTypeOptions" :key="item.display_name + index" :label="item.display_name" :value="item.key_name" />
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
import { add, edit, getAllDocuments, getDisableSorted } from '@/api/documentReviewer'
import { getDepts } from '@/api/dept'
import { getAuditUsers } from '@/api/auditChain'
import { Select, Option } from 'element-ui'
export default {
  components: { Select, Option },
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
        source: '',
        applicationUser: '',
        sorted: '',
        auditStatus: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        users: { id: '' },
        company: { id: '' }
      },
      companies: [],
      companyId: null,
      documentId: null,
      userId: null,
      documents: [],
      users: [],
      sortedTypeOptions: [
        { sortedkey: 1, display_name: '第一级', disabled: false },
        { sortedkey: 2, display_name: '第二级', disabled: false },
        { sortedkey: 3, display_name: '第三级', disabled: false },
        { sortedkey: 4, display_name: '第四级', disabled: false },
        { sortedkey: 5, display_name: '第五级', disabled: false },
        { sortedkey: 6, display_name: '第六级', disabled: false }
      ],
      auditStatusTypeOptions: [{ key_name: 1, display_name: '已审批' }, { key_name: 0, display_name: '审批中' }],
      rules: {
        sorted: [{ required: true, message: '审批顺序不能为空', trigger: 'blur' }],
        auditStatus: [{ required: true, message: '审批状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.form.userId = this.userId
      this.form.companyId = this.companyId
      this.form.documentId = this.documentId
      this.form.company = null
      this.form.user = null
      this.form.source = this.source
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.companyId === null || this.companyId === undefined) {
            this.$message({
              message: '公司不能为空',
              type: 'warning'
            })
          } else if (this.documentId === null || this.documentId === undefined) {
            this.$message({
              message: 'ID不能为空',
              type: 'warning'
            })
          } else if (this.userId === null || this.userId === undefined) {
            this.$message({
              message: '审批人不能为空',
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
      this.companyId = null
      this.documentId = null
      this.userId = null
      this.sorted = null
      this.form = {
        id: '',
        documentId: '',
        sorted: '',
        auditStatus: '',
        source: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        users: [],
        documents: [],
        companies: []
      }
      for (var i = 0; i < this.sortedTypeOptions.length; i++) {
        this.sortedTypeOptions[i].disabled = false
      }
    },

    // 选择单据ID绑定@change事件
    selectSourceFun(node) {
      if (node) {
        this.source = (this.documents.find(o => o.id === node).source === '申请流程' ? 0 : 1)
        this.getDisableSorted(node, this.source)
        if (this.sorted) {
          this.getAuditUsers(this.sorted, this.source)
        }
      }
    },

    selectCompanyFun(node) {
      this.getDocuments(node)
      this.documentId = null
    },
    // 选择审批顺序绑定@change事件
    selectSortedFun(node) {
      if (node === null || node === undefined) {
        return false
      }
      this.sorted = node
      if (this.source === null || this.source === undefined) {
        return false
      }
      this.getAuditUsers(this.companyId, this.sorted, this.source)
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
    getDocuments(id) {
      getAllDocuments({ companyId: id === null ? -1 : id })
        .then(res => {
          this.documents = res
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },

    getAuditUsers(sorted, source) {
      getAuditUsers({
        companyId: this.companyId,
        sorted: this.sorted,
        source: this.source
      })
        .then(res => {
          this.users = res
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getDisableSorted(id, source) {
      getDisableSorted({
        documentId: id,
        source: this.source
      })
        .then(res => {
          if (res.length !== 0) {
            for (var i = 0; i < this.sortedTypeOptions.length; i++) {
              if (res.indexOf(this.sortedTypeOptions[i].sortedkey) > -1) {
                this.sortedTypeOptions[i].disabled = true
              } else {
                // 这部分要还原
                this.sortedTypeOptions[i].disabled = false
              }
            }
          }
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    }
  }
}
</script>

<style scoped></style>
