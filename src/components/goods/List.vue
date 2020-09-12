<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input @clear="getGoodsList" clearable placeholder="请输入内容" v-model="queryInfo.query">
            <el-button @click="searchGoods" icon="el-icon-search" slot="append"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="goAddPage" type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              @click="showEditDialog(scope.row.attr_id)"
              icon="el-icon-edit"
              size="mini"
              type="primary"
            ></el-button>
            <el-button
              @click="removeGoodsById(scope.row.goods_id)"
              icon="el-icon-delete"
              size="mini"
              type="danger"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[10, 20, 30]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        background
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 存放查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //   存放商品列表
      goodsList: [],
      //   商品总数目
      total: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      }
      this.$message.success(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
      // console.log(res.data)
    },
    // 设置当前分页
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 设置每一页的大小
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 搜索商品
    searchGoods() {
      this.getGoodsList()
    },
    // 根据id删除商品
    async removeGoodsById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，返回值为字符串confirm
      // 如果以后取消删除，返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除') }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    // 跳转到添加页面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}

</script>
<style lang="less" scoped>
</style>
