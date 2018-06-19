/****
 * 2018-1-20 23:09 By chao
 * code.js
 * * */
const app = getApp()
const Zan = require('../common/component')

Page(Object.assign({}, Zan.Toast, {
  data: {
    codeUrl: '',
    id: '',
    share_id: 0,  //分享人id
    title: '',
    avatarUrl: '',
    username: '',
    canvasUrl: '',
    loading: false
  },
  onShareAppMessage: function (res) {
    let _this = this,
      param = "" + _this.data.id + "-" + _this.data.share_id+""
    if (res.from === 'button') {
      return {
        title: _this.data.title,
        path: 'pages/index/index?scene=' + param,
        imageUrl: _this.data.canvasUrl,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  },
  share(){  //生成分享图片
    let _this = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'shareCanvas',
      success: function (res) {
        _this.data.canvasUrl = res.tempFilePath
        wx.previewImage({
          current: res.tempFilePath, // 当前显示图片的http链接
          urls: [res.tempFilePath] // 需要预览的图片http链接列表
        })
      }
    })    
  },
  getCode(options, userInfo) {
    let _this = this
    wx.request({
      url: app.globalData.ajaxUrl + 'wexin/get-qrcode?games_config_id=' + _this.data.id,
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId'),
        'path': 'pages/index/index'
      },
      success: function (data) {
        if (data.data.code == 1001){
          // 网络地址转本地地址
          wx.getImageInfo({
            src: app.globalData.imgUrl+data.data.key,
            success: function (res) {
              _this.showCanvas(res.path, userInfo)   
              wx.hideLoading()         
              _this.setData({
                avatarUrl: userInfo.avatarUrl,
                username: userInfo.nickName,
                loading: true,
                share_id: data.data.share_id
              })    
            }
          })            
        }else{
          this.showZanToast('生成失败，稍后再试',2000)
        }
      },
      complete: function () {
        
      }
    }) 
  },
  showCanvas(tempFilePath, userInfo){
    let _this = this
    let ctx = wx.createCanvasContext('shareCanvas')
    let show = wx.createCanvasContext('show')    
    let avatar = wx.createCanvasContext('avatar')   
    //canvas绘制文字和图片
    show.draw()
    avatar.draw()
    ctx.drawImage('../../assets/images/sharebg.png', 0, 0, wx.getSystemInfoSync().windowWidth, 470)

    ctx.setFontSize(14)
    ctx.setFillStyle('#fde2b3')
    ctx.setTextAlign('center')
    ctx.fillText(userInfo.nickName+'转发了红包', wx.getSystemInfoSync().windowWidth / 2, 90)

    ctx.setFontSize(16)
    ctx.setFillStyle('#fde2b3')
    ctx.fillText(_this.data.title.length > 20 ? _this.data.title.substr(0, 20) : _this.data.title, wx.getSystemInfoSync().windowWidth / 2, 130)

    ctx.setFontSize(16)
    ctx.setFillStyle('#fde2b3')
    ctx.fillText(_this.data.title.length > 20 ? _this.data.title.substr(19, _this.data.title.length) : '', wx.getSystemInfoSync().windowWidth / 2, 160)

    ctx.setFontSize(15)
    ctx.setFillStyle('#fde2b3')
    ctx.setTextAlign('center')
    ctx.fillText('长按识别小程序，看看红包多大', wx.getSystemInfoSync().windowWidth / 2, 360)

    // 图片裁剪
    ctx.save()
    ctx.beginPath()
    ctx.arc(wx.getSystemInfoSync().windowWidth / 2, 220, 45, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(tempFilePath, (wx.getSystemInfoSync().windowWidth / 2)-45, 175, 90, 90)
    ctx.restore()

    ctx.draw()  
  },
  onLoad(options){
    let _this = this
    wx.showLoading({
      title: '正在生成',
    })
     
    _this.setData({
      id: options.id,
      title: options.title,
      loading: false
    })
    console.log(_this.data.loading)
    app.getUserInfo(function (userInfo) {    
      _this.getCode(options, userInfo)
    })    
  }
}))