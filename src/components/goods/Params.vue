<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数" type="warning"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类</span>
          <!-- 选择商品分类的级联选择框 -->
          <!-- options绑定数据对象 -->
          <el-cascader
            :options="catelist"
            :props="cascaderProps"
            @change="handleCateChanged"
            clearable
            v-model="selectKeys"
          ></el-cascader>
          <!-- tab选项卡 -->
          <el-tabs @tab-click="handleClick" v-model="activeName">
            <el-tab-pane label="动态参数" name="many">
              <!-- 添加参数的按钮 -->
              <el-button
                :disabled="isBtnDisabled"
                @click="addDialogVisible=true"
                size="mini"
                type="primary"
              >添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="manyTableData" border stripe>
                <el-table-column type="index"></el-table-column>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <!-- 动态显示标签 -->
                    <el-tag
                      :key="i"
                      @close="handleClose(i,scope.row)"
                      closable
                      v-for="(item,i) in scope.row.attr_vals"
                    >{{item}}</el-tag>
                    <el-input
                      @blur="handleInputConfirm(scope.row)"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      class="input-new-tag"
                      ref="saveTagInput"
                      size="small"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                    ></el-input>
                    <el-button
                      @click="showInput(scope.row)"
                      class="button-new-tag"
                      size="small"
                      v-else
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      @click="showEditDialog(scope.row.attr_id)"
                      icon="el-icon-edit"
                      size="mini"
                      type="primary"
                    >编辑</el-button>
                    <el-button
                      @click="removeParamsById(scope.row.attr_id)"
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button
                :disabled="isBtnDisabled"
                @click="addDialogVisible=true"
                size="mini"
                type="primary"
              >添加属性</el-button>
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <el-table-column type="index"></el-table-column>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <!-- 动态显示属性 -->
                    <el-tag
                      :key="i"
                      @close="handleClose(i,scope.row)"
                      closable
                      v-for="(item,i) in scope.row.attr_vals"
                    >{{item}}</el-tag>
                    <el-input
                      @blur="handleInputConfirm(scope.row)"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      class="input-new-tag"
                      ref="saveTagInput"
                      size="small"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                    ></el-input>
                    <el-button
                      @click="showInput(scope.row)"
                      class="button-new-tag"
                      size="small"
                      v-else
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      @click="showEditDialog(scope.row.attr_id)"
                      icon="el-icon-edit"
                      size="mini"
                      type="primary"
                    >编辑</el-button>
                    <el-button
                      @click="removeParamsById(scope.row.attr_id)"
                      icon="el-icon-delete"
                      size="mini"
                      type="danger"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加动态参数/静态属性对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      @close="addDialogClosed"
      width="50%"
    >
      <el-form :model="addForm" :rules="addFormRules" label-width="100px" ref="addFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button @click="addParams" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改表单 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      @close="editDialogClosed"
      width="50%"
    >
      <el-form :model="editForm" :rules="editFormRules" label-width="100px" ref="editFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button @click="editParams" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      catelist: [],
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
      //   选项卡选中的index
      activeName: 'many',
      //   动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      //   控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 控制效果对话框的显示与隐藏
      editDialogVisible: false,
      // 添加属性/参数表单数据对象
      addForm: {},
      // 修改属性/参数表单数据对象
      editForm: {},
      // 添加分类表单填写规则
      addFormRules: {
        attr_name: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ]
      },
      // 修改表单填写规则
      editFormRules: {
        attr_name: [
          { required: true, message: '输入不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    //   是否禁用按钮
    isBtnDisabled() {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取三级id
    cateId() {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    // 提示标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取所有商品的分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
      console.log(this.catelist)
      // console.log(this.catelist)
    },
    // 级联选择框中选项变化会触发这个方法
    async handleCateChanged() {
      this.getParmsData()
    },
    // 处理选项卡的事件
    handleClick() {
      this.getParmsData()
      console.log(this.activeName)
    },
    // 获取参数礼拜数据
    async getParmsData() {
      // 证明选中的不是三级分类
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // console.log(this.selectKeys)
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes',
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //   console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 清空添加表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 清空修改表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 显示修改表单
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.editForm = res.data
      this.$message.success(res.meta.msg)
      this.editDialogVisible = true
    },
    // 提交修改
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.editForm.attr_sel })
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getParmsData()
      })
    },
    // 添加添加表单
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories/' + this.cateId + '/attributes', {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success(res.meta.msg)
        this.addDialogVisible = false
        this.getParmsData()
      })
    },
    // 删除参数或属性
    // 删除分类
    async removeParamsById(id) {
      console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，返回值为字符串confirm
      // 如果以后取消删除，返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除') }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getParmsData()
    },
    // 显示文本框
    showInput(item) {
      item.inputVisible = true
      item.inputValue = ''
      // 让文本框自动获取焦点
      // $nextTick()方法的作用，就是当页面上的元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 按下enter或失去焦点会触发
    async handleInputConfirm(item) {
      console.log(item.inputValue)
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        item.inputVisible = false
        return
      }
      item.attr_vals.push(item.inputValue.trim())
      item.inputValue = ''
      item.inputVisible = false
      // console.log(typeof item.attr_sel)
      this.saveParams(item)
    },
    async saveParams(item) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${item.attr_id}`, {
        attr_name: item.attr_name,
        attr_sel: item.attr_sel,
        attr_vals: item.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        console.log(res.data)
        return this.$message.error('修改参数项失败')
      }
      this.$message.success(res.meta.msg)
    },
    // 删除tag标签
    handleClose(i, item) {
      item.attr_vals.splice(i, 1)
      this.saveParams(item)
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 100px;
}
</style>
