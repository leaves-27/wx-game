function loadingStart(tipsContent, errorTips, iconUrl, jump) {
    var isSupportTouch = window.supportTouch;
    $("#loadingSection .body div").unbind(isSupportTouch ? "touchend" : "click");
    if (tipsContent != null) {
        $("#loadingSection .body p").html(tipsContent);
        if (errorTips === true) {
            if (iconUrl) {
                $("#loadingSection .body img")[0].src = iconUrl;
            } else {
                $("#loadingSection .body img")[0].src = "http://res.tu.qq.com/assets/opnewyear2016_img/icon-loading.png";
            }
            $("#loadingSection .body img")[0].className = "";
            $("#loadingSection .body div").css("display", "");
            if (jump) {
                $("#loadingSection .body div").one(isSupportTouch ? "touchend" : "click", jump);
            } else {
                $("#loadingSection .body div").one(isSupportTouch ? "touchend" : "click", jumpToIndex);
            }
        } else {
            $("#loadingSection .body div").css("display", "none");
            $("#loadingSection .body img")[0].src = "http://res.tu.qq.com/assets/opnewyear2016_img/icon-loading.png";
            $("#loadingSection .body img")[0].className = "animate";
        }
    } else {
        $("#loadingSection .body div").css("display", "none");
        $("#loadingSection .body img")[0].src = "http://res.tu.qq.com/assets/opnewyear2016_img/icon-loading.png";
        $("#loadingSection .body img")[0].className = "animate";
        $("#loadingSection .body p").text("加载中请稍候");
    }
    $("#loadingSection").css("display", "");
    $("#loadingSection").css("opacity", 1);
}
function loadingStop() {
    $("#loadingSection").animate({
        opacity:0
    }, "fast", function(){
        $("#loadingSection").css("display", "none");
    });
}

var canvasDom;
var canvasCtx;
var cropGesture = null;

function cropStart(evt) {
    pageRecordClick("sng.tu.pupils.upload");
    if (window.isInPitu && window.isAndroid) {
    //if (false) {
        if (typeof(PituBridge) == 'object') {
            PituBridge.chooseImage(cropChoosedInPitu);
        } else {
            pageLoadScript("http://res.tu.qq.com/assets/tu/PituBridge-1.0.min.js", function(){
                PituBridge.chooseImage(cropChoosedInPitu);
            });
        }
    } else {
        var $upload = $("#uploadInput");
        $upload.unbind("change");
        $upload.one("change", cropChanged);
        $upload.trigger("click");

        if (window.isInMqq && window.self != window.top) {
            var followObj = {
                postcode: 'follow',
                data: {}
            }
            window.parent.postMessage(followObj, '*');
        }
    }
    
    return preventEventPropagation(evt);
}

function jumpToIndex(evt){
  cropStop(); 
  window.location.href = "index.html?_proxy=1";
}

function cropStop(evt) {
    var isSupportTouch = window.supportTouch;

    cropGesture.unbindEvents();
    $("#cropBar .cancel-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .confirm-btn").unbind(isSupportTouch ? "touchend" : "click");

    $("#cropSection").css("display", "none");
    $("#cropMaskUp").css("visibility", "hidden");
    $("#cropMaskDown").css("visibility", "hidden");
    $("#cropImg").css("display", "none");
    $("#cropImg").attr("src", "about:blank");

    $("#uploadInput").unbind("change");

    loadingStop();
    
    return preventEventPropagation(evt);
}
function cropChoosedInPitu(params) {
    loadingStart("");
    var originImg = new Image();
    originImg.onload = function(){
        var fullScreenImg = new Image();
        fullScreenImg.onload = function(){
            cropLoaded(this);
            loadingStop();
        }
        var mpImg = new MegaPixImage(originImg);
        mpImg.render(fullScreenImg, {maxWidth:960, maxHeight:960});
    }
    originImg.src = params.imgData ? "data:image/jpeg;base64," + params.imgData : params.imgUrl;
}

function cropChanged(evt) {
    if (this.files.length <= 0) {
        cropStop();
        return preventEventPropagation(evt);
    }
    
    $("#cropSection").css("display", "");
    
    loadingStart("");
    var file = this.files[0];
    var reader = new FileReader();
    reader.onload = function() {
        // 转换二进制数据
        var binary = this.result;
        var binaryData = new BinaryFile(binary);
        // 获取exif信息
        var imgExif = EXIF.readFromBinaryFile(binaryData);

        var fullScreenImg = new Image();
        fullScreenImg.onload = function(){
            cropLoaded(this);
            loadingStop();
        }
        var mpImg = new MegaPixImage(file);
        mpImg.render(fullScreenImg, {maxWidth:960, maxHeight:960, orientation:imgExif.Orientation});
    }
    reader.readAsBinaryString(file);
    
    return preventEventPropagation(evt);
}
function cropLoaded(img) {
    var isSupportTouch = window.supportTouch;

    $("#cropSection").css("display", "");

    var $cropLayer = $("#cropLayer");

    var cropSectionHeight = $("#cropSection").height();
    var cropBarHeight = $("#cropBar").height();
    var cropLayerHeight = $cropLayer.height();
    var cropLayerOriginY = (cropSectionHeight - cropBarHeight - cropLayerHeight) * 0.5;
    $cropLayer.css("top", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
    if (cropLayerOriginY > 0) {
        $("#cropMaskUp").css("height", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
        $("#cropMaskUp").css("top", 0);
        $("#cropMaskUp").css("visibility", "visible");
        $("#cropMaskDown").css("height", [cropLayerOriginY * 100/cropSectionHeight, "%"].join(""));
        $("#cropMaskDown").css("top", [(cropLayerOriginY + cropLayerHeight) * 100/cropSectionHeight, "%"].join(""));
        $("#cropMaskDown").css("visibility", "visible");
    } else {
        $("#cropMaskUp").css("visibility", "hidden");
        $("#cropMaskDown").css("visibility", "hidden");
    }

    var imgWidth = img.width;
    var imgHeight = img.height;
    var ratioWidth = $cropLayer.width() / imgWidth;
    var ratioHeight = $cropLayer.height() / imgHeight;
    var ratio = ratioWidth > ratioHeight ? ratioWidth : ratioHeight;

    cropGesture.targetMinWidth = imgWidth * ratio;
    cropGesture.targetMinHeight = imgHeight * ratio;

    var imgOriginX = ($cropLayer.width() - cropGesture.targetMinWidth) * 0.5;
    var imgOriginY = ($cropLayer.height() - cropGesture.targetMinHeight) * 0.5;
    
    var $cropImg = $("#cropImg");
    $cropImg.css("display", "");
    $cropImg.width(cropGesture.targetMinWidth);
    $cropImg.height(cropGesture.targetMinHeight);
    $cropImg.css("left", [imgOriginX, "px"].join(""));
    $cropImg.css("top", [imgOriginY, "px"].join(""));
    $cropImg[0].src = img.src;
    
    cropGesture.unbindEvents();
    cropGesture.bindEvents();
    $("#cropBar .cancel-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .cancel-btn").on(isSupportTouch ? "touchend" : "click", cropStop);
    $("#cropBar .confirm-btn").unbind(isSupportTouch ? "touchend" : "click");
    $("#cropBar .confirm-btn").on(isSupportTouch ? "touchend" : "click", cropConfirm);

    return false;
}

function cropConfirm(evt) {
    var canvasScale = canvasDom.height / $("#cropLayer").height();
    var $cropImg = $("#cropImg");
    var imgOrigin = {x:parseInt($cropImg.css("left")) || 0, y:parseInt($cropImg.css("top")) || 0};
    var imgSize = {width:$cropImg.width(), height:$cropImg.height()};
    canvasCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
    canvasCtx.drawImage($cropImg[0], imgOrigin.x * canvasScale, imgOrigin.y * canvasScale, imgSize.width * canvasScale, imgSize.height * canvasScale);
    var dataURL = "";
    if (window.isAndroid){
        var imgEncoder = new JPEGEncoder();
        dataURL = imgEncoder.encode(canvasCtx.getImageData(0, 0, canvasDom.width, canvasDom.height), 85, true);
    } else {
        dataURL = canvasDom.toDataURL("image/jpeg", 0.85);
    }

    jumpToMiddlePage(dataURL);
    pageRecordClick("sng.tu.pupils.confirm");
    
    return preventEventPropagation(evt);
}

function jumpToMiddlePage(dataURL)
{
  /*
  var rand = (Math.random() * 1000000) % 10;
  if(rand < 8)
  {
    //window.location.href="busy.html";
    //return;
  }
  */

  $("#indexSection").css("display", "none");
  $("#cropSection").css("display", "none");
  $("#middleSection").css("display", "");
  $("#middleSection .user-photo").attr("src", dataURL);

  var dataComponent = dataURL.split(",");
  var imgData = dataComponent[1];

  $("#middleSection .sex-male").on("click", function(){
      userSex = 1;
      cropUploadWithData(imgData);
      pageRecordClick("sng.tu.pupils.male");
      });

  $("#middleSection .sex-female").on("click", function(){
      userSex = 0;
      cropUploadWithData(imgData);
      pageRecordClick("sng.tu.pupils.female");
      });

}

function cropUploadWithData(imgData) {
    loadingStart("正在制作请稍等");
    var hairstyle = cosIndex;
    if(userSex == 1) hairstyle += 3;
    var startTime = (new Date()).valueOf();
    $.ajax({
        type:"POST",
        url:"../../cgi/doFaceMerge.php?cosid= "+ hairstyle,
        data:imgData,
        dataType:"json",
        timeout:30000,
        success:function(data, status, xhr){
            var endTime = (new Date()).valueOf();
            haboReport(0, endTime-startTime);
            cosIndex = 0;
            cosData = data;
            var cosUrlKey = cosNames[cosIndex] + "_url";
            cosData[cosUrlKey] = data.cosurl;
            cosData.rowData = imgData;
            cosData.ids = [data.id];
            cropUploadCallback(cosData);
        },
        error:function(xhr, errorType, error){
            haboReport(-1, -1);
            loadingStart("服务器没有响应<br />请检查网络！", true);
        }
    });
}

function cropUploadWithId(cosid) {
    if (cosData && cosData.id == cosid) {
        loadingStart("正在制作请稍等");
        cosIndex = (cosIndex + 1) % cosNames.length;
        var cosUrlKey = cosNames[cosIndex] + "_url";
        if (cosData[cosUrlKey]) {
            cropUploadCallback(cosData);
        } else {
          var hairstyle = cosIndex;
          if(userSex == 1) hairstyle += 3;
          var startTime = (new Date()).valueOf();
            $.ajax({
                type:"POST",
                url:"../../cgi/doFaceMerge.php?cosid=" + hairstyle,
                data:cosData.rowData,
                dataType:"json",
                timeout:30000,
                success:function(data, status, xhr){
                    var endTime = (new Date()).valueOf();
                    haboReport(0, endTime-startTime);
                    if (data.ret == 0) {
                        cosData[cosUrlKey] = data.cosurl;
                        cosData.ids[cosIndex] = data.id;
                        cropUploadCallback(cosData);
                    } else {
                        loadingStart("服务器开小差啦<br />请稍后再试！", true);
                    }
                },
                error:function(xhr, errorType, error){
                    haboReport(-1, -1);
                    loadingStart("服务器没有响应<br />请检查网络！", true);
                }
            });
        }
    }
}

function cropUploadCallback(data) {
    if (data.ret == 0) {
        //var shareImg = data["cosurl"];
        var shareImg = data[cosNames[cosIndex] + "_url"];
        if (shareImg) {
            var shareImgDom = $("#shareImg")[0];
            shareImgDom.onload = function(){
                loadingStop();

                $("#middleSection").css("display", "none");
                $("#resultSection .share-btn").css("display", "");
                if(window.isInWechat) 
                {
                  $("#resultSection .share-btn").css("display", "none");
                }
                $("#resultSection .switch-btn").css("display", "");
                $("#resultSection .photo-result").attr("src", shareImg);
                $("#resultSection").css("display", "");
                cropStop();
            }
            shareImgDom.src = shareImg;

            var shareUrl = window.baseUrl + "index.html?k=" + data.ids[cosIndex] + "&level=" + window.level + "&pf_flag=" + pf_flag + "&_proxy=1";
            $("#shareImg").attr("shareUrl", shareUrl);
            setShareParams();
        } else {
            loadingStart("服务器开小差啦<br />请稍后再试！", true);
        }
    } else if (data.ret == -2) {
        loadingStart("没有识别到人脸<br />换一张试试", true);
    } else {
        loadingStart("服务器开小差啦<br />请稍后再试！", true);
    }
}


function sharePageByPlatform(evt) {
    pageRecordClick("sng.tu.pupils.share");
    var shareTitle = document.title;
    var shareDesc = $("meta[name=description]").attr("content");
    var shareImg = $("#shareImg").attr("src");
    var shareUrl = $("#shareImg").attr("shareUrl");
    if (window.supportTouch) {
        if (window.isInPitu) {
            var shareParams = {
                title:shareTitle,
                desc:shareDesc,
                summary:shareTitle,
                url:shareUrl,
                imageUrl:shareImg,
                originImageUrl:shareImg,
                platforms:"QzoneLink,QQLink,MomentLink,Wechat"
            };
            if (typeof(PituBridge) == 'object') {
                PituBridge.share(shareParams);
            } else {
                pageLoadScript("http://res.tu.qq.com/assets/tu/PituBridge-1.0.min.js", function(){
                    PituBridge.share(shareParams);
                });
            }
        } else if((window.isInMqzone || window.isInMqq) && (window.p_uin.length > 0 && window.p_skey.length > 0)) {
          sharePageByShuoshuoApi(shareImg, shareUrl);
        } else {
            $("#shareSection").css("display", "");
        }
    } else {
        sharePageByQZoneRedirect(shareImg, shareUrl);
    }

    return preventEventPropagation(evt);
}
function setShareParams() {
    var shareTitle = document.title;
    var shareDesc = $("meta[name=description]").attr("content");
    var shareImg = $("#shareImg").attr("src");
    var shareUrl = $("#shareImg").attr("shareUrl");
    if (window.isInWechat) {
        var shareParams = {
            title:shareTitle,
            desc:shareDesc,
            link:shareUrl,
            imgUrl:shareImg,
            success:function(){},
            cancel:function(){}
        };
        if (typeof(wx) == "object") {
            wx.onMenuShareTimeline({
                title:shareTitle,
                desc:shareDesc,
                link:shareUrl,
                imgUrl:shareImg,
                success:function(){},
                cancel:function(){}
            });
            wx.onMenuShareAppMessage(shareParams);
            wx.onMenuShareQQ(shareParams);
            wx.onMenuShareWeibo(shareParams);
            wx.onMenuShareQZone(shareParams);
        } else {
            pageLoadScript("http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function(){
                pageLoadScript("http://tu.qq.com/websites/wxBridge.php", function(){
                    wx.ready(function(){
                        wx.onMenuShareTimeline({
                            title:shareTitle,
                            desc:shareDesc,
                            link:shareUrl,
                            imgUrl:shareImg,
                            success:function(){},
                            cancel:function(){}
                        });
                        wx.onMenuShareAppMessage(shareParams);
                        wx.onMenuShareQQ(shareParams);
                        wx.onMenuShareWeibo(shareParams);
                        wx.onMenuShareQZone(shareParams);
                    });
                });
            });
        }
    } else if (window.isInMqq) {
        var shareParams = {
            share_url:shareUrl,
            title:shareTitle,
            desc:shareDesc,
            image_url:shareImg
        };
        if (typeof(mqq) == "object") {
            mqq.data.setShareInfo(shareParams);
        } else {
            pageLoadScript("http://pub.idqqimg.com/qqmobile/qqapi.js?_bid=152", function(){
                mqq.data.setShareInfo(shareParams);
                mqq.ui.setOnShareHandler(function(shareType){
                    var shareTitle = shareType==3 ? $("meta[name=description]").attr("content") : document.title;
                    var shareDesc = shareType==3 ? document.title : $("meta[name=description]").attr("content");
                    var shareImg = $("#shareImg").attr("src");
                    var shareUrl = $("#shareImg").attr("shareUrl");
                    mqq.ui.shareMessage({
                        share_url:shareUrl,
                        title:shareTitle,
                        desc:shareDesc,
                        image_url:shareImg,
                        share_type:shareType,
                        appid:1101218289,
                        sourceName:"天天P图"
                    });
                });
            });
        }
    } else if (window.isInMqzone) {
        if (typeof(QZAppExternal) == "object") {
            QZAppExternal.setShare(function(data){

            }, {
                'type' : "share",
                'image': [shareImg, shareImg, shareImg, shareImg, shareImg],
                'title': [shareTitle, shareTitle, shareTitle, shareTitle, shareDesc],
                'summary': [shareDesc, shareDesc, shareDesc, shareDesc, shareTitle],
                'shareURL': [shareUrl, shareUrl, shareUrl, shareUrl, shareUrl]
            });
        } else {
            pageLoadScript("http://qzs.qq.com/qzone/phone/m/v4/widget/mobile/jsbridge.js", function(){
                QZAppExternal.setShare(function(data){

                }, {
                    'type' : "share",
                    'image': [shareImg, shareImg, shareImg, shareImg, shareImg],
                    'title': [shareTitle, shareTitle, shareTitle, shareTitle, shareDesc],
                    'summary': [shareDesc, shareDesc, shareDesc, shareDesc, shareTitle],
                    'shareURL': [shareUrl, shareUrl, shareUrl, shareUrl, shareUrl]
                });
            });
        }
    }
}

function haboReport(ret, costtime)
{
  var habourl = "http://wspeed.qq.com/w.cgi?appid=1000322&commandid=doFaceMerge&releaseversion=1.1&touin=553470283&frequency=1&resultcode=" + ret + "&tmcost=" + costtime;
  $.ajax({
      type:"GET",
      url:habourl,
      dataType:"jsonp",
      timeout:30000,
      success:function(data, status, xhr){
      },
      error:function(xhr, errorType, error){
      }
  });

}

var cosIndex = 0;
var userSex = 0;
var cosData = null;
var pf_flag = "other";

var cosNames = ["model1", "model2", "model3"];


function indexPageReady() {
    var cosid = pageGetParam("k");
    var level = pageGetParam("level");
    var pf_param = pageGetParam("pf_flag");

    if (window.isInWechat) {
      pf_flag = "wechat";
    } else if (window.isInMqzone) {
      pf_flag = "mqzone";
    } else if (window.isInMqq) {
      pf_flag = "mqq";
    } else if (window.isInPitu) {
      pf_flag = "pitu";
    }

    if(level == undefined) level = 0;
    window.level = level + 1;
    document.getElementById("loadingSection").style.display = "none";
    if (!window.supportTouch && !window.isWebkit) {
        var pageUrl = window.baseUrl + "index.html?k=" + cosid + "&pf_flag=" + pf_flag + "&_proxy=1";
        var qrcodeUrl = "http://tu.qq.com/websites/qrcode.php?url=" + encodeURIComponent(pageUrl);
        document.getElementById("qrcodeImg").src = qrcodeUrl;
        document.getElementById("qrcodeSection").style.display = "";
        return;
    }

    window.p_uin = pageGetCookie("uin").replace(/o/, "");
    window.p_skey = pageGetCookie("p_skey");

    // 在qq或者qzone中上报登陆到QZONE
    if(window.isInMqzone || window.isInMqq)
    {
      $.ajax({
            type:"GET",
            url:"http://activity.qzone.qq.com/fcg-bin/v2/fcg_act_login_count_report",
            data:{
                uin:window.p_uin
            },
            dataType:"jsonp",
            timeout:10000,
            success:function(data, status, xhr){
            },
            error:function(xhr, errorType, error){
            }
      });
    }


    var shareUrl = window.baseUrl + "index.html?level=" + window.level + "&pf_flag=" + pf_flag + "&_proxy=1";
    if (cosid.length > 0) {
        loadingStart("");
        $.ajax({
            type:"GET",
            url:"../../cgi/queryCosInfo.php",
            data:{
                id:cosid
            },
            dataType:"json",
            timeout:10000,
            success:function(data, status, xhr){
                var shouldStopLoading = true;
                if (data.ret == 0) {
                  shareUrl = window.baseUrl + "index.html?k=" + cosid + "&level=" + window.level + "&pf_flag=" + pf_flag + "&_proxy=1";
                  if (data["cosurl"]) {
                    var shareImg = data["cosurl"];
                    shouldStopLoading = false;

                    var shareImgDom = $("#shareImg")[0];
                    shareImgDom.onload = function(){
                    loadingStop();

                    $("#resultSection .retry-tip").css("display", "none");
                    $("#resultSection .share-btn").css("display", "none");
                    $("#resultSection .switch-btn").css("display", "none");
                    $("#resultSection .retry-btn").css("display", "none");
                    $("#resultSection .metry-btn").css("display", "");
                    $("#resultSection .photo-result").attr("src", shareImg);
                    $("#resultSection").css("display", "");
                    $("#indexSection").css("display", "");
                    }
                    shareImgDom.src = shareImg;
                  }
                }
                if (shouldStopLoading) {
                    loadingStop();
                    $("#indexSection").css("display", "");
                }
                $("#shareImg").attr("shareUrl", shareUrl);
                window.setTimeout(indexPageInitialize, 0);
            },
            error:function(xhr, errorType, error){
                loadingStop();
                $("#indexSection").css("display", "");
                $("#shareImg").attr("shareUrl", shareUrl);
                window.setTimeout(indexPageInitialize, 0);
            }
        });
    } else {
        $("#indexSection").css("display", "");
        $("#shareImg").attr("shareUrl", shareUrl);
        window.setTimeout(indexPageInitialize, 0);
    }
}
function indexPageInitialize() {
    // init crop section event
    cropGesture = new EZGesture($("#cropLayer")[0], $("#cropImg")[0], {targetMinWidth:442, targetMinHeight:540});
    var $canvas = $("#cropCanvas");
    canvasDom = $canvas[0];
    canvasCtx = canvasDom.getContext("2d");
    cropGesture.targetMinWidth = canvasDom.width;
    cropGesture.targetMinHeight = canvasDom.height;
    $("#cropSection").css("visibility", "hidden");
    $("#cropSection").css("display", "");
    var cropLayerHeight = ($("#cropSection").width() * canvasDom.height * 100 / (canvasDom.width * $("#cropSection").height())).toFixed(2);
    $("#cropLayer").css("height", [cropLayerHeight, "%"].join(""));
    $("#cropSection").css("display", "none");
    $("#cropSection").css("visibility", "visible");
    $("#indexSection .choose-btn").on("click", cropStart);

    // init download event
    if (window.isInPitu) {
        $("#resultSection .download-banner").css("display", "none");
        $("#resultSection .download-ear-img").css("display", "none");
        $("#resultSection .download-area").css("display", "none");
    } else {
      if(window.isInWechat)
      {
        $("#resultSection .share-btn").css("display", "none");
        $("#resultSection .retry-btn").css("left", "38%");
        $("#resultSection .retry-tip").css("left", "35%");
      }
      $("#resultSection .download-area").on("click", function(){
          pageRecordClick("sng.tu.pupils.download");
          window.location.href = "http://tu.qq.com/downloading.php?by=35";
          });
    }

    //3秒后隐藏retry-tip
    /*
    window.setTimeout(function(){
        $("#resultSection .retry-tip").css("display","none");
        }, 13000);
    */

    // init share event
    setShareParams();
    $("#resultSection .share-btn").on("click", sharePageByPlatform);
    $("#shareSection").on("click", function(){
        $("#shareSection").css("display", "none");
    });

    // init btn event
    $("#resultSection .retry-btn").on("click", function(){
        pageRecordClick("sng.tu.pupils.retry");
        var curDate = new Date();
        window.location.href = "index.html?_proxy=1&tm=" + curDate.getTime();
    });

    $("#resultSection .metry-btn").on("click", function(){
        pageRecordClick("sng.tu.pupils.metry");
        // 如果在qzone分享到微信，微信的用户点击之后自动跳转到手Q
        if((pageGetParam("pf_flag") == "mqzone" || pageGetParam("pf_flag") == "mqq") && window.isInWechat)
        {
          pageRecordClick("sng.tu.pupils.jump2qq");
          var jumpurl = "http://h5.qzone.qq.com/q/tu/websites/pupils/index.html?_proxy=1";
          window.open('mqqapi://forward/url?url_prefix=' + btoa(jumpurl) + '&version=1&src_type=web');
          window.location.href = ('mqqapi://forward/url?url_prefix=' + btoa(jumpurl) + '&version=1&src_type=web');

          //如果没安装QQ跳首页
          window.setTimeout(function(){
            window.location.href = "index.html?_proxy=1";
            }, 8000);
          return;
        }
        else
        {
          var myDate = new Date();
          if(myDate.getHours() >= 8 && myDate.getHours() <= 21)
          {
            window.location.href = "index.html?_proxy=1";
          }
          else
          {
            if(window.isInWechat)
            {
              window.location.href = "http://tu.qq.com/downloading.php?by=35";
            }
            else
            {
              window.location.href = "index.html?_proxy=1";
            }
          }
        }
    });

    $("#resultSection .switch-btn").on("click", function(){
        if (cosData) {
        cropUploadWithId(cosData.id);
        pageRecordClick("sng.tu.pupils.switch");
        }
    });

    // record pv
    var pf_flag = "other";
    if (window.isInWechat) {
        pf_flag = "wechat";
    } else if (window.isInMqzone) {
        pf_flag = "mqzone";
    } else if (window.isInMqq) {
        pf_flag = "mqq";
    } else if (window.isInPitu) {
        pf_flag = "pitu";
    }

    var record_level = window.level - 1;
    pageRecordPV(location.pathname + "-" + pf_flag + "-" + record_level);}
function indexPageResize() {
}
