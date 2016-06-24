wx.config({
  debug: false,
  appId: 'wxb4a79d390beb3fb5',
  timestamp: "1466779557",
  nonceStr: '2Tkp0Lg6PLJQU5ks',
  signature: '785ae2f657165d781f096ad74380a7fa409a1bb3',
  jsApiList:[
  	'onMenuShareTimeline',
  	'onMenuShareAppMessage'
  ]
});

wx.ready(function () {
  var shareData64 = {
  	title: '盛世玫瑰钛金刀斥资免费送，每人限领一套！',
  	desc: '盛世玫瑰钛金刀为登录中国市场，斥资免费送，每人限领一套！',
  	link: PREFIX_URL+'v-U70374L4S8',
  	imgUrl:  PREFIX_FILE_HOST  +'pic/27/201604/56fe16cd138cf_small.jpg'
  };

  wx.onMenuShareAppMessage(shareData64);
  wx.onMenuShareTimeline(shareData64);
}); 

wx.error(function (res) {
	//alert(res.errMsg);
});