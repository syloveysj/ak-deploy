/**
 * @name 面包屑
 * @example <c2-global-bread :items="breadLinks" :home-deploy="{name:'首页',path:'/home'}" />
 * @param {Object} homeDeploy {若有首页，则需要配置首页信息} @param {Object} attribute {面包屑属性}
 * @method setItems:设置当前面包屑数据；getItems：获取当前面包屑数据
 */
Vue.component('c2-global-bread', {
  props: {
    attribute: {
      type: Object,
      default () {
        return {}
      }
    },
    homeDeploy: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      items: []
    }
  },
  methods: {
    setItems (items) {
      if (this.homeDeploy.path && !items.includes(this.homeDeploy)) items.splice(0, 0, this.homeDeploy)
      this.items = items
    },
    openBread (item) {
      if (this.homeDeploy.path && !this.items.includes(this.homeDeploy)) this.items.splice(0, 0, this.homeDeploy)
      for (var i = 0; i < this.items.length; i++) {
        if (this.items[i] !== undefined && this.items[i].name === item.name) {
          return
        }
      }
      this.items.push(item)
    },
    getItems () {
      return this.items
    }
  },
  template: `<el-breadcrumb separator-class="el-icon-arrow-right" v-bind="attribute">
      <el-breadcrumb-item v-for="(item,index) in items" @click="backHome(index)" :key="index" :to="item.path">{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>`
})
