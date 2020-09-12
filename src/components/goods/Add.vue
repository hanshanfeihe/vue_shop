<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert center show-icon title="消息提示的文案" type="info"></el-alert>
      <!-- 进度条 -->
      <el-steps :active="activeIndex -0" :space="200" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab标签栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        label-position="top"
        label-width="100px"
        ref="addFormRef"
      >
        <el-tabs
          :before-leave="beforeLeave"
          :tab-position="'left'"
          @tab-click="tabsClicked"
          v-model="activeIndex"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"
                v-model="addForm.goods_cat"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :key="item.attr_id" :label="item.attr_name" v-for="item in manyTableData">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :key="i" :label="cb" border v-for="(cb,i) in item.attr_vals"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :key="item.attr_id" :label="item.attr_name" v-for="item in onlyTableData">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action指定图片上传的接口 -->
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <!-- 图片预览 -->
            <el-dialog :visible.sync="previewDialogVisible" title="预览图片" width="50%">
              <img :src="previewPath" alt class="previewImg" />
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce" />
            <!-- 添加商品按钮 -->
            <el-button @click="add" class="btnAdd" type="primary">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 当前激活索引
      activeIndex: '0',
      //   添加表单的数据对象
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_weight: 0,
        goods_number: '0',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      //   商品分类数据
      cateList: [],
      //   商品动态参数
      manyTableData: [],
      //   静态属性
      onlyTableData: [],
      // 图片上传接口
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 获取token信息
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片路径
      previewPath: '',
      // 图片预览的显示与隐藏
      previewDialogVisible: false,
      //   表单添加规则
      addFormRules: {
        goods_name: [{ required: true, message: '名称输入不能为空', trigger: 'blur' }],
        goods_price: [{ required: true, message: '价格输入不能为空', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '重量输入不能为空', trigger: 'blur' }],
        goods_number: [{ required: true, message: '数量输入不能为空', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      }
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 获取三级id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器选中触发
    handleChange() {
      //   console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tab标签切换
    beforeLeave(activeName, oldActiveName) {
      //   console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 切换标签
    async tabsClicked() {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }

        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理移除图片的效果
    handleRemove(file) {
      // 获取将要删除的图片路径
      const filePath = file.response.data.tmp_path
      // 获取该图片路径在数组中的索引
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 从数组中移除该图片信息对象
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 图片上传成功
    handleSuccess(response) {
      console.log(response)
      // 拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return this.$message.error('请完整填写表单')
        // 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求
        const { data: res } = await this.$http.post('goods', form)
        console.log(res.data)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 15px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
