/**
 * @name 导航菜单
 * @example <c2-global-menu :cur-route="curRoute" :menus="menus" />
 * @param {Array} menus [菜单数据] @param {Object} menuAttribute {菜单属性} @param {Object} subMenuAttribute {二级菜单属性}
 * @Function select[菜单项选中改变事件。同element] open[sub-menu展开的回调。同element] close[sub-menu关闭的回调。同element] getDom[通过组件ref调用此方法获取el-menu节点，可取调用el-menu的方法]
 */
Vue.component('c2-global-menu', {
  props: {
    menus: {
      type: Array,
      default () {
        return []
      }
    },
    menuAttribute: {
      type: Object,
      default () {
        return {}
      }
    },
    subMenuAttribute: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      activeKey: '',
      collapse: false,
      aisdeWidth: '',
      loading: false
    }
  },
  methods: {
    // 设置menu当前key值
    setActiveKey (key) {
      this.activeKey = key
    },
    select (index, path) {
      this.$emit('select', index, path)
    },
    open (index, path) {
      this.$emit('open', index, path)
    },
    close (index, path) {
      this.$emit('close', index, path)
    },
    getDom () {
      return this.$refs['c2elmenu']
    },
    // 展开或收缩菜单
    collapseMenu (type) {
      this.collapse = typeof type === 'boolean' ? type : !this.collapse
      this.aisdeWidth = this.collapse ? '64px' : '200px'
      this.setAsideWidth()
    },
    setAsideWidth () {
      const c2AsideDom = document.getElementById('menu-aside')
      if (c2AsideDom) c2AsideDom.style.width = this.aisdeWidth
    },
    // 设置菜单加载中 
    setMenuLoading (type) {
      this.loading = type
    }
  },
  mounted () {
    this.collapseMenu(this.menuAttribute.collapse || false)
  },
  template: `<div>
    <el-menu ref="c2elmenu" v-bind="menuAttribute" :collapse="collapse" :router="menuAttribute.router||true" :default-active="activeKey" @select="select" @open="open" @close="close" v-loading="loading">
      <c2-global-menu-item :menus="menus" />
    </el-menu>
    <div class="c2-menu-sider-trigger" @click="collapseMenu" :style="{width:aisdeWidth}">
      <i :class="collapse?'el-icon-s-unfold':'el-icon-s-fold'"></i>
    </div>
  </div>`
})

Vue.component('c2-global-menu-item', {
  props: {
    menus: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    // 新标签打开菜单页面
    itemClick (menu) {
      // if (menu.target) {
      //   const routeUrl = this.$router.resolve({ ...menu })
      //   window.open(routeUrl.href, '_blank')
      // }
    }
  },
  template: `<div>
    <template v-for="(menu,index) in menus">
      <el-submenu v-if="!menu.groupTitle&&menu.children&&menu.children.length" :key="menu.id" :index="menu.id" :disabled="menu.disabled" v-bind="menu.subMenuAttribute"> 
        <template slot="title">
            <i :class="{[menu.icon]:true}"></i>
            <span>{{menu.name}}</span>
        </template>
        <c2-global-menu-item :menus="menu.children" />
      </el-submenu>
      <template v-else>
        <el-menu-item-group v-if="menu.groupTitle" :title="menu.groupTitle">
          <c2-global-menu-item :menus="menu.children" />
        </el-menu-item-group>
        <el-menu-item @click="itemClick(menu)" v-else :index="menu.id" :key="menu.id" :route="{path:menu.path,query:menu.query}" :disabled="menu.disabled">
          <i :class="{[menu.icon]:true}"></i>
          <span slot="title">{{menu.name}}</span>
        </el-menu-item>
      </template>
    </template>
  </div>`
})
