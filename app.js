/****
 * 2017-12-23 16:25 By chao
 * app.js
 * * */
App({
  imageLoad: function (e) {
    var $width = e.detail.width,    //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height;    //图片的真实宽高比例
    var viewWidth = 718,           //设置图片显示宽度，左右留有16rpx边距
      viewHeight = 718 / ratio;    //计算的高度值
    var image = this.data.images;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  },
  onLaunch: function () {  //初始化
    wx.setStorageSync('openId', '');
  },
  getUserInfo: function (callback) {
    var _this = this,
      openId = wx.getStorageSync('openId')
    if (openId) {
      wx.getUserInfo({
        success(res) {
          _this.globalData.userInfo = res.userInfo
          callback(res.userInfo)
        }
      })
    } else {
      wx.login({
        success(login) {
          if (login.code) {
            wx.getUserInfo({
              withCredentials: true,
              success(res) {
                // set userInfo
                _this.globalData.userInfo = res.userInfo
                // 获取服务器openId
                wx.request({
                  url: _this.globalData.ajaxUrl + 'wexin/seesion-token-exchange',
                  method: 'post',
                  data: {
                    code: login.code,
                    AppID: _this.globalData.appID,
                    nickName: res.userInfo.nickName,
                    avatarUrl: res.userInfo.avatarUrl,
                    gender: res.userInfo.gender,
                    city: res.userInfo.city,
                    province: res.userInfo.province,
                    country: res.userInfo.country,
                    language: res.userInfo.language
                  },
                  success: function (data) {
                    wx.setStorageSync('openId', data.data.openid);
                    wx.setStorageSync('sessionId', data.data.session_key);
                    callback(res.userInfo)
                  }
                })
              },
              fail: function () {
                wx.showModal({
                  title: '警告通知',
                  content: '您点击了拒绝授权,将无法领取红包,点击确定重新获取授权!!!',
                  success: function (res) {
                    if (res.confirm) {
                      wx.openSetting({   //用户同意打开授权窗口
                        success(res) {
                          if (res.authSetting["scope.userInfo"]) {  //用户同意授权
                            wx.login({
                              success: function (login) {
                                if (login.code) {
                                  wx.getUserInfo({
                                    withCredentials: true,
                                    success(res) {
                                      // set userInfo
                                      _this.globalData.userInfo = res.userInfo
                                      // 获取服务器openId
                                      wx.request({
                                        url: _this.globalData.ajaxUrl + 'wexin/seesion-token-exchange',
                                        method: 'post',
                                        data: {
                                          code: login.code,
                                          AppID: _this.globalData.appID,
                                          nickName: res.userInfo.nickName,
                                          avatarUrl: res.userInfo.avatarUrl,
                                          gender: res.userInfo.gender,
                                          city: res.userInfo.city,
                                          province: res.userInfo.province,
                                          country: res.userInfo.country,
                                          language: res.userInfo.languag
                                        },
                                        success: function (data) {
                                          wx.setStorageSync('openId', data.data.openid);
                                          wx.setStorageSync('sessionId', data.data.session_key);
                                          callback(res.userInfo)
                                        }
                                      })
                                    }
                                  })
                                }
                              }
                            })
                          }else{
                            _this.getUserInfo(callback)
                          }
                        }
                      })
                    }else{
                      _this.getUserInfo(callback)
                    }
                  }
                })
              }
            })
          }
        }
      })
    }
  },
  showModal(){

  },
  globalData: {
    userInfo: null,
    appID: 'wx639e10a0f0143c5e',
    goods_id: '',
    share_id: '',
    userInfo: [],
    ajaxUrl: 'https://api.njskyun.com/',
    imgUrl: 'https://njskyun.com/'
  }
})