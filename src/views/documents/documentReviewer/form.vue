<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="单据ID" prop="documents">
        <template>
          <el-select v-model="documentId" placeholder="请选择单据ID" style="width: 370px;" @select="selectFun">
            <el-option v-for="(item, index) in documents" :key="item.id + index" :label="item.id" :value="item.id">
              <span style="float: left">{{ item.id }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.source }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.applicationUser }}</span>
            </el-option>
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="审批顺序" prop="sorted">
        <el-select v-model="form.sorted" class="filter-item" style="width: 370px;" placeholder="请选择审批顺序" @select="selectFun">
          <el-option v-for="(item, index) in sortedTypeOptions" :key="item.key + index" :label="item.display_name" :value="item.key" />
        </el-select>
      </el-form-item>

      <el-form-item label="审批人" prop="users">
        <el-select v-model="userId" style="width: 370px;" placeholder="请先选择ID和审批顺序">
          <el-option v-for="(item, index) in users" :key="item.username + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="审批状态" prop="auditStatus">
        <template>
          <el-select v-model="form.auditStatus" placeholder="审批状态" class="filter-item" style="width: 370px;">
            <el-option v-for="(item, index) in auditStatusTypeOptions" :key="item.key + index" :label="item.display_name" :value="item.key" />
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
import { add, edit, getAllDocuments } from '@/api/documentReviewer'
import { getAuditUsers } from '@/api/auditChain'
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
        documentId: '',
        source: '',
        applicationUser: '',
        userId: '',
        sorted: '',
        auditStatus: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        users: [],
        documents: []
      },
      documentId: null,
      documents: [],
      users: [],
      userId: null,
      rules: {},
      sortedTypeOptions: [
        { key: 1, display_name: '第一级' },
        { key: 2, display_name: '第二级' },
        { key: 3, display_name: '第三级' },
        { key: 4, display_name: '第四级' },
        { key: 5, display_name: '第五级' },
        { key: 6, display_name: '第六级' }
      ],
      auditStatusTypeOptions: [{ key: 1, display_name: '已审批' }, { key: 0, display_name: '审批中' }]
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.documentId === null || this.documentId === undefined) {
            this.$message({
              message: 'ID不能为空',
              type: 'warning'
            })
          } else if (this.sorted === null || this.sorted === undefined) {
            this.$message({
              message: '审批顺序不能为空',
              type: 'warning'
            })
          } else if (this.userId === null || this.userId === undefined) {
            this.$message({
              message: '审批人不能为空',
              type: 'warning'
            })
          } else if (this.auditStatus === null || this.auditStatus === undefined) {
            this.$message({
              message: '审批状态不能为空',
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
      this.form = {
        id: '',
        documentId: '',
        userId: '',
        sorted: '',
        auditStatus: '',
        source: '',
        createTime: '',
        updateTime: '',
        deleted: '',
        users: [],
        documents: []
      }
    },
    selectFun(node, instanceId) {
      debugger
      this.getAuditUsers(node.sorted, node.source)
    },
    getDocuments() {
      getAllDocuments()
        .then(res => {
          this.documents = res
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },

    getAuditUsers(sorted, source) {
      debugger
      getAuditUsers({
        sorted: this.sorted,
        source: this.source
      })
        .then(res => {
          this.users = res
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    }
  }
}
</script>

<style scoped></style>
