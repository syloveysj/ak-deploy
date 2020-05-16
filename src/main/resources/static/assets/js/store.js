

const state = {
	tagsView : {
		tagsViewList : [],
		curTagsView:{}
	},

}
const mutations = {
	 ADD_TAGS_VIEW:(state,tagsItem)=>{
		 if(state.tagsView.tagsViewList.length>0){
			 if(!state.tagsView.tagsViewList.some(v=>v.path === tagsItem.path)){
				 state.tagsView.tagsViewList.push(tagsItem);
			 }

		 }else{
			 state.tagsView.tagsViewList.push(tagsItem);
		 }
		
	 },
	 SELECT_TAGS_VIEW:(state,tagsItem)=>{
		 if(state.tagsView.tagsViewList.length>0){
			 state.tagsView.tagsViewList.forEach(e => {
				 if(e.path===tagsItem.path){
					 state.tagsView.curTagsView=e;
				 }
			 })
		 }else{
			 state.tagsView.curTagsView=tagsItem;
		 }
		  
	 },
	 DEL_ALL_CURVIEW:(state,tagsItem)=>{
		 state.tagsView.curTagsView={};
	 }
}

const actions = {
	 addView({ commit }, view){
		 commit('ADD_TAGS_VIEW', view)
		 commit('SELECT_TAGS_VIEW', view)
	 }
	 
}

 
Vue.use(Vuex);
var app={
	state:state,
	mutations:mutations,
	actions:actions
}
const getters = {
	tagsViewList: state => state.tagsView.tagsViewList,
	curTagsView: state => state.tagsView.curTagsView
}
const store = new Vuex.Store({state,mutations,actions,getters});