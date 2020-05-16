/************   菜单面包屑tab页签处理  **********/
var indexMixin = {
	data: {
		c2IncludesNames: [], //缓存界面组件name,默认为:v_+表单编号/替换为_
		c2IframeCaches: [], //存放iframe数据
		c2MenusMap: {}, // 存放菜单信息map
		c2ActiveViewKey: '' //route-view的key值
	},
	methods: {
		initC2ComponentData (menu) {
			const rootRefs = this.$refs, homeDeploy = this.homeDeploy
			if (menu && menu.id) {
				if (rootRefs['c2menu']) rootRefs['c2menu'].setActiveKey((menu.id))
				if (rootRefs['c2bread'] && this.menus.length) rootRefs['c2bread'].setItems([...setBreadLink(this.menus, item => item.path === menu.path)])
				if (rootRefs['c2tab']) rootRefs['c2tab'].openVisitView(menu)
				else this.c2IframeCaches = [menu]
			} else {
				if (rootRefs['c2menu']) rootRefs['c2menu'].setActiveKey((''))
				if (homeDeploy && homeDeploy.path && this.$route.path === homeDeploy.path) {
					if (rootRefs['c2bread']) rootRefs['c2bread'].setItems([])
				}
			}
		},
	},
	watch: {
		'$route': {//路由监听
			handler (to, from) {
				this.initC2ComponentData(this.c2MenusMap[to.path])
				//表单css资源加载
				if (from && from.path && from.path.startsWith("/v/")) {
					var formCode = from.path.replace("/v/", "");
					var cssUrl = "vcss/" + formCode + ".css";
					Vue.prototype.$unloadCss(cssUrl);
				}
				if (to && to.path && to.path.startsWith("/v/")) {
					var formCode = to.path.replace("/v/", "");
					var cssUrl = "vcss/" + formCode + ".css";
					Vue.prototype.$loadCss(cssUrl);
				}
			},
			immediate: true
		},
		'menus': {
			handler (val) {
				if (!val || !val.length) return
				this.c2MenusMap = getMenusMap(val)
				this.initC2ComponentData(this.c2MenusMap[this.$route.path])
			},
			immediate: true
		}
	},
	created () {
		// 注册表单路由
		allFormRouter().then((formRoutes) => {
			this.$router.addRoutes(formRoutes)
		}).catch(e => {
			console.error("获取表单信息出错！", e);
		})
	},
	mounted () {
		// 注册iframe路由
		this.$router.addRoutes([{ path: '/i/*', component: !this.$refs['c2tab'] ? c2IframeComponent : null }])
	}
}
/************   菜单面包屑tab页签处理  **********/

// 自定义指令，将那些需要权限控制的页面元素在渲染前就隐藏起来
Vue.directive('c2perm', {
	bind: function (el) {
		el.style.display = 'none'
	}
})

/************   axios请求处理  **********/
//axios请求默认设置
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

axios.interceptors.request.use(function (config) {
	return config;
}, function (error) {
	return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
	return response.data;
}, function (error) {//拦截登录超时401请求
	console.log(error.response);
	var errorResponse = error.response;
	if (errorResponse.status == 401) {
		console.error("登录超时");
		let loginUrl = errorResponse.headers.loginurl;
		if (loginUrl) {
			const location = window.location;
			let redirectUri = "?" + location.hash;
			let redirectLoginUrl = loginUrl + redirectUri;
			window.location.href = redirectLoginUrl;
		} else {
			window.location.reload(true);
		}
	}
	return Promise.reject(error);
});

//axios重命名
var $http = axios;
/************   axios请求处理结束  **********/

/************   全局方法：弹窗  **********/
var _C2Modals = [];
Vue.prototype.$modal = {
	open: function (url, params, options, closeFn, dismissFn) {
		var C2Modal = new Vue(getRemoteDialogComponent(url, params, options, closeFn, dismissFn));
		C2Modal.$mount();
		document.body.appendChild(C2Modal.$el);
		_C2Modals.push(C2Modal);
	},
	close: function (params) {
		if (_C2Modals.length > 0) {
			var Modal = _C2Modals.pop();
			Modal.close(params);
		}
	},
	dismiss: function (params) {
		if (_C2Modals.length > 0) {
			var Modal = _C2Modals.pop();
			Modal.dismiss(params);
		}
	}
};
/************   全局方法：弹窗结束  **********/

/************   全局方法：资源加载  **********/
Vue.prototype.$loadCss = function (cssHref) {
	const el = document.querySelector('link[href="' + cssHref + '"]');
	if (!el) {
		const el = document.createElement('link');
		el.rel = "stylesheet";
		el.href = cssHref;
		document.head.appendChild(el);
	}
}

Vue.prototype.$unloadCss = function (cssHref) {
	const el = document.querySelector('link[href="' + cssHref + '"]');
	document.head.removeChild(el);
}

Vue.prototype.$loadJs = function (src) {
	return new Promise(function (resolve, reject) {
		if (document.querySelector('script[src="' + src + '"]')) {
			resolve();
			return;
		}

		const el = document.createElement('script');
		el.type = 'text/javascript';
		el.async = true;
		el.src = src;
		el.addEventListener('load', resolve);
		el.addEventListener('error', reject);
		el.addEventListener('abort', reject);

		document.head.appendChild(el);
	});
}
/************   全局方法：资源加载  **********/


function allFormRouter () {
	return fetch("fsns", { headers: { 'Show-In-UI-View': true } }).then(function (response) {
		return response.json();
	}).then(function (formNums) {
		var formRoutes = formNums.map(fcode => {
			return {
				path: "/v/" + fcode,
				component: function () {
					return Vue.prototype.$loadJs("vjs/" + fcode + ".js").then(() => {
						return eval(fcode.replace(/\//g, '_'));
					});
				}
			}
		})
		return formRoutes;
	})
}

/**
 * 异步加载表单组件
 * @param {string} formCode 表单编号 
 * @param {fn} resolve  
 */
function loadView (formCode, resolve) {
	//兼容表单路径写法
	if (formCode.startsWith("/v/")) formCode = formCode.substring(3);
	if (formCode.startsWith("v/")) formCode = formCode.substring(2);
	return Vue.prototype.$loadJs("vjs/" + formCode + ".js").then(() => {
		eval(formCode.replace(/\//g, '_') + ".beforeCreate=function(){Vue.prototype.$loadCss('vcss/" + formCode + ".css')}");
		eval(formCode.replace(/\//g, '_') + ".destroyed=function(){Vue.prototype.$unloadCss('vcss/" + formCode + ".css')}");
		resolve(eval(formCode.replace(/\//g, '_')));
	});
}

//加载异步弹窗组件
function getRemoteDialogComponent (url, params, options, closeFn, dismissFn) {
	return {
		//template:'<el-dialog :title="title" :visible.sync="visible" ...options><c2-async-form :dialog-visible="visible" @close-dialog="closeDialog"/></el-dialog>',
		data: { visible: true },
		render: function (createElement, context) {
			return createElement('el-dialog', {
				props: {
					visible: this.visible,
					...options
				},
				on: {//dialog组件点击X默认触发的事件
					"update:visible": this.dismiss
				}
			}, [
				createElement("c2-async-form", {
					props: {
						params: params
					}
				})
			])
		},
		methods: {
			close (params) {
				this.visible = false;
				if (typeof closeFn === "function") closeFn(params);
			},
			dismiss (params) {
				this.visible = false;
				if (typeof dismissFn === "function") dismissFn(params);
			}
		},
		components: {
			'c2-async-form': function (resolve, reject) {
				loadView(url, resolve);
			}
		}
	}
}

//登出方法
function logout () {
	axios.get("ws/logout").then(function (data) {
		var uri = data.result;
		if (uri) {
			const location = window.location;
			let redirectUri = "?" + location.hash;
			let redirectLoginUrl = uri + redirectUri;
			window.location.href = redirectLoginUrl;
		} else {
			window.location.reload(true);
		}
	})
}

// 获取菜单map信息
function getMenusMap (tree, rel = {}) {
	const unbind = (list, path) => {
		if (!list || list.length <= 0) return []
		for (let i = 0; i < list.length; i++) {
			let menu = list[i]
			if (menu.children) {
				unbind(menu.children, path)
			} else {
				rel[menu.path] = menu
				// { menu, bread: setBreadLink(tree, item => item.path === menu.path) }
			}
		}
	}
	unbind(tree)
	return rel
}
// 获取面包屑路径数据
function setBreadLink (tree, func, rel = []) {
	if (!tree) return []
	for (const item of tree) {
		if (item.groupTitle) item.name = item.groupTitle
		rel.push(item)
		if (func(item)) return rel
		if (item.children) {
			const findChildren = setBreadLink(item.children, func, rel)
			if (findChildren.length) return findChildren
		}
		rel.pop()
	}
	return []
}
// 从后台获取权限数据，并据此来将那些需要权限控制的页面元素进行显示或者移除操作。在表单的挂载后 mounted 生命周期中调用
function removeUnAuthorizedNode () {
	var perms = []
	var nodeList = document.querySelectorAll("[perm-res]")
	if (!nodeList || nodeList.length == 0) {
		return
	}
	nodeList.forEach(node => {
		perms.push(node.getAttribute("perm-res"))
	})
	if (perms.length > 0) {
		axios.get("ws/isPermitedByBatch", {
			params: { permExpr: perms },
			paramsSerializer: function (params) {
				return Qs.stringify(params, { arrayFormat: 'repeat' })
			}
		}).then(function (data) {
			var permitedData = data.result
			if (permitedData) {
				for (i in perms) {
					var perm = perms[i]
					var node = document.querySelector("[perm-res='" + perm + "']")
					if (!node) {
						continue
					}
					if (!permitedData[perm]) {
						node.remove()
					} else {
						node.removeAttribute("perm-res")
						node.style.display = 'block'
					}
				}
			}
		})
	}
}
