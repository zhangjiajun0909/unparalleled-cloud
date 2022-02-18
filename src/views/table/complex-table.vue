<template>
  <div class="app-container">
    <div class="filter-container">
      <span>姓名：</span>
      <el-input v-model="listQuery.username" placeholder="请输入" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <span style="margin-left: 10px;">  ID：</span>
      <el-input v-model="listQuery.uid" placeholder="请输入" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" min-width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名:" min-width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年龄:" width="200px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.age }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="Reviewer" min-width="70px" align="center">
        <template slot-scope="{row}">
          <span style="color:red;">{{ row.reviewer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="设备名称" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span
            v-for="(item, index) in row.devices"
            :key="index"
            eslint-disable-next-line
            vue
            no-use-v-if-with-v-for
            class="link-type"
            @click="handleDevice(row)"
          >
            {{ item.deviceName }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="渠道" width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.channel }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="userInfo" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item
          label="姓名:"
          prop="userName"
          :rules="{
            required: true, message: '姓名不能为空', trigger: 'change'
          }"
        >
          <el-input v-model="userInfo.userName" style="width: 200px;" placeholder="请输入" />
        </el-form-item>
        <el-form-item
          label="出生日期:"
          prop="birthday"
          :rules="{
            required: true, message: '出生日期不能为空', trigger: 'change'
          }"
        >
          <el-date-picker
            v-model="userInfo.birthday"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item
          label="设备ID:"
          prop="deviceId"
          :rules="[
            { required: true, message: '设备ID不能为空'},
            { type: 'number', message: '设备ID必须为数字值'}
          ]"
        >

          <el-select v-model.number="userInfo.deviceId" placeholder="请选择">
            <el-option
              v-for="item in deviceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog()">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="异常心率列表">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="时间" />
        <el-table-column prop="pv" label="心率值" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
// import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
// import axios from 'axios'
import { getList, addUser, getDeviceList, deleteUser } from '@/api/user'

const calendarTypeOptions = [
  { key: 'CN', display_name: '是' },
  { key: 'US', display_name: '否' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        uid: null,
        username: null
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['是', '否'],
      showReviewer: false,
      userInfo: {
        birthday: null,
        userName: null,
        deviceId: null
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '修改',
        create: '新建'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,
      deviceList: []
    }
  },
  created() {
    this.getList()
    getDeviceList().then(res => {
      if (res) {
        this.deviceList = res.data
      }
    })
  },
  methods: {
    getList(params) {
      this.listLoading = true
      // console.log(fetchList())
      getList(params).then(res => {
        this.listLoading = false
        console.log(res.data)
        // this.currentPage = res.data.currentPage
        this.list = res.data.results
        this.total = res.data.total
      })
    },
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getList(this.listQuery)
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: '',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      console.log(this.userInfo)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addUser(this.userInfo).then(res => {
            if (res.code === 200) {
              this.$message.success(res.message)
            } else {
              this.$message.error(res.message)
            }
            this.dialogFormVisible = false
            this.userInfo = {}
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.userInfo.deviceId = row.devices[0].deviceId
      this.userInfo.userName = row.username
      this.userInfo.birthday = row.birthday
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          // updateArticle(tempData).then(() => {
          //   const index = this.list.findIndex(v => v.id === this.temp.id)
          //   this.list.splice(index, 1, this.temp)
          //   this.dialogFormVisible = false
          //   this.$notify({
          //     title: 'Success',
          //     message: 'Update Successfully',
          //     type: 'success',
          //     duration: 2000
          //   })
          // })
        }
      })
    },
    handleDelete(row) {
      deleteUser(row.id).then(res => {
        if (res.code === 200) {
          this.$message.success(res.message)
          this.getList()
        } else {
          this.$message.error(res.message)
        }
      })
    },
    handleDevice(data) {
      this.$router.push({ path: `/device/index?username=${data.username}&age=${data.age}&deviceId=${data.devices[0].deviceId}` })
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    },
    handleChange(e) {
      console.log(e)
    },
    closeDialog() {
      this.dialogFormVisible = false
      this.userInfo = {}
      this.getList()
    }
  }
}
</script>

<style scoped>
/* .el-button--primary {
  padding-left: 10px;
} */
</style>
