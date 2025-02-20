<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 搜索 -->
      <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px" class="filter-item" @keyup.enter.native="toQuery" />
      <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
        <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-select v-model="query.enabled" clearable placeholder="状态" class="filter-item" style="width: 90px" @change="toQuery">
        <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
      <!-- 新增 -->
      <div v-permission="['ADMIN', 'DEPT_ALL', 'DEPT_CREATE']" style="display: inline-block;margin: 0px 2px;">
        <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="add">新增</el-button>
      </div>
      <div style="display: inline-block;">
        <el-button class="filter-item" size="mini" type="warning" icon="el-icon-more" @click="changeExpand">{{ $parent.expand ? '折叠' : '展开' }}</el-button>
        <eForm ref="form" :is-add="true" :dicts="dicts" />
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" :dicts="dicts" />
    <!--表格渲染-->
    <tree-table v-loading="loading" :expand-all="expand" :data="data" :columns="columns" size="small">
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <div v-for="item in dicts" :key="item.id">
            <el-tag v-if="scope.row.enabled.toString() === item.value" :type="scope.row.enabled ? '' : 'info'">{{ item.label }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="deptDetailList" label="附件">
        <template slot-scope="scope">
          <i v-if="scope.row.deptDetailList.length != 0">
            <el-popover trigger="hover">
              <el-table :data="scope.row.deptDetailList" style="max-height:350px;overflow-y:auto">
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
      <el-table-column prop="createdByUser.username" label="创建人"/>
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN', 'DEPT_ALL', 'DEPT_EDIT', 'DEPT_DELETE'])" label="操作" width="130px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN', 'DEPT_ALL', 'DEPT_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)" />
          <el-popover v-permission="['ADMIN', 'DEPT_ALL', 'DEPT_DELETE']" :ref="scope.row.id" placement="top" width="180">
            <p>确定删除本条数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" :disabled="scope.row.id === 1" type="danger" icon="el-icon-delete" size="mini" />
          </el-popover>
        </template>
      </el-table-column>
    </tree-table>
  </div>
</template>

<script>
import treeTable from '@/components/TreeTable'
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initDict from '@/mixins/initDict'
import { del } from '@/api/dept'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm, treeTable },
  mixins: [initData, initDict],
  data() {
    return {
      columns: [
        {
          text: '名称',
          value: 'name'
        }
      ],
      queryTypeOptions: [
        { key: 'name', display_name: '部门名称' },
        { key: 'userName', display_name: '创建人' }
      ],
      enabledTypeOptions: [{ key: 'true', display_name: '正常' }, { key: 'false', display_name: '禁用' }],
      delLoading: false,
      expand: true,
      deptDetailList: []
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
      // 加载数据字典
      this.getDict('dept_status')
    })
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.deptDetailList = []
      this.url = 'api/dept'
      const sort = 'id,desc'
      this.params = { page: this.page, size: this.size, sort: sort }
      const query = this.query
      const type = query.type
      const value = query.value
      const enabled = query.enabled
      if (type && value) {
        this.params[type] = value
      }
      if (enabled !== '' && enabled !== null) {
        this.params['enabled'] = enabled
      }
      return true
    },
    subDelete(id) {
      this.delLoading = true
      del(id)
        .then(res => {
          this.delLoading = false
          this.$refs[id].doClose()
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
      const _this = this.$refs.form
      _this.getDepts()
      this.$refs.form.getUsers()
      _this.dialog = true
    },
    changeExpand() {
      this.expand = !this.expand
      this.deptDetailList = []
      this.init()
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.getDepts()
      _this.form = {
        id: data.id,
        name: data.name,
        pid: data.pid,
        createdByUser: { id: data.createdByUser.id },
        createTime: data.createTime,
        enabled: data.enabled.toString(),
        deptDetailList: data.deptDetailList
      }
      _this.createdBy = data.createdByUser.id
      _this.getUsers()
      _this.dialog = true
    }
  }
}
</script>

<style scoped></style>
