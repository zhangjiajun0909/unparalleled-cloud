<template>
  <div>
    <div class="app-container">
      <div class="output-format">
        <el-form ref="form" :model="form" label-width="160px">
          <!-- <p>查询历史数据：</p> -->
          <el-form-item label="是否查看实时数据:">
            <el-switch v-model="form.delivery" :width="50" @change="handleData" />
          </el-form-item>
          <!-- <el-form-item v-if="!form.delivery" label="选择要查看的报告:">
            <el-select v-model="form.record" placeholder="请选择">
              <el-option label="100" value="0" />
              <el-option label="200" value="1" />
              <el-option label="300" value="2" />
              <el-option label="400" value="3" />
              <el-option label="500" value="4" />
              <el-option label="600" value="5" />
              <el-option label="700" value="6" />
              <el-option label="800" value="7" />
            </el-select>
          </el-form-item> -->
          <!-- <el-form-item label="选择查看设备导连:">
            <el-select v-model="form.region" placeholder="请选择">
              <el-option label="all" value="0" />
              <el-option label="LEAD_I" value="1" />
              <el-option label="LEAD_II" value="2" />
              <el-option label="LEAD_III" value="3" />
              <el-option label="LEAD_aVR" value="4" />
              <el-option label="LEAD_aVR" value="5" />
              <el-option label="LEAD_aVF" value="6" />
              <el-option label="LEAD_V1" value="7" />
            </el-select>
          </el-form-item> -->
          <el-form-item v-if="!form.delivery" label="选择查询时间:">
            <el-date-picker v-model="value2" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right" />
          </el-form-item>
          <el-form-item label="查看报告长度:">
            <el-radio-group v-model="form.resource">
              <el-radio label="10秒" />
              <el-radio label="1分钟" />
              <el-radio label="1小时" />
              <el-radio label="12小时" />
              <el-radio label="结束" />
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="!form.delivery" label="导航:">
            <el-button icon="el-icon-d-arrow-left" size="mini" class="pan-back-btn" @click="back" />
            <el-button icon="el-icon-arrow-left" size="mini" class="pan-back-btn" @click="back" />
            <el-button size="mini" class="pan-back-btn" @click="back">*</el-button>
            <el-button icon="el-icon-arrow-right" size="mini" class="pan-back-btn" @click="back" />
            <el-button icon="el-icon-d-arrow-right" size="mini" class="pan-back-btn" @click="back" />
            <!-- <div class="block">
              <el-pagination
                :current-page="currentPage4"
                :page-sizes="[100, 200, 300, 400]"
                :page-size="100"
                layout="total, sizes, prev, pager, next, jumper"
                :total="400"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div> -->
          </el-form-item>
          <!-- <el-form-item label="时长:">
            <el-date-picker v-model="value2" type="datetimerange" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right" />
          </el-form-item> -->
          <!-- <el-form-item label="时间格式:">
            <el-radio-group v-model="form.resource">
              <el-radio label="10秒" />
              <el-radio label="1分钟" />
              <el-radio label="1小时" />
              <el-radio label="12小时" />
              <el-radio label="实时数据" />
            </el-radio-group>
          </el-form-item> -->
          <!-- <el-form-item label="活动形式">
            <el-input v-model="form.desc" type="textarea" />
          </el-form-item> -->
          <el-form-item>
            <el-button class="check" type="primary" @click="onSubmit">查询</el-button>
            <!-- <el-button>取消</el-button> -->
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-row v-show="!form.delivery" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart />
    </el-row>
    <el-row v-show="form.delivery" style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <div class="box1">
        <canvas id="ecg" width="1400px" height="377px" />
      </div>
      <div class="box2">
        <canvas id="line" width="751px" height="377px" />
      </div>
    </el-row>
  </div>
</template>

<script>
import Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'
import LineChart from '@/views/dashboard/admin/components/LineChart.vue'

export default {
  name: 'Guide',
  components: {
    LineChart
  },
  data() {
    return {
      currentPage4: 4,
      driver: null,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      value2: '',
      form: {
        name: '',
        region: '0',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: '',
        record: ''
      }
    }
  },
  mounted() {
    this.driver = new Driver()
    var canvas = document.getElementById('ecg')
    var canvas2 = document.getElementById('line')
    console.log(canvas, canvas2)
    if (canvas) {
      this.drawSmallGrid(canvas)
      this.drawMediumGrid(canvas)
      this.drawBigGrid(canvas)
    }
    if (canvas2) {
      this.drawLine(canvas2)
    }
    return
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps)
      this.driver.start()
    },
    onSubmit() {
      console.log('submit!')
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    },
    back(e) {
      console.log(e)
    },
    handleData() {
      this.form.resource = null
      this.value2 = null
    },
    drawSmallGrid(canvas) {
      var context = canvas.getContext('2d')
      context.strokeStyle = '#f1dedf'
      context.strokeWidth = 1
      context.beginPath()
      for (var x = 0.5; x < 751; x += 3) {
        context.moveTo(x, 0)
        context.lineTo(x, 751)
        context.stroke()
      }
      for (var y = 0.5; y < 751; y += 3) {
        context.moveTo(0, y)
        context.lineTo(751, y)
        context.stroke()
      }
      context.closePath()
      return
    },
    drawMediumGrid(canvas) {
      var context = canvas.getContext('2d')
      context.strokeStyle = '#f0adaa"'
      context.strokeWidth = 1
      context.beginPath()
      for (var x = 0.5; x < 751; x += 15) {
        context.moveTo(x, 0)
        context.lineTo(x, 751)
        context.stroke()
      }
      for (var y = 0.5; y < 751; y += 15) {
        context.moveTo(0, y)
        context.lineTo(751, y)
        context.stroke()
      }
      context.closePath()
      return
    },
    drawBigGrid(canvas) {
      var context = canvas.getContext('2d')
      context.strokeStyle = '#e0514b'
      context.strokeWidth = 1
      context.beginPath()
      for (var x = 0.5; x < 751; x += 75) {
        context.moveTo(x, 0)
        context.lineTo(x, 751)
        context.stroke()
      }
      for (var y = 0.5; y < 751; y += 75) {
        context.moveTo(0, y)
        context.lineTo(751, y)
        context.stroke()
      }
      context.closePath()
      return
    },
    drawLine(canvas) {
      var ctx = canvas.getContext('2d')
      console.log('xtx:', ctx)
      ctx.strokeStyle = '#e0514b'
      ctx.strokeWidth = 1
      let x = 2
      setInterval(() => {
        ctx.clearRect(x * 6, 0, 25, 750)
        x = x + 1
        var num = (x % 10 === 0) || (x % 10 === 1) ? (Math.random() * 10 - 5) * 10 + 200 : 200
        ctx.lineTo(x * 6, num)
        ctx.stroke()
        if (x > (750 / 6)) {
          x = 2
          ctx.beginPath()
        }
      }, 60)
      ctx.stroke()
      ctx.closePath()
    }
  }
}
</script>

<style scoped>
.app-container {
  position: relative;
  display: flex;
  flex-direction: row;
}
.output-format {
  width: 100%;
  margin: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}
.box1 {
    /* position: absolute;
    left: 0px;
    top: 50px; */
    width: 100%;
    margin: 20px;
    height: 377px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}

.box2 {
    position: absolute;
    left: 20px;
    top: 50px;
    width: 100%;
    height: 377px;
}
</style>
