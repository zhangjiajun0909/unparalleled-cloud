<template>
  <div>
    <div class="app-container">
      <div class="output-format">
        <el-form ref="ruleForm" class="demo-ruleForm" :rules="rules" :model="form" label-width="160px">
          <el-form-item label="是否查看实时数据:">
            <el-switch v-model="form.isRealData" :width="50" @change="handleData" />
          </el-form-item>
          <el-form-item v-if="!form.isRealData" label="选择查询时间:">
            <el-col :span="5">
              <el-form-item prop="startTime">
                <el-date-picker
                  v-model="form.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
            <el-col class="line" :span="0.5">--</el-col>
            <el-col :span="5">
              <el-form-item prop="endTime">
                <el-date-picker
                  v-model="form.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>

            <!-- <el-date-picker
              v-model="form.reportTime"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              align="right"
              value-format="yyyy-MM-dd HH:mm:ss"
            /> -->
          </el-form-item>
          <el-form-item label="导连:">
            <el-checkbox-group
              v-model="form.sigNames"
              :min="1"
              :max="4"
            >
              <el-checkbox v-for="line in signalList" :key="line" :label="line" name="signal">{{ line }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item v-if="!form.isRealData" label="查看报告长度:">
            <el-radio-group v-model="form.interval">
              <el-radio :label="10">10秒 </el-radio>
              <!-- <el-radio label="1分钟" />
              <el-radio label="1小时" />
              <el-radio label="12小时" />
              <el-radio label="结束" /> -->
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="!form.isRealData" label="导航:">
            <el-button icon="el-icon-d-arrow-left" size="mini" class="pan-back-btn" @click="back(1)" />
            <el-button icon="el-icon-arrow-left" size="mini" class="pan-back-btn" @click="back(2)" />
            <el-button size="mini" class="pan-back-btn" @click="back">*</el-button>
            <el-button icon="el-icon-arrow-right" size="mini" class="pan-back-btn" @click="back(3)" />
            <el-button icon="el-icon-d-arrow-right" size="mini" class="pan-back-btn" @click="back(4)" />
          </el-form-item>
          <el-form-item>
            <el-button class="check" type="primary" @click="!form.isRealData ? onSubmit(1):onSubmit(2)">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="!form.isRealData && signalList" id="singleEcg_" v-loading="loading">
      <canvas v-for="index of signalList.length" :id="`myCanvas${index}`" :key="index" class="myCanvas" width="1100" height="230" />
    </div>
    <div v-for="index of signalList.length" v-else :key="index" v-loading="loading" class="singleEcg_lala">
      <canvas :id="`myCanvas${index}`" width="1080" height="230" />
      <div class="box2">
        <canvas :id="`line${index}`" width="1080" height="230" />
      </div>
    </div>
  </div>
</template>
<script>
// import Driver from 'driver.js' // import driver.js
import 'driver.js/dist/driver.min.css' // import driver.js css
import steps from './steps'
// import LineChart from '@/views/dashboard/admin/components/LineChart.vue'
import { getRealTimeCardiogram, getSingleList } from '@/api/user'
import axios from 'axios'
// import { actions } from 'plop-templates/view/prompt'

export default {
  name: 'Guide',
  components: {
    // LineChart,
    // eslint-disable-next-line vue/no-unused-components
  },
  data() {
    return {
      startEnum: {
        1: '00:00:00',
        2: '00:00:10',
        3: '00:00:20',
        4: '00:00:30',
        5: '00:00:40',
        6: '00:00:50',
        7: '00:00:60',
        8: '00:00:70',
        9: '00:00:80',
        10: '00:00:90'
      },
      endEnum: {
        1: '00:00:10',
        2: '00:00:20',
        3: '00:00:30',
        4: '00:00:40',
        5: '00:00:50',
        6: '00:00:60',
        7: '00:00:70',
        8: '00:00:80',
        9: '00:00:90',
        10: '00:10:00'
      },
      timer: null,
      loading: false,
      pageTotal: 1,
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
      signalList: [],
      form: {
        sigNames: [],
        deviceId: this.$route.query.deviceId,
        sigName: '',
        interval: 10,
        timeUnit: 'SECONDS',
        isRealData: false,
        startTime: '',
        endTime: '',
        pageNum: 1
      },
      id: '',
      fecg_data: [],
      rules: {
        interval: [{ required: true, message: '请选择报告时长', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
      },
      type: 1
    }
  },
  mounted() {
    getSingleList(this.form.deviceId).then(res => {
      if (res) {
        this.signalList = res.data.sigNames
      }
    })
  },
  beforeDestroy() {
    clearTimeout()
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps)
      this.driver.start()
    },
    draw(list) {
      if (!list) return
      list.map((v, i) => {
        var canvas = document.getElementById(`myCanvas${i + 1}`)
        if (!canvas) return
        canvas.width = 1100
        this.createBackground(i + 1)
        if (canvas.getContext) {
          var ctx = canvas.getContext('2d')
          var offsetx = 50

          if (!v.datas) return
          for (let j = 1; j < v.datas.length; j++) {
            var x0 = parseInt(v.datas[j - 1].timestamp) / 10.0 + offsetx
            var x1 = parseInt(v.datas[j].timestamp) / 10.0 + offsetx
            var y0 = 100 - 100 * parseFloat(v.datas[j - 1].data)
            var y1 = 100 - 100 * parseFloat(v.datas[j].data)

            ctx.strokeStyle = 'rgb(0,0,0)'
            ctx.beginPath()
            ctx.moveTo(x0, y0)
            ctx.lineTo(x1, y1)
            ctx.stroke()
          }
        }
      })
      // }
    },
    onSubmit(type) {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          if (type === 1) {
            axios.post('http://192.168.0.51:8080/api/v1/cardiogram/history', this.form).then(ret => {
              this.fecg_data = ret.data.data.results
              this.form.pageNum = ret.data.data.currentPage
              this.pageTotal = ret.data.data.pageSize
              if (this.fecg_data && this.fecg_data.length > 0) {
                this.loading = false
                this.draw(this.fecg_data)
                if (document.getElementById('myCanvas1')) {
                  document.getElementById('myCanvas1').scrollIntoView({ block: 'start', behavior: 'smooth' })
                }
                return
              } else {
                this.loading = false
                this.$message.error('数据为空')
                this.createBackground(1)
                if (document.getElementById('myCanvas1')) {
                  document.getElementById('myCanvas1').scrollIntoView({ block: 'start', behavior: 'smooth' })
                }
              }
            })
          } else {
            this.loading = false
            let firstImplement = true
            if (firstImplement) {
              getRealTimeCardiogram({
                'sigName': this.$route.query.username,
                'deviceId': this.$route.query.deviceId,
                'interval': 10,
                'timeUnit': 'SECONDS',
                'sigNames': this.form.sigNames
              }).then(res => {
                if (res) {
                  this.fecg_data = res.data
                  if (this.fecg_data && this.fecg_data.length > 0) {
                    this.drawRealTimeLine(this.fecg_data)

                    this.timer = setInterval(() => {
                      this.drawRealTimeLine(this.fecg_data)
                    }, 10000)
                    firstImplement = false
                    if (document.getElementById('myCanvas1')) {
                      document.getElementById('myCanvas1').scrollIntoView({ block: 'start', behavior: 'smooth' })
                    }
                  }
                }
              })
            }
          }
        }
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
    },
    back(type) {
      switch (type) {
        case 1 :
          this.form.pageNum = 1
          this.onSubmit(this.type)
          break
        case 2 :
          --this.form.pageNum
          this.onSubmit(this.type)
          break
        case 3 :
          ++this.form.pageNum
          this.onSubmit(this.type)
          break
        case 4 :
          this.form.pageNum = this.pageTotal
          this.onSubmit(this.type)
          break
      }
    },
    handleData(e) {
      this.form.startTime = null
      this.form.endTime = null
      this.form.pageNum = 1
      if (!e) {
        clearInterval(this.timer)
      }
      this.draw(null)
      this.form.sigNames = []
    },
    createBackground(index) {
      var canvas = document.getElementById(`myCanvas${index}`)
      canvas.width = 1100
      var ctx = canvas.getContext('2d')
      var offsetx = 50
      var offsety = 0
      var width = 1000
      var height = 200
      ctx.fillStyle = 'rgba(255,255,255,1)'
      ctx.fillRect(offsetx, offsety, width, height)

      var d = 20
      /* 绘制竖行网格*/
      for (var i = 0; i <= width / d; i++) {
        if (i % 5 === 0) {
          ctx.strokeStyle = 'rgba(255,0,0,.6)'
          ctx.lineWidth = 2
        } else {
          ctx.strokeStyle = 'rgba(255,0,0,.3)'
          ctx.lineWidth = 1
        }
        ctx.beginPath()
        ctx.moveTo(i * d + offsetx, offsety)
        ctx.lineTo(i * d + offsetx, height + offsety)
        ctx.stroke()
      }

      /* 绘制横行网格*/
      for (var j = 0; j <= height / d; j++) {
        if (j % 5 === 0) {
          ctx.strokeStyle = 'rgba(255,0,0,.6)'
          ctx.lineWidth = 2
        } else {
          ctx.strokeStyle = 'rgba(255,0,0,.3)'
          ctx.lineWidth = 1
        }
        ctx.beginPath()
        ctx.moveTo(offsetx, j * d + offsety)
        ctx.lineTo(width + offsetx, j * d + offsety)
        ctx.stroke()
      }

      /* 横纵坐标说明*/
      ctx.font = '15px Arial'
      ctx.fillStyle = 'rgb(0,0,0)'
      // ctx.fillText('time/ms', offsetx + width / 2, 220)
      ctx.fillText(this.fecg_data[index - 1].sigName, 1070, 15)
      ctx.fillText(this.startEnum[this.form.pageNum], offsetx, 220)
      ctx.fillText(this.endEnum[this.form.pageNum], offsetx + width * 48 / 50, 220)

      ctx.fillText('1.0mv', 0, 11)
      ctx.fillText('0', 20, 102)
      ctx.fillText('-1.0mv', 0, 200)
    },
    showlist(list, count, ctx) {
      count = count || 0
      var offsetx = 15
      if (!list || !list[count] || list[count].timestamp === null || list[count].data === null) return

      var x = parseInt(list[count].timestamp) / 10.0 + offsetx
      var x0 = parseInt(list[count - 1].timestamp) / 10.0 + offsetx
      var num = 100 - 100 * parseFloat(list[count].data)
      var num0 = 100 - 100 * parseFloat(list[count - 1].data)
      ctx.clearRect(x, 0, 25, 750)
      ctx.moveTo(x0, num0)
      ctx.lineTo(x, num)
      ctx.stroke()
      if (count === this.fecg_data.length - 1) {
        ctx.beginPath()
      }
      if (count < list.length - 1) {
        setTimeout(() => {
          this.showlist(list, ++count, ctx)
        }, 15)
        ctx.stroke()
        ctx.closePath()
      }
    },
    drawRealTimeLine(data) {
      data.map((v, i) => {
        this.createBackground(i + 1)
        var canvas = document.getElementById(`line${i + 1}`)
        if (!canvas) return
        var ctx = canvas.getContext('2d')

        this.showlist(v.datas, 1, ctx)

        ctx.strokeStyle = 'rgb(0,0,0)'
        ctx.strokeWidth = 1

        this.timer = setInterval(() => {
          this.showlist(v.datas, 1, ctx)
        }, 10000)
      })
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
  margin: 5px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)
}
.electrocardiogram {
  margin: 40px;
}
.myCanvas {
  margin-left: 40px;
}
/* .box1 {
    position: absolute;
    left: 0px;
    top: 50px;
    width: 1000px;
    height: 1300px;
}
*/
.singleEcg_lala {
  position: relative;
}
.box2 {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 1100px;
    height: 230px;
    margin-left: 35px;
}

</style>
