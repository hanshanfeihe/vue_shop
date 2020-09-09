<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary">添加角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1===0?'bdtop':'','vcenter']"
              :key="item1.id"
              v-for="(item1,i1) in scope.row.children"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['bdtop',i2===0?'':'bdtop','vcenter']"
                  :key="item2.id"
                  v-for="(item2,i2) in item1.children"
                >
                  <el-col :span="6">
                    <el-tag
                      @close="removeRightById(scope.row,item2.id)"
                      closable
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      :key="item3.id"
                      @close="removeRightById(scope.row,item3.id)"
                      closable
                      type="warning"
                      v-for="(item3) in item2.children"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
                <!-- <el-row></el-row> -->
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              @click="showEditRoleDialog(scope.row)"
              icon="el-icon-edit"
              size="mini"
              type="primary"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              @click="removeRoleById(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
              type="danger"
            >删除</el-button>
            <!-- 分配角色按钮 -->

            <el-button
              @click="showSetRightsDialog(scope.row)"
              icon="el-icon-setting"
              size="mini"
              type="warning"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      :visible.sync="setRightsDialogVisible"
      @close="setRightsDialogClosed"
      title="分配权限"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :default-checked-keys="defKeys"
        :props="treeProps"
        default-expand-all
        node-key="id"
        ref="treeRef"
        show-checkbox
      ></el-tree>
      <span class="dialog-footer" slot="footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button @click="allotRights" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog :visible.sync="editRoleDialogVisible" title="提示" width="50%">
      <el-form :model="roleForm" :rules="roleRules" label-width="100px" ref="roleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button @click="putEditRole" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 权限列表
      rightsList: [],
      // 角色ID
      roleId: '',
      // 角色信息
      roleForm: { id: '', roleName: '', roleDesc: '' },
      // 控制显示分配权限对话框
      setRightsDialogVisible: false,
      // 控制显示编辑角色对话框
      editRoleDialogVisible: false,
      // 树形控件显示数据格式
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中角色已有权限的树节点
      defKeys: [],
      // 修改角色表单的验证规则对象
      roleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //   获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.mata.msg)
      }
      this.$message.success(res.meta.msg)
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 删除角色权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除') }
      const { data: res } = await this.$http.delete('roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      role.children = res.data
      // console.log('确认了删除')
    },
    // 显示修改角色对话框
    async showEditRoleDialog(role) {
      // console.log(role)
      this.roleForm = role
      this.editRoleDialogVisible = true
    },
    // 提交修改
    async putEditRole() {
      const { data: res } = await this.$http.put('roles/' + this.roleForm.id, {
        roleName: this.roleForm.roleName, roleDesc: this.roleForm.roleDesc
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色信息失败')
      }
      this.$message.success('修改成功')
      this.editRoleDialogVisible = false
    },
    // 显示可以分配的权限列表
    async showSetRightsDialog(role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightsList = res.data
      console.log(this.rightsList)
      this.$message.success(res.meta.msg)

      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRightsDialogVisible = true
    },
    // 通过递归的形式获取当前角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听关闭权限分配对话框的关闭事件
    setRightsDialogClosed() {
      this.defKeys = []
    },
    // 提交选中的权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getHalfCheckedKeys(),
        ...this.$refs.treeRef.getCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post('roles/' + this.roleId + '/rights', { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightsDialogVisible = false
    },
    // 删除角色
    async removeRoleById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户确认删除，返回值为字符串confirm
      // 如果以后取消删除，返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') { return this.$message.info('已取消删除') }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getRolesList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
