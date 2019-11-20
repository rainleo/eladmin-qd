<template>
  <el-dialog :append-to-body="true" :visible.sync="dialog" :title="isAdd ? '新增' : '编辑'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="部门" prop="depts"><treeselect v-model="deptId" :options="depts" style="width: 370px;" placeholder="选择部门" @select="selectFun" /></el-form-item>
      <el-form-item label="报销人" prop="users">
        <el-select v-model="userId" style="width: 370px;" placeholder="请先选择部门">
          <el-option v-for="(item, index) in users" :key="item.username + index" :label="item.username" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <template>
          <el-select v-model="form.status" placeholder="请选择" style="width: 370px;" filterable>
            <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </template>
      </el-form-item>
      <el-form-item label="报销摘要" prop="reimbursementAbstract"><el-input v-model.trim="form.reimbursementAbstract" style="width: 370px;" /></el-form-item>
      <el-form-item label="报销金额" prop="amount"><el-input v-model.number="form.amount" style="width: 370px;" /></el-form-item>
      <el-form-item v-model="form.reimbursementDetailList" prop="reimbursementDetailList" label="附件">
        <template slot-scope="scope">
          <el-upload
            ref="upload"
            :file-list="getFileList(form.reimbursementDetailList)"
            :auto-upload="false"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :before-remove="handleBeforeRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :headers="headers"
            :action="qiNiuUploadApi"
            class="upload-demo"
            list-type="picture-card"
            multiple
          >
            <i class="el-icon-plus" />
          </el-upload>
          <el-dialog :visible.sync="dialogVisible"><img :src="dialogImageUrl" width="100%" alt="" ></el-dialog>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
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
import checkPermission from '@/utils/permission'
import { add, edit } from '@/api/reimbursementDocuments'
import { del } from '@/api/reimbursementDetail'
import { getDepts } from '@/api/dept'
import { getUsers } from '@/api/user'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
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
      delLoading: false,
      loading: false,
      dialog: false,
      dialogImageUrl: '',
      dialogVisible: false,
      headers: { Authorization: 'Bearer ' + getToken() },
      form: {
        status: '',
        reimbursementAbstract: '',
        amount: '',
        attachment: '',
        reimbursementDetailList: []
      },
      depts: [],
      deptId: null,
      userId: null,
      users: [],
      reimbursementDetailList: [],
      rules: {
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        reimbursementAbstract: [{ required: true, message: '摘要不能为空', trigger: 'blur' }],
        amount: [{ required: true, trigger: 'blur', validator: validAmount }]
      },
      statusTypeOptions: [{ key: 1, display_name: '已审批' }, { key: 0, display_name: '审批中' }],
      fileList: [{ name: '', url: '' }],
      files: []
    }
  },
  computed: {
    // 映射 this.qiNiuUploadApi 为 store.getters.qiNiuUploadApi
    ...mapGetters(['qiNiuUploadApi'])
  },
  methods: {
    checkPermission,
    cancel() {
      this.resetForm()
    },
    doSubmit() {
      this.form.deptId = this.deptId
      this.form.userId = this.userId
      this.form.user = null
      this.form.dept = null
      this.form.reimbursementDetailList = this.reimbursementDetailList
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.deptId === null || this.deptId === undefined) {
            this.$message({
              message: '部门不能为空',
              type: 'warning'
            })
          } else if (this.userId === null || this.userId === undefined) {
            this.$message({
              message: '报销人不能为空',
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
    subDelete(id) {
      this.delLoading = true
      del(id)
        .then(res => {
          this.delLoading = false
          this.$refs[id].doClose()
          this.dleChangePage()
          this.init()
          this.$notify({
            title: '删除成功',
            type: 'success',
            duration: 2500
          })
        })
        .catch(err => {
          this.delLoading = false
          this.$refs[id].doClose()
          console.log(err.response.data.message)
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
      this.form = {
        status: '',
        dept: {
          id: ''
        },
        user: {
          id: ''
        },
        reimbursementAbstract: '',
        amount: null
      }
    },
    getUsers(id) {
      getUsers({
        deptId: this.id,
        enabled: true
      })
        .then(res => {
          this.users = res.content
        })
        .catch(err => {
          console.log(err.response.data.message)
        })
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    isvalidAmount(str) {
      const reg = /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/
      return reg.test(str)
    },
    selectFun(node, instanceId) {
      this.getUsers(node.id)
    },

    // +++++++++++++++++++++++++++++上传图片+++++++++++++++++++++++++++++++
    getFileList(reimbursementDetailList) {
      if (reimbursementDetailList === null || reimbursementDetailList === undefined || reimbursementDetailList.length === 0) {
        return []
      }
      for (var i = 0; i < reimbursementDetailList.length; i++) {
        this.fileList[i] = { name: reimbursementDetailList[i].id, url: reimbursementDetailList[i].attachment }
      }
      return this.fileList
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.id
      const attachment = response.data[0]
      this.files.push({ uid, id })
      this.reimbursementDetailList.push({ attachment })
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          del(this.files[i].id).then(res => {})
          return true
        }
      }
    },

    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
    }
  }
}
</script>

<style scoped></style>
