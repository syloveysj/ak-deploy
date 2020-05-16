/**
 * @name iframe内嵌网页组件
 * @Function 
 */
var c2IframeComponent = {
  name: 'iframeComponent',
  data () {
    return {
      defaultHeight: this.getHeight()
    }
  },
  methods: {
    // 获取除去顶部和底部的高度
    getHeight () {
      const topDomHeight = this.getDomHeight('page-header') + this.getDomHeight('page-breadcrumb') + this.getDomHeight('c2-tab-container') + this.getDomHeight('page-footer')
      return `calc(100vh - ${topDomHeight + 85}px)`
    },
    getDomHeight (name) {
      const dom = document.getElementsByClassName(name)
      if (dom.length > 0) return dom[0].offsetHeight
      return 0
    }
  },
  template: `<div>
    <iframe 
      v-for="(attribute,index) in $root.c2IframeCaches" 
      :key="index" 
      v-if="attribute.iframeDeploy"
      v-show="$route.path===attribute.path"
      class="iframe" 
      :name="attribute.iframeDeploy.name||''" 
      :src="attribute.iframeDeploy.src||''" 
      :frameborder="attribute.iframeDeploy.frameborder||'0'" 
      :scrolling="attribute.iframeDeploy.scrolling||'yes'" 
      :style="{height:attribute.iframeDeploy.height||defaultHeight,width:attribute.iframeDeploy.width||'100%'}"
    ></iframe>
  </div>`
}
Vue.component("c2-iframe-component", c2IframeComponent);
