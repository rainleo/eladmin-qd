<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button v-permission="['ADMIN', 'TODOLIST_ALL', 'TODOLIST_CREATE']" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" />
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <el-table-column prop="todoAbstract" label="摘要" />
      <el-table-column prop="copyPerson.username" label="抄送人" />
      <el-table-column prop="assistantPerson.username" label="协助人员" />
      <el-table-column prop="content" label="待办内容" />
      <el-table-column prop="createTime" label="创建时间" width="135px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="expectedCompletionTime" label="预期完成时间" width="135px">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expectedCompletionTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN', 'TODOLIST_ALL', 'TODOLIST_EDIT', 'TODOLIST_DELETE'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN', 'TODOLIST_ALL', 'TODOLIST_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
          <el-popover v-permission="['ADMIN', 'TODOLIST_ALL', 'TODOLIST_DELETE']" :ref="scope.row.id" placement="top" width="180">
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
import { del } from '@/api/todoList'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData],
  data() {
    return {
      delLoading: false,
      queryTypeOptions: [
        // { key: 'id', display_name: '自增主键ID' },
        { key: 'todoAbstract', display_name: '摘要' },
        // { key: 'expectedCompletionTime', display_name: '预期完成时间' },
        { key: 'copyPersonName', display_name: '抄送人' },
        { key: 'assistantPersonName', display_name: '协助人员' },
        { key: 'content', display_name: '待办内容' }
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
      this.url = 'api/todoList'
      const sort = 'id,desc'
      const deleted = 0
      this.params = { page: this.page, size: this.size, sort: sort, deleted: deleted }
      const query = this.query
      const type = query.type
      const value = query.value
      if (type && value) {
        this.params[type] = value
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
      debugger
      this.isAdd = false
      const _this = this.$refs.form
      _this.form = {
        id: data.id,
        todoAbstract: data.todoAbstract,
        expectedCompletionTime: data.expectedCompletionTime,
        copyPerson: { id: data.copyPerson.id },
        assistantPerson: { id: data.assistantPerson === null ? '' : data.assistantPerson.id },
        content: data.content,
        createTime: data.createTime,
        updateTime: data.updateTime,
        deleted: data.deleted
      }
      _this.copyPersonId = data.copyPerson.id
      _this.assistantPersonId = data.assistantPerson === null ? '' : data.assistantPerson.id
      _this.getUsers()
      _this.dialog = true
    }
  }
}
</script>

<style scoped></style>
