const c2tab = {
	template: `
	<div id="tags-view-container">
		<el-scrollbar ref="scrollContainer" :vertical="false" 
			class="scroll-container tags-view-wrapper" @wheel.native.prevent="handleScroll">
			<router-link
				v-for="(tag,index) in visitedViews"
				v-if="tag !== undefined"
				ref="tag"
				:key="tag.path"
				:class="isActive(tag)?'active':''"
				:to="{ path: tag.path, query: tag.query }"
				tag="span"
				class="tags-view-item"
				@contextmenu.prevent.native="openContextMenu(tag,$event)"
			>
				{{ tag.name }}
				<span v-if="!isAffix&&tag.path!==homeDeploy.path" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
			</router-link>
		</el-scrollbar>
		<ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
			<li v-if="!isAffix&&selectedTag.path!==homeDeploy.path" @click="closeSelectedTag(selectedTag)">关闭当前</li>
			<li v-if="visitedViews.length>1" @click="closeOthersTags(selectedTag)">关闭其他</li>
			<li v-if="selectedTag.path!==homeDeploy.path" @click="refresh(selectedTag)">刷新当前页</li>
		</ul>
	</div>
	`,
	props: {
		homeDeploy: {
			type: Object,
			default () {
				return {}
			}
		}
	},
	data () {
		return {
			rootPath: this.homeDeploy.path,
			visitedViews: this.homeDeploy.path ? [{ ...this.homeDeploy }] : [],
			visible: false, top: 0, left: 0, selectedTag: {}
		}
	},
	methods: {
		// 页签是否为当前路由
		isActive (route) {
			return route.path === this.$route.path
		},
		// 重置当前路由信息
		resetActive () {
			for (var i = this.visitedViews.length - 1; i >= 0; i--) {
				if (this.visitedViews[i] !== undefined) {
					var active = this.visitedViews[i]
					if (this.$route.path !== active.path) {
						this.$router.replace({ path: active.path, query: active.query })
					}
					return
				}
			}
		},
		// 关闭选中的页签
		closeSelectedTag (view) {
			this.visitedViews.forEach((item, index) => {
				if (item !== undefined && item.path === view.path) {
					this.visitedViews.splice(index, 1)
				}
			});
			if (view.path && view.path.startsWith('/i/')) this.refreshIframe(item => item && item.path === view.path)
			this.visible = false
			this.resetActive()
		},
		// 关闭其他页签
		closeOthersTags (view) {
			let visitedViewsTmp = [...this.visitedViews]
			for (var i = 0; i < visitedViewsTmp.length; i++) {
				if (visitedViewsTmp[i] !== undefined && visitedViewsTmp[i].path !== view.path && visitedViewsTmp[i].path !== this.rootPath) {
					delete visitedViewsTmp[i]
				}
			}
			this.visitedViews = visitedViewsTmp
			this.refreshIframe(item => item && item.path !== view.path && item.path !== this.rootPath)
			this.visible = false
			this.resetActive()
		},
		// 右键弹出菜单
		openContextMenu (tag, e) {
			const menuMinWidth = 105
			const offsetLeft = this.$el.getBoundingClientRect().left
			const offsetWidth = this.$el.offsetWidth
			const maxLeft = offsetWidth - menuMinWidth
			const left = e.clientX - offsetLeft + 200

			if (left > maxLeft) {
				this.left = maxLeft
			} else {
				this.left = left
			}

			this.top = e.clientY
			this.visible = true
			this.selectedTag = tag
		},
		closeMenu () {
			this.visible = false
		},
		// 打开某页签
		openVisitView (item) {
			for (var i = 0; i < this.visitedViews.length; i++) {
				if (this.visitedViews[i] !== undefined && this.visitedViews[i].path === item.path) {
					return
				}
			}
			this.visitedViews.push(item)
			// 缓存ifram
			if (item.path && item.path.startsWith('/i/')) {
				for (var i = 0; i < this.$root.c2IframeCaches.length; i++) {
					if (this.$root.c2IframeCaches[i] !== undefined && this.$root.c2IframeCaches[i].path === item.path) {
						this.$root.c2IframeCaches[i] = this.$root.c2MenusMap[item.path]
						return
					}
				}
				this.$root.c2IframeCaches.push(item)
			}
		},
		refresh (tag) {
			if (tag.path) {
				if (tag.path.startsWith('/v/')) this.$root.c2ActiveViewKey = new Date().getTime()
				else if (tag.path.startsWith('/i/')) this.refreshIframe(item => item && item.path === tag.path, tag)
			}
		},
		// 去除或刷新缓存iframe
		refreshIframe (func, tag) {
			this.$root.c2IframeCaches = JSON.parse(JSON.stringify(this.$root.c2IframeCaches))
			this.$root.c2IframeCaches.forEach(item => {
				if (func(item)) {
					this.$set(item.iframeDeploy, 'src', '')
					if (tag && tag.iframeDeploy) {
						setTimeout(() => {
							this.$set(item.iframeDeploy, 'src', tag.iframeDeploy.src)
						}, 10)
					}
				}
			})
		}
	},
	computed: {
		isAffix () {
			if (this.visitedViews.length <= 1) return true
			return false
		}
	},
	watch: {
		visible (value) {
			if (value) {
				document.body.addEventListener('click', this.closeMenu)
			} else {
				document.body.removeEventListener('click', this.closeMenu)
			}
		},
		// 根据tabs页签计算缓存界面name
		visitedViews (value) {
			let tags = ["iframeComponent"]
			value.forEach(item => {
				if (item && item.path) {
					if (item.path.startsWith('/v/')) tags.push(item.path.substring(1).replace(/\//g, '_'))
				}
			})
			this.$root.c2IncludesNames = tags
		}
	}
}

Vue.component("c2-tab", c2tab);
