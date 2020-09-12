<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button icon="el-icon-search" slot="append"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay!==1">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time|dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button @click="addressVisible=true" icon="el-icon-edit" size="mini" type="primary"></el-button>
            <el-button
              @click="showProgressBox"
              icon="el-icon-map-location"
              size="mini"
              type="success"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[10, 15, 20]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <el-dialog
        :visible.sync="addressVisible"
        @close="addressDialogClosed"
        title="修改地址"
        width="50%"
      >
        <!-- 地址表单 -->
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          label-width="100px"
          ref="addressFormRef"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              :options="cityData"
              :props="{ expandTrigger: 'hover' }"
              v-model="addressForm.address1"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="addressVisible = false">取 消</el-button>
          <el-button @click="addressVisible = false" type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流进度 -->
      <el-dialog :visible.sync="progressDialog" title="物流进度" width="50%">
        <el-timeline>
          <el-timeline-item
            :key="index"
            :timestamp="activity.time"
            v-for="(activity, index) in progressInfo"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import cityData from './citydata.js'

export default {
  data() {
    return {
      // 获取列表的查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //   列表总数
      total: 0,
      //   存放商品列表
      orderList: [],
      //   控制修改地址表单的显示与隐藏
      addressVisible: false,
      //   控制物流进度对话框的显示与隐藏
      progressDialog: false,
      //   地址信息
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      cityData,
      //   物流信息
      progressInfo: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //   获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.$message.success('获取成功')
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },
    // 控制页码变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 控制页面显示的订单数目
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 清空地址表单
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流进度对话框
    async showProgressBox() {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度条失败')
      }
      //   this.$message.success('成功获取物流进度条')
      this.progressInfo = res.data
      this.progressDialog = true
      console.log(this.progressInfo)
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
