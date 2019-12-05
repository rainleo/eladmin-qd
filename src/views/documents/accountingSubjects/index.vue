<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <!--公司数据-->
      <el-input v-model="query.companyName" clearable placeholder="输入公司" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button v-permission="['ADMIN', 'ACCOUNTINGSUBJECTS_ALL', 'ACCOUNTINGSUBJECTS_CREATE']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">
          新增
        </el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" />
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <!-- <el-table-column prop="id" label="主键ID"/> -->
      <el-table-column v-model="companyId" prop="company.name" label="公司" />
      <el-table-column prop="subjectCode" label="科目代码" />
      <el-table-column prop="subjectName" label="科目名称" />
      <el-table-column prop="auxiliaryAccountType" label="辅助账类型" />
      <el-table-column prop="itemDetails" label="辅助核算项目明细" />
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['ADMIN', 'ACCOUNTINGSUBJECTS_ALL', 'ACCOUNTINGSUBJECTS_EDIT', 'ACCOUNTINGSUBJECTS_DELETE'])"
        label="操作"
        width="150px"
        align="center"
      >
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN', 'ACCOUNTINGSUBJECTS_ALL', 'ACCOUNTINGSUBJECTS_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
          <el-popover v-permission="['ADMIN', 'ACCOUNTINGSUBJECTS_ALL', 'ACCOUNTINGSUBJECTS_DELETE']" :ref="scope.row.id" placement="top" width="180">
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
import { del } from '@/api/accountingSubjects'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData],
  data() {
    return {
      delLoading: false,
      companies: [],
      companyId: null,
      queryTypeOptions: [
        // { key: 'id', display_name: '自增主键ID' },
        { key: 'subjectCode', display_name: '科目代码' },
        { key: 'subjectName', display_name: '科目名称' },
        { key: 'auxiliaryAccountType', display_name: '辅助账类型' },
        { key: 'itemDetails', display_name: '辅助核算项目明细' }
        // { key: 'createTime', display_name: '创建时间' }
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
      this.url = 'api/accountingSubjects'
      const sort = 'id,desc'
      const deleted = '0'
      this.params = { page: this.page, size: this.size, sort: sort, deleted: deleted }
      const query = this.query
      const type = query.type
      const value = query.value
      const companyName = query.companyName
      if (type && value) {
        this.params[type] = value
      }
      if (companyName) {
        this.params['companyName'] = query.companyName
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
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        subjectCode: data.subjectCode,
        subjectName: data.subjectName,
        auxiliaryAccountType: data.auxiliaryAccountType,
        itemDetails: data.itemDetails,
        createTime: data.createTime,
        updatetime: data.updatetime,
        company: { id: data.company.pid }
      }
      _this.companyId = data.company.id
      _this.getCompanies()
      _this.dialog = true
    }
  }
}
</script>

<style scoped></style>
