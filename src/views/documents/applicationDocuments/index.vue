<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px" class="filter-item" @keyup.enter.native="toQuery" />
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
	   <el-select v-model="query.status" clearable placeholder="状态" class="filter-item" style="width: 90px" @change="toQuery">
	     <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
	   </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div style="display: inline-blockmargin: 0px 2px">
        <el-button
          v-permission="['ADMIN', 'APPLICATIONDOCUMENTS_ALL', 'APPLICATIONDOCUMENTS_CREATE']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add"
        >
          新增
        </el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" />
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%">
      <!-- <el-table-column prop="id" label="主键ID" /> -->
      <el-table-column prop="applicationNo" label="单据号" />
      <el-table-column prop="dept.name" label="部门" />
      <el-table-column prop="user.username" label="申请人" />
      <el-table-column prop="accountingSubjects.subjectName" label="申请事项" />
      <el-table-column prop="applicationDescription" label="事项描述" />
      <el-table-column prop="amount" label="金额" />
      <el-table-column prop="reviewer" label="审核人" align="center">
        <template slot-scope="scope">
          <el-popover trigger="hover">
            <el-table :data="scope.row.reviewerList" size="small" style="width: 100%">
              <el-table-column prop="sorted" label="审批顺序" />
              <el-table-column prop="user.username" label="审批人" />
              <el-table-column :show-overflow-tooltip="true" prop="auditStatus" label="审批状态" align="center">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.auditStatus ? 'success' : 'warning'">{{ scope.row.auditStatus ? '已审核' : '审核中' }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" size="mini" type="text">查看详情</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="status" label="状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'warning'">{{ scope.row.status ? '已审批' : '审批中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="135px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['ADMIN', 'APPLICATIONDOCUMENTS_ALL', 'APPLICATIONDOCUMENTS_EDIT', 'APPLICATIONDOCUMENTS_DELETE'])"
        label="操作"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN', 'APPLICATIONDOCUMENTS_ALL', 'APPLICATIONDOCUMENTS_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
          <el-popover v-permission="['ADMIN', 'APPLICATIONDOCUMENTS_ALL', 'APPLICATIONDOCUMENTS_DELETE']" :ref="scope.row.id" placement="top" width="180">
            <p>确定删除本条数据吗？</p>
            <div style="text-align: right margin: 0">
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
      style="margin-top: 8px"
      layout="total, prev, pager, next, sizes"
      @size-change="sizeChange"
      @current-change="pageChange"
    />
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import { del } from '@/api/applicationDocuments'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData],
  data() {
    return {
      delLoading: false,
      queryTypeOptions: [
        // { key: 'id', display_name: '主键ID' },
        { key: 'applicationNo', display_name: '单据号' },
        { key: 'deptName', display_name: '部门' },
        { key: 'userName', display_name: '申请人' },
        { key: 'subjectName', display_name: '申请事项' },
        { key: 'applicationDescription', display_name: '事项描述' },
        { key: 'amount', display_name: '金额' }
        // { key: 'createTime', display_name: '创建时间' }
      ],
	  statusTypeOptions: [
	    { key: 1, display_name: '已审批' },
	    { key: 0, display_name: '审批中' }
	  ]
    }
  },

  created() {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.url = 'api/applicationDocuments'
      const sort = 'id,desc'
      const source = 0
      const deleted = 0
      this.params = { page: this.page, size: this.size, sort: sort, source: source, deleted: deleted }
      const query = this.query
      const type = query.type
      const value = query.value
      const status = query.status
      if (type && value) {
        this.params[type] = value
      }
      if (status !== '' && status !== null) { this.params['status'] = status }
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
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        applicationNo: data.applicationNo,
        status: data.status,
        deptName: data.dept.name,
        userName: data.user.username,
        sujectName: data.accountingSubjects.subjectName,
        applicationDescription: data.applicationDescription,
        amount: data.amount,
        createTime: data.createTime,
        updatetime: data.updatetime
      }
      _this.dialog = true
    }
  }
}
</script>
<style scoped></style>
