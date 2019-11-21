<template>
  <el-dialog :append-to-body="true" :before-close="cancel" :visible.sync="dialog" :title="isAdd ? '新增部门' : '编辑部门'" width="500px">
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="名称" prop="name"><el-input v-model="form.name" style="width: 370px;" /></el-form-item>
      <el-form-item v-if="form.pid !== 0" label="状态" prop="enabled">
        <el-radio v-for="item in dicts" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
      </el-form-item>
      <el-form-item v-if="form.pid !== 0" style="margin-bottom: 0px;" label="上级部门">
        <treeselect v-model="form.pid" :options="depts" style="width: 370px;" placeholder="选择上级类目" />
      </el-form-item>
      <el-form-item v-model="form.deptDetailList" prop="deptDetailList" label="附件">
        <template slot-scope="scope">
          <el-upload
            ref="upload"
            :file-list="getFileList(form.deptDetailList)"
            :auto-upload="false"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :before-remove="handleBeforeRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeAvatarUpload"
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
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过20MB</div>
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
import { add, edit, getDepts } from '@/api/dept'
import { del } from '@/api/deptDetail'
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
    },
    dicts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      dialogImageUrl: '',
      dialogVisible: false,
      depts: [],
      headers: { Authorization: 'Bearer ' + getToken() },
      form: {
        id: '',
        name: '',
        pid: 1,
        enabled: 'true',
        deptDetailList: []
      },
      deptDetailList: [],
      fileList: [{ name: '', url: '' }],
      files: [],
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
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
      this.form.deptDetailList = this.deptDetailList
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.pid !== undefined) {
            this.loading = true
            if (this.isAdd) {
              this.doAdd()
            } else this.doEdit()
          } else {
            this.$message({
              message: '上级部门不能为空',
              type: 'warning'
            })
          }
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
      this.deptDetailList = []
      this.form = {
        id: '',
        name: '',
        pid: 1,
        enabled: 'true',
        deptDetailList: []
      }
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    // +++++++++++++++++++++++++++++上传图片+++++++++++++++++++++++++++++++
    getFileList(deptDetailList) {
      debugger
      if (deptDetailList === null || deptDetailList === undefined || deptDetailList.length === 0) {
        return []
      }
      for (var i = 0; i < deptDetailList.length; i++) {
        this.fileList[i] = { name: deptDetailList[i].id, url: deptDetailList[i].attachment }
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
      debugger
      const uid = file.uid
      const id = response.id
      // const attachment = response.data[0]
      const qiniuContent = response.qiniuContent
      this.files.push({ uid, id })
      this.deptDetailList.push({
        attachment: qiniuContent.url,
        name: qiniuContent.key,
        bucket: qiniuContent.bucket,
        size: qiniuContent.size,
        type: qiniuContent.type
      })
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          del(this.files[i].id).then(res => {})
          return true
        }
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg/png'
      const isLt2M = file.size / 1024 / 1024 < 20

      if (!isJPG) {
        this.$message.error('上传文件只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 20MB!')
      }
      return isJPG && isLt2M
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
