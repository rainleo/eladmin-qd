<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery"/>
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-model="query.sorted" clearable placeholder="审批级别" class="filter-item" style="width: 90px" @change="toQuery">
        <el-option v-for="item in sortedTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-model="query.source" clearable placeholder="审批范围" class="filter-item" style="width: 90px" @change="toQuery">
        <el-option v-for="item in sourceTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          v-permission="['ADMIN','AUDITCHAIN_ALL','AUDITCHAIN_CREATE']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add">新增</el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd"/>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <el-table-column prop="job.name" label="岗位"/>
      <el-table-column prop="sorted" label="审批级别"/>
      <el-table-column :show-overflow-tooltip="true" prop="source" label="审批范围" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.source ? 'success' : 'warning'">{{ scope.row.source ? '报销流程' : '申请流程' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN','AUDITCHAIN_ALL','AUDITCHAIN_EDIT','AUDITCHAIN_DELETE'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN','AUDITCHAIN_ALL','AUDITCHAIN_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)"/>
          <el-popover
            v-permission="['ADMIN','AUDITCHAIN_ALL','AUDITCHAIN_DELETE']"
            :ref="scope.row.id"
            placement="top"
            width="180">
            <p>确定删除本条数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini"/>
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
      @current-change="pageChange"/>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import { del } from '@/api/auditChain'
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
        { key: 'jobName', display_name: '岗位' }
      ],
      sortedTypeOptions: [
        { key: 1, display_name: '第一级' },
        { key: 2, display_name: '第二级' },
        { key: 3, display_name: '第三级' },
        { key: 4, display_name: '第四级' },
        { key: 5, display_name: '第五级' },
        { key: 6, display_name: '第六级' }
      ],
      sourceTypeOptions: [
        { key: 0, display_name: '申请流程' },
        { key: 1, display_name: '报销流程' }
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
      this.url = 'api/auditChain'
      const sort = 'id,desc'
      const deleted = 0
      this.params = { page: this.page, size: this.size, sort: sort, deleted: deleted }
      const query = this.query
      const type = query.type
      const value = query.value
      const sorted = query.sorted
      const source = query.source
      if (type && value) { this.params[type] = value }
      if (sorted !== '' && sorted !== null) { this.params['sorted'] = sorted }
      if (source !== '' && source !== null) { this.params['source'] = source }
      return true
    },
    subDelete(id) {
      this.delLoading = true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
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
        job: { id: data.job.id },
        sorted: data.sorted,
        source: data.source,
        createTime: data.createTime,
        updateTime: data.updateTime,
        deleted: data.deleted
      }
      _this.jobId = data.job.id
      _this.dialog = true
    }
  }
}
</script>

<style scoped>

</style>
