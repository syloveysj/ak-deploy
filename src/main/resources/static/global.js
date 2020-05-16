Vue.use(ELEMENT, {size: 'mini'});

Vue.prototype.$global = {
	base: '/'
}
/*
* 获取屏幕宽高
*/
Vue.prototype.getViewportSize = function(){
	 return {
	   width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
	   height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
	 };
};
/**
 * 获取表格高度
 */
Vue.prototype.getTableHeight = function(){
	var height=$('.content-main').height()-155;
	return height;
}
Vue.prototype.getIframeTableHeight = function(){
	var height=document.documentElement.clientHeight-121;
	return height;
}
/**
 * 移除数组里的数据
 * @param {*} list 数组
 * @param {*} data 数据
 */
Vue.prototype.removeList = function(list, data){
	var index = list.indexOf(data);
	if (index > -1) {
		list.splice(index, 1);
	}
	return list;
}
Vue.prototype.isValInArray=function(list,val){
	return list.indexOf(val)>-1	? true : false
}
Vue.prototype.formatDate = function (dateStr, formart) {
	if (!formart) {
		formart = 'YYYY-MM-DD HH:mm:ss';
	}
	const date = moment(dateStr, formart);
	const curDate = moment();
	let h = date.format('HH');
	if (h <= 12) {
		h = '上午';
	} else {
		h = '下午';
	}
	var hour = date.format('HH:mm');
	var curDay = curDate.format('DD')
	var preDay = curDate.subtract(1, 'days').format('DD');
	var nextDay = curDate.add(1, 'days').format('DD');
	var specialDayStr = date.format('DD');
	if (specialDayStr == curDay) {
		specialDayStr = '今天';
	} else if (specialDayStr == preDay) {
		specialDayStr = '昨天';
	} else if (specialDayStr == nextDay) {
		specialDayStr = '明天';
	} else {
		specialDayStr = date.format('YYYY/MM/DD');
	}
	const result = {
		day: date.format("YYYY-MM-DD"),
		dayHour: date.format("YYYY-MM-DD HH:mm"),
		dayStr: date.format("YYYY-MM-DD HH:mm:ss"),
		dayFullStr: date.format("YYYY-MM-DD dddd HH:mm:ss"),
		day24Str: date.format('YYYY-MM-DD LTS'),
		daySpecialStr: specialDayStr + " " + h + " " + hour
	};

	return result;
}