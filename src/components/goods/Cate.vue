<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button @click="showAddCateDiaglog" type="primary">添加分类</el-button>
      <!-- 表格区域 -->
      <tree-table
        :columns="columns"
        :data="catelist"
        :expand-type="false"
        :selection-type="false"
        :show-row-hover="false"
        border
        class="treetable"
        index-text="#"
        show-index
      >
        <template slot="isOK" slot-scope="scope">
          <i
            class="el-icon-circle-check"
            style="color:lightgreen"
            v-if="scope.row.cat_deleted===false"
          ></i>
          <i class="el-icon-circle-close" style="color:red" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt" slot-scope="scope">
          <el-button
            @click="showEditCateDiaglog(scope.row)"
            icon="el-icon-edit"
            size="mini"
            type="primary"
          >编辑</el-button>
          <el-button
            @click="removeCateById(scope.row.cat_id)"
            icon="el-icon-delete"
            size="mini"
            type="danger"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        :current-page="querInfo.pagenum"
        :page-size="querInfo.pagesize"
        :page-sizes="[5, 10, 15]"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog
        :visible.sync="addCateDialogVisible"
        @close="addCateDialogClosed"
        title="添加分类"
        width="50%"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          label-width="100px"
          ref="addCateFormRef"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- 级联选择器 -->
            <!-- options绑定数据对象 -->
            <el-cascader
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChanged"
              clearable
              v-model="selectKeys"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="addCateDialogVisible= false">取 消</el-button>
          <el-button @click="addCate" type="primary">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑分类对话框 -->
      <el-dialog
        :visible.sync="editCateDialogVisible"
        @close="editCateDialogClosed"
        title="编辑分类"
        width="50%"
      >
        <el-form
          :model="addCateForm"
          :rules="editCateFormRules"
          label-width="100px"
          ref="editCateFormRef"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="editCateDialogVisible= false">取 消</el-button>
          <el-button @click="editCate" type="primary">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有商品分类列表
      catelist: [],
      // 商品总数据条
      total: 0,
      // 父级分类列表
      parentCateList: [],
      // 选中的父级分类列表数组
      selectKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      //   请求信息
      querInfo: {
        type: 3,
        pagenum: 0,
        pagesize: 5
      },
      // 表格列表项
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isOK'
      }, {
        label: '排序',
        type: 'template',
        template: 'order'
      }, {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类等级，默认是一级
        cat_level: 0
      },
      // 添加分类表单填写规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 编辑分类填写规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      // console.log(res.data)
      this.catelist = res.data.result
      this.total = res.data.total
      // this.$message.success(res.meta.msg)
    },
    // 监听分页的改变
    handleCurrentChange(newNum) {
      this.querInfo.pagenum = newNum
      this.getCateList()
    },
    // 监听每页显示条数的变化
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDiaglog() {
      // 先获取父级分类列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 显示编辑分类对话框
    showEditCateDiaglog(cateForm) {
      this.addCateForm = cateForm
      this.editCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
      console.log(res.data)
    },
    // 监听级联选择器选择变化
    parentCateChanged() {
      console.log(this.selectKeys)
      // 如果级联选择数组selectKeys的长度大于0，证明选择父级分类
      if (this.selectKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectKeys.length
        return ''
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加新分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 提交修改
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        console.log(this.addCateForm)
        const { data: res } = await this.$http.put('categories/' + this.addCateForm.cat_id, { cat_name: this.addCateForm.cat_name })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }
        this.$message.success('更新分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 清空添加分类表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 清空编辑分类表单
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 删除分类
    async removeCateById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，返回值为字符串confirm
      // 如果以后取消删除，返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除') }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
    }

  }
}

</script>
<style lang="less" scoped>
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
