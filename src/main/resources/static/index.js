//Vue初始化的根元素
const vueRoot = "#app";
//全局数据对象，包括用户登录信息等。
var c2 = {
	//默认的登录用户，接入统一认证之后会被真实登录用户信息替换
	subject: { id: 1, realname: "张三" }
};
//默认欢迎页
const Home = { template: '<div>欢迎使用C2 Vue UI!</div>' }
//基础路由
const baseRoutes = [
	{ path: '/', redirect: '/home' },
	{ path: '/home', component: Home }

];

//菜单配置
var menusData = [
	{ id: "1", name: "首页", icon: "el-icon-menu", path: "/home", component: Home },
	{ id: "2", name: "测试", icon: "el-icon-user", path: "/v/index", children: [{ id: "3", name: "菜单1", icon: "el-icon-menu", path: "/v/menu1", children: [{ id: "5", name: "菜单4", icon: "el-icon-user", path: "/v/menu2" }] }, { id: "4", name: "菜单2", icon: "el-icon-user", path: "/v/menu1" }] },
	{ id: "6", name: "菜单1", icon: "el-icon-menu", path: "/v/demo1", children: [{ id: "7", name: "demo", icon: "el-icon-user", path: "/v/demo" }] },
	{ id: "12", name: "百度", icon: "el-icon-menu", path: "/i/baidu", children: [{ id: "13", name: "百度", icon: "el-icon-menu", path: "/i/baidu", iframeDeploy: { src: "https://www.baidu.com" } }] },

];

//页面初始化
const router = new VueRouter({ routes: baseRoutes });
new Vue({
	mixins: [indexMixin, indexApi],
	el: vueRoot,
	data: {
		loginInfo: { id: 1, realname: "默认用户" },
		menus: [],
		// 如果首页不在菜单上,则需要配置此项
		homeDeploy: { name: '首页', path: '/home' },
		menuHeight: '',
		menuHeightVal: '',
		ispaddingMenu:false,
		activeNames: "",
		isBaseInfo:false,
		isPwd:false,
		isSettingMenu:false,
		isCollapse: false,
		isIconDisplay:true,
		contentText:'收起',
		isToggleSideBar:false,
		isMinMenu: false,
        isShowSearchTree:false,
        menuSearchInput:'',
        isDestory:true,
        menuItemsKey:"menuItemsKey"+new Date().getTime(),
		menuSearch: '',
		defaultProps: {
			children: 'children',
			label: 'name'
		}
	},
	router,
	created: function () {
		/**
		 * 接入统一认证或者系统管理之后可以根据请求获取当前登录获取当前登录用户
		 * 
		 * */
		axios.get("ws/getSubject").then(loginInfo => {
			if (loginInfo.id) this.loginInfo = loginInfo;
		})

		window.addEventListener('resize', this.resize);
		this.getMenuHeight();
	},
	watch:{
			menuSearch(value){
				if(value.length>0){
				  this.$data.isShowSearchTree=true;
				}else{
				  this.$data.isShowSearchTree=false;
				}
				this.$refs.searchTree.filter(value);
			},
			menuSearchInput(value){
				this.$refs.searchTree.filter(value);
			}
		},
	methods: {
		//首页头部用户信息下拉菜单点击事件
		headerUserDropdownMenuCommand(commond) {
			//退出登录事件响应
			if (commond == 'logout') {
				this.logout();
			}else if (commond == 'baseInfo') {
				 this.isBaseInfo=!this.isBaseInfo;
			}else if (commond == 'updatePWD') {
				 this.isPwd=!this.isPwd;
			} else if (commond == 'more') {
				this.isSettingMenu=!this.isSettingMenu;
			}
		},
		logout() {
			axios.post("ws/logout").then(data => {
				if (!data || !data.result) {
					location.reload();
				} else {
					location.href = data.result;
				}
			})
		},
		resize() {
			this.getMenuHeight();
			this.selectMenuType(this.activeNames);
		},
		
		showtabMenu() {		
			if(this.isMinMenu){
				this.isMinMenu = !this.isMinMenu;
				this.isCollapse = !this.isCollapse;
				this.$refs.searchTagInput.$refs.input.focus();
			if (this.isCollapse) {
				$(".el-aside").css("width", "43px");
				this.isToggleSideBar =true;
				$(".header-menu-btn").css("width", "42px");
				$(".header-menu-input").addClass("min-input");
				$(".header-menu-input input").attr("placeholder", "");
			} else {
				this.isToggleSideBar =false;
				$(".el-aside").css("width", "200px");
				$(".header-menu-btn").css("width", "100%");
				$(".header-menu-input").removeClass("min-input");
				$(".header-menu-input input").attr("placeholder", "请输入内容");

			}
			this.$data.menuSearch="";
			this.$data.menuSearchInput="";
			this.$data.isShowSearchTree=false;
			}
		},
		toggleSideBar() {
			this.isCollapse = !this.isCollapse;
			this.isMinMenu = !this.isMinMenu;
			
			if (this.isCollapse) {
				$(".el-aside").css("width", "43px");
				this.contentText = '展开';
				this.isToggleSideBar =true;
				$(".header-menu-btn").css("width", "42px");
				$(".header-menu-input").addClass("min-input");
				$(".header-menu-input input").attr("placeholder", "");
			} else {
				this.isToggleSideBar =false;
				this.contentText = '收起';
				$(".el-aside").css("width", "200px");
				$(".header-menu-btn").css("width", "100%");
				$(".header-menu-input").removeClass("min-input");
				$(".header-menu-input input").attr("placeholder", "请输入内容");
				setTimeout(() => {
					this.selectMenuType(this.activeNames);
					this.resize();
				}, 100);
					
				
			}
			this.$data.menuSearch="";
			this.$data.menuSearchInput="";
			this.$data.isShowSearchTree=false;
		},
		getMenuHeight() {
			var header = $('.page-header').height();
			var menuw = $('.header-menu-lump-w').height();
			var menu = $('.header-menu-lump').height();
			var moveHeight = header + menuw + menu + 2;
			this.menuHeight = this.getViewportSize().height - moveHeight;
			this.menuHeightVal = this.getViewportSize().height - moveHeight + "px"
		},
		selectMenuType(activeNames) {
			$(".one-menu-item").removeClass("is-active");
			var height = this.menuHeight - 32 * (this.menus.length + 1) + 31
			$(".el-collapse-item__content").each(function (i) {
				$(this).attr("style", "height:" + height + "px");
			});
			this.activeNames = activeNames;
		},
		handleNodeClick(data, node, tree) {
			var node = data.children;
			this.$router.push(data.path);
		},
		checkChilren(data, value) {
			if (data.name.indexOf(value) !== -1) {
				return true;
			}
			if (data.children) {
				let length = data.children.length;
				let flag = false;
				for (let i = 0; i < length; i++) {
					if (this.checkChilren(data.children[i], value)) {
						return true;
					}
				}
				return false;
			} else {
				return false;
			}
		},
		checkParent(data, value) {
			let menus = this.$data.menus;
			let length = menus.length;
			for (let i = 0; i < length; i++) {
				if (menus[i].children) {
					let parents = this.checkIsParent(menus[i], data, value);
					if (parents.length > 0) {
						for (let j = 0; j < parents.length; j++) {
							if (parents[j].name.indexOf(value) !== -1) {
								return true;
							}
						}
					}
				}
			}
			return false;
		},
		checkIsParent(data, child, value) {
			let datas = [];
			let length = data.children.length;
			let flag = false;
			for (let i = 0; i < length; i++) {
				if (data.children[i].id == child.id) {
					datas.push(data);
				} else {
					if (data.children[i].children) {
						let res = this.checkIsParent(data.children[i], child, value);
						if (res.length > 0) {
							datas.push(data);
							datas = datas.concat(res)
						}
					}
				}

			}
			return datas;

		},
		filterNode(value, data) {
			if (!value) {
				return true;
			}
			//递归计算子级是否存在对应的值
			if (this.checkChilren(data, value) || this.checkParent(data, value)) {
				return true;
			} else {
				return false;
			}
		},
		showSearchTree() {
			if (this.$data.isMinMenu) {
				this.$data.isShowSearchTree = !this.$data.isShowSearchTree;
			}
		},
		hideSearchTree() {
			this.$data.isShowSearchTree = false;
		}
	}
})
Vue.component('menu-setting',function(resolve){
	loadView("menuDetailInfo",resolve);
})
