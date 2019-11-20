<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="query.status" clearable placeholder="状态" class="filter-item" style="width: 90px" @change="toQuery">
        <el-option v-for="item in statusTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          v-permission="['ADMIN', 'REIMBURSEMENTDOCUMENTS_ALL', 'REIMBURSEMENTDOCUMENTS_CREATE']"
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
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <el-table-column prop="id" label="主键ID" width="60px" />
      <el-table-column prop="reimbursementNo" label="单据号" width="150px" />
      <el-table-column prop="dept.name" label="部门" />
      <el-table-column prop="user.username" label="报销人" />
      <el-table-column prop="reimbursementAbstract" label="报销摘要" />
      <el-table-column prop="amount" label="报销金额" />
      <el-table-column prop="reimbursementDetailList" label="附件">
        <template slot-scope="scope">
          <i v-if="scope.row.reimbursementDetailList.length != 0">
            <el-popover trigger="hover">
              <el-table :data="scope.row.reimbursementDetailList" style="max-height:350px;overflow-y:auto">
                <el-table-column label="序号" type="index" width="60px" align="center" />
                <el-table-column label="附件" width="250px" align="center">
                  <template slot-scope="scope">
                    <el-popover placement="left" title="附件详情" trigger="click">
                      <el-image slot="reference" :src="scope.row.attachment" :alt="scope.row.attachment" style="max-height: 200px;max-width: 200px" />
                      <el-image :src="scope.row.attachment" />
                    </el-popover>
                  </template>
                </el-table-column>
              </el-table>
              <el-button slot="reference" size="mini" type="text">附件详情</el-button>
            </el-popover>
          </i>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="status" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status ? 'success' : 'warning'">{{ scope.row.status ? '已审批' : '审批中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="135px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="reviewer" label="审批人">
        <template slot-scope="scope">
          <el-popover trigger="hover">
            <el-table :data="scope.row.reviewerList" size="small" style="width: 100%">
              <el-table-column prop="sorted" label="审批顺序" />
              <el-table-column prop="user.username" label="审批人" />
              <el-table-column :show-overflow-tooltip="true" prop="auditStatus" label="审批状态">
                <template slot-scope="scope">
                  <el-tag :type="scope.row.auditStatus ? 'success' : 'warning'">{{ scope.row.auditStatus ? '已审批' : '审批中' }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-button slot="reference" size="mini" type="text">查看详情</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="status" label="状态">
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
        v-if="checkPermission(['ADMIN', 'REIMBURSEMENTDOCUMENTS_ALL', 'REIMBURSEMENTDOCUMENTS_EDIT', 'REIMBURSEMENTDOCUMENTS_DELETE'])"
        label="操作"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-permission="['ADMIN', 'REIMBURSEMENTDOCUMENTS_ALL', 'REIMBURSEMENTDOCUMENTS_EDIT']"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="edit(scope.row)"
          />
          <el-popover v-permission="['ADMIN', 'REIMBURSEMENTDOCUMENTS_ALL', 'REIMBURSEMENTDOCUMENTS_DELETE']" :ref="scope.row.id" placement="top" width="180">
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
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import { del } from '@/api/reimbursementDocuments'
import { getDepts } from '@/api/dept'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData],
  data() {
    return {
      delLoading: false,
      queryTypeOptions: [
        { key: 'id', display_name: '主键ID' },
        { key: 'reimbursementNo', display_name: '报销单号' },
        { key: 'deptName', display_name: '部门' },
        { key: 'userName', display_name: '报销人' },
        { key: 'reimbursementAbstract', display_name: '报销摘要' },
        { key: 'amount', display_name: '报销金额' }
        // { key: 'createTime', display_name: '创建时间' },
      ],
      statusTypeOptions: [{ key: 1, display_name: '已审批' }, { key: 0, display_name: '审批中' }]
    }
  },
  created() {
    this.getDeptDatas()
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.url = 'api/reimbursementDocuments'
      const sort = 'id,desc'
      const deleted = 0
      this.params = { page: this.page, size: this.size, sort: sort, deleted: deleted }
      const query = this.query
      const type = query.type
      const value = query.value
      const status = query.status
      if (type && value) {
        this.params[type] = value
      }
      if (status !== '' && status !== null) {
        this.params['status'] = status
      }
      return true
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
      this.$refs.form.getDepts()
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        reimbursementNo: data.reimbursementNo,
        status: data.status,
        dept: { id: data.dept.id },
        user: { id: data.user.id },
        reimbursementAbstract: data.reimbursementAbstract,
        amount: data.amount,
        reimbursementDetailList: data.reimbursementDetailList
      }
      _this.deptId = data.dept.id
      _this.userId = data.user.id
      _this.getUsers(_this.deptId)
      _this.dialog = true
    },
    // 获取表格序号
    getIndex($index) {
      // 表格序号
      return (this.page.currentPage - 1) * this.page.pageSize + $index + 1
    }
  }
}
</script>

<style scoped></style>
