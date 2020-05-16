var indexApi={
	data(){
		return{
			portalData:null,
			myTopMenusData:[],// 一级菜单目录
			TopMenusData:[],//所有系统菜单目录
			LeftMenusShow:[],// 左侧菜单显示
			LeftMenusData:[],// 左侧菜单原始数据
			MenusData:[],//全部菜单组
		}
	},
	created(){
		this.initMenuData();
	},
	methods:{
		initMenuData:function(){
			$http.get("proxy/aip/v1/menus").then(data => {
					 this.initTopMenus(data);
			 }).catch(error => {
			    console.log(error);
			 });
		},
		initTopMenus:function(Menus){
			var url="?userId="+Menus.user.id+"&order=asc";
			$http.get('proxy/aip/v2/resources/favorites'+url).then(data =>{
				if(data.length>0){
					for(var i in data){
						var item = data[i];
						var top={
								id:item.id,
								icon:"el-icon-monitor",
								name:item.name,
								isMyproject:"1",
								sn:item.sn,
								type:item.type,
								path:item.uri
						}
						this.myTopMenusData.push(top);
						
					}
					this.setMenuData(Menus);
				}else{
					this.setMenuData(Menus);
				}
			});
		},
		setMenuData:function(data){
			var navigations=data.navigations;
			this.portalData={
				appid:data.appid,
				appname:data.appname,
				appurl:data.appurl,
				user:data.user
			}
			
			if(navigations){
				var menu_=[];
				for(var topNum in navigations){
					var item=navigations[topNum];
					//item.icon=item.fontIcon?'el-icon-'+item.fontIcon:"el-icon-menu";
					item.icon="el-icon-menu";
					//item=this.urlChange(item);
					if(item.pid=='0'){
						this.TopMenusData.push(item);
					}
					this.MenusData.push(item);
				}
				this.LeftMenusData=this.buildTree(this.MenusData,'0');
				// 默认选择第一个
				if(this.myTopMenusData.length>0){
					for(var t in this.LeftMenusData){
						var targetId=this.myTopMenusData[0].id;
						if(this.LeftMenusData[t].id==targetId){
							this.topClick(this.LeftMenusData[t]);
						}
					}
				}else{
					this.topClick(this.LeftMenusData[0]);
				}
			}
		},
		topClick:function(data){
			
			if(this.LeftMenusData.length>0){
				for(var i in this.LeftMenusData){
					var item=this.LeftMenusData[i];
					if(data.id==item.id){
						this.LeftMenusShow=item.children;
						this.menus=item.children;
						this.selectTopMenu(data);
						console.log(this.menus);
					}
				}
			}
		},
		selectTopMenu:function(data){
			var list=[];
			for(var i in this.myTopMenusData){
				var item=this.myTopMenusData[i];
				if(data.id==item.id){
					item.isSelect=true;
				}else{
					item.isSelect=false;
				}
				list.push(item);
			}
			this.myTopMenusData=list;
		},
		buildTree:function(list,parentId){
			var attr = {
					  id: 'id',
					  parentId: 'pid',
					  name: 'name',
					  uri: 'uri',
					  path:'path',
					  fontIcon: 'fontIcon',
					  icon:'icon',
					  children:'children',
					  iframeDeploy:'iframeDeploy'
					  
			};
			 let items= {};
		    // 获取每个节点的直属子节点，*记住是直属，不是所有子节点
		    for (let i = 0; i < list.length; i++) {
		         let key = list[i][attr.parentId];
		         var data=list[i];
		         var url="";
		         if(data.uri){
		        	 url=data.uri
		         }else{
		        	 url=data.uri; 
		         }
		         
		         if (items[key]) {
		        	 var menu={
		            	[attr.id]:data.id,
		            	[attr.parentId]:data.pid,
		            	[attr.name]:data.name,
		            	[attr.icon]:data.icon,
		            	[attr.path]:"/i/"+data.code,
		            	[attr.iframeDeploy]:{src:url,height:this.getViewportSize().height-120+'px'},
		             }
				     items[key].push(menu);
		         } else {
		             items[key] = [];
		             var menu={
		            	[attr.id]:data.id,
		            	[attr.name]:data.name,
		            	[attr.parentId]:data.pid,
		            	[attr.icon]:data.icon,
		            	[attr.path]:"/i/"+data.code,
		            	[attr.iframeDeploy]:{src:url,height:this.getViewportSize().height-120+'px'},
		             }
		             items[key].push(menu);
		         }
		     }
		     return this.formatTree(items, parentId);
		},
		formatTree : function(items, parentId){
			let result = [];
		    if (!items[parentId]) {
		        return result;
		    }
		    for (var t of items[parentId]) {
		        var children = this.formatTree(items, t.id)
		        if(children instanceof Array){
		        	if(children.length>0){
		        		t.children=children;
		        	}
		        }
		        result.push(t);
		    }
			return result;
		}
	}
}