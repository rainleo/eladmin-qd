<template>
  <div class="app-container">
    <!--form 组件-->
    <eForm ref="form" :is-add="isAdd" :dicts="dicts" />
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :xs="7" :sm="6" :md="4" :lg="4" :xl="4">
        <div class="head-container">
          <el-input v-model="deptName" clearable placeholder="输入公司名称搜索" prefix-icon="el-icon-search" style="width: 100%;" class="filter-item" @input="getDeptDatas" />
        </div>
        <el-tree :data="depts" :props="defaultProps" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick" />
      </el-col>
      <!--用户数据-->
      <el-col :xs="17" :sm="18" :md="20" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <!-- 搜索 -->
          <el-input v-model="query.value" clearable placeholder="输入关键字搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
          <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
            <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
          <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 90px" @change="toQuery">
            <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
          <!-- 新增 -->
          <div v-permission="['ADMIN', 'USER_ALL', 'USER_CREATE']" style="display: inline-block;margin: 0px 2px;">
            <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
          </div>
          <!-- 导出 -->
          <div style="display: inline-block;">
            <el-button v-permission="['ADMIN']" :loading="downloadLoading" size="mini" class="filter-item" type="warning" icon="el-icon-download" @click="download">导出</el-button>
          </div>
          <!-- 模板下载 -->
          <div style="display: inline-block;">
            <el-button v-permission="['ADMIN']" :loading="downloadTemplateLoading" size="mini" class="filter-item" type="success" icon="el-icon-download" @click="downloadTemplate">
              模板下载
            </el-button>
          </div>
          <div style="display: inline-block;margin: 0px 2px;">
            <el-button class="filter-item" size="mini" type="primary" icon="el-icon-upload" @click="dialog = true">导入</el-button>
          </div>
        </div>
        <!-- 文件上传 -->
        <el-dialog :visible.sync="dialog" append-to-body width="500px" @close="doSubmit">
          <el-upload
            :before-remove="handleBeforeRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :file-list="fileList"
            :headers="headers"
            :action="userImportApi"
            class="upload-demo"
            multiple
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传xlsx结尾的文件，勿上传非法文件</div>
          </el-upload>
          <div slot="footer" class="dialog-footer"><el-button type="primary" @click="doSubmit">确认</el-button></div>
        </el-dialog>
        <!--表格渲染-->
        <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="phone" label="电话" />
          <el-table-column :show-overflow-tooltip="true" prop="email" label="邮箱" />
          <el-table-column label="部门 / 岗位">
            <template slot-scope="scope">
              <div>{{ scope.row.dept.name }} / {{ scope.row.job.name }}</div>
            </template>
          </el-table-column>
          <el-table-column v-model="companyId" prop="company.name" label="公司"/>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <div v-for="item in dicts" :key="item.id">
                <el-tag v-if="scope.row.enabled.toString() === item.value" :type="scope.row.enabled ? '' : 'info'">{{ item.label }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建日期">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="checkPermission(['ADMIN', 'USER_ALL', 'USER_EDIT', 'USER_DELETE'])" label="操作" width="125" align="center">
            <template slot-scope="scope">
              <el-button v-permission="['ADMIN', 'USER_ALL', 'USER_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
              <el-popover v-permission="['ADMIN', 'USER_ALL', 'USER_DELETE']" :ref="scope.row.id" placement="top" width="180">
                <p>确定删除本条数据吗？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                  <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row.id)">确定</el-button>
                </div>
                <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini" />
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <el-pagination
          :total="total"
          :current-page="page + 1"
          style="margin-top: 8px;"
          layout="total, prev, pager, next, sizes"
          @size-change="sizeChange"
          @current-change="pageChange"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initDict from '@/mixins/initDict'
import { del } from '@/api/user'
import { getDepts } from '@/api/dept'
import { parseTime } from '@/utils/index'
import eForm from './form'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
export default {
  components: { eForm },
  mixins: [initData, initDict],
  data() {
    return {
      height: document.documentElement.clientHeight - 180 + 'px;',
      isAdd: false,
      delLoading: false,
      deptName: '',
      depts: [],
      deptId: null,
      companies: [],
      companyId: null,
      pid: null,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      downloadLoading: false,
      downloadTemplateLoading: false,
      queryTypeOptions: [{ key: 'username', display_name: '用户名' }, { key: 'email', display_name: '邮箱' }],
      enabledTypeOptions: [{ key: 'true', display_name: '激活' }, { key: 'false', display_name: '锁定' }],

      headers: { Authorization: 'Bearer ' + getToken() },
      dialog: false,
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [],
      files: []
    }
  },
  computed: {
    ...mapGetters(['userImportApi'])
  },
  created() {
    this.getDeptDatas()
    this.$nextTick(() => {
      this.init()
      // 加载数据字典
      this.getDict('user_status')
    })
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.url = 'api/users'
      const sort = 'id,desc'
      const query = this.query
      const type = query.type
      const value = query.value
      const enabled = query.enabled
      const companyId = this.pid
      this.params = { page: this.page, size: this.size, sort: sort, deptId: this.deptId }
      if (type && value) {
        this.params[type] = value
      }
      if (enabled !== '' && enabled !== null) {
        this.params['enabled'] = enabled
      }
      if (companyId !== '' && companyId !== null) {
        this.params['companyId'] = companyId
      }
      return true
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
    getDeptDatas() {
      const sort = 'id,desc'
      const params = { sort: sort }
      if (this.deptName) {
        params['name'] = this.deptName
      }
      getDepts(params).then(res => {
        this.depts = res.content
      })
    },
    handleNodeClick(data) {
      this.pid = data.pid
      if (data.pid === 0) {
        this.deptId = null
      } else {
        this.deptId = data.id
      }
      this.init()
    },
    add() {
      this.isAdd = true
      this.$refs.form.getDepts()
      this.$refs.form.getCompanies()
      this.$refs.form.getRoles()
      this.$refs.form.getRoleLevel()
      this.$refs.form.dialog = true
    },
    // 导出
    download() {
      this.downloadLoading = true
      import('@/utils/export2Excel').then(excel => {
        const tHeader = ['ID', '用户名', '邮箱', '头像地址', '状态', '注册日期', '最后修改密码日期']
        const filterVal = ['id', 'username', 'email', 'avatar', 'enabled', 'createTime', 'lastPasswordResetTime']
        const data = this.formatJson(filterVal, this.data)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    // 数据转换
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j === 'createTime' || j === 'lastPasswordResetTime') {
            return parseTime(v[j])
          } else if (j === 'enabled') {
            return parseTime(v[j]) ? '启用' : '禁用'
          } else {
            return v[j]
          }
        })
      )
    },
    // 模板下载
    downloadTemplate() {
      this.downloadTemplateLoading = true
      import('@/utils/export2Excel').then(excel => {
        const tTemplateHeader = ['公司', '用户名', '手机号', '邮箱', '部门', '职位']
        const templatedata = []
        excel.export_json_to_excel({
          header: tTemplateHeader,
          data: templatedata,
          filename: 'template-list'
        })
        this.downloadTemplateLoading = false
      })
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.getRoles()
      _this.getRoleLevel()
      _this.roleIds = []
      _this.form = {
        id: data.id,
        username: data.username,
        phone: data.phone,
        email: data.email,
        enabled: data.enabled.toString(),
        roles: [],
        dept: { id: data.dept.id },
        job: { id: data.job.id },
        company: { id: data.company.pid }
      }
      data.roles.forEach(function(data, index) {
        _this.roleIds.push(data.id)
      })
      _this.deptId = data.dept.id
      _this.jobId = data.job.id
      _this.companyId = data.company.id
      _this.getCompanies()
      _this.getDepts(_this.companyId)
      _this.getJobs(_this.deptId)
      _this.dialog = true
    },
    // 导入
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.id
      this.files.push({ uid, id })
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          del(this.files[i].id).then(res => {})
          return true
        }
      }
    },
    // 刷新列表数据
    doSubmit() {
      this.fileList = []
      this.dialogVisible = false
      this.dialogImageUrl = ''
      this.dialog = false
      this.init()
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
