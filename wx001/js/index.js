var img_url = "http://www.xayz.org/99.jpg";
var link = "http://www.xayz.org/?top=5586";
var desc = "填写资料！免费领取！送完即止！";
var title = "钛金刀具一套免费送，分享朋友圈就可抢!";

wx.config({
	debug: false,
	appId: 'wx7498f707667504b7',
	timestamp: 1466779553,
	nonceStr:  'ijJwJYgwgEq8RUWI',
	signature: 'b38c2de6470904c28126a7964dfe3b5987f1a3e9',
	jsApiList: [
	'onMenuShareTimeline',
	'onMenuShareAppMessage',
	'showOptionMenu',
	'checkJsApi',
	'closeWindow',
	'showMenuItems'
  ]
});
wx.ready(function () {
	// 在这里调用 API
	wx.onMenuShareTimeline({
		title: title,
		link: link,
		imgUrl: img_url,
		trigger: function (res) {
		
		},
		success: function (res) {
			alert('操作成功,即将跳转到领取页面!');
			$gotourl = "http://agent.pinzs.com/3cuc_admin/a/s1511188145419157/cm0001/wx_group/index.php/product_content/?id=959&top=5586";
			window.location.href=$gotourl;
			//alert($gotourl);
		},
		cancel: function (res) {
		
		},
		fail: function (res) {
			alert("接口调用失败，请重新分享");
			return false;
		}
	}); 
	wx.showOptionMenu();//显示菜单
});

function zf(){
	$("div#loadlayer").show();
	$("div#overlayer").show();
}

$(function(){
	$("div[id=overlayer]").on('click',function(){
		$("div#loadlayer").hide();
		$("div#overlayer").hide();
	});

	// if(window!=parent){
	// 	$(window.parent.document).find("#iframe1").prop('src', 'http://sy.pinzs.com/v-U70374L4S8');
	// }else{
	// 	$('#iframe1').prop('src', 'http://sy.pinzs.com/v-U70374L4S8');
	// }
});