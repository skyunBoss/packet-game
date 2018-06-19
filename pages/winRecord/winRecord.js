/****
 * 2018-1-20 23:09 By chao
 * winRecord.js
 * * */
const app = getApp()

Page({
  data: {
    list: []
  },
  getList(options) {
    let _this = this,
      _list = []
    wx.request({
      url: app.globalData.ajaxUrl + 'games-luck-record/index?games_config_id=' + options.id || 30,
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId')
        // 'pageSize': 20,
        // 'page': 1
      },
      success: function (data) {
        if(data.data.code == 1001){
          data.data.res.map(item => {
            _list.push({
              avatarUrl: item.wx_avatarUrl,
              username: item.wx_nickName,
              money: item.money,
              time: _this.formatTime(parseInt(item.create_time))
            })
          })
          _this.setData({
            list: _list
          })
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  }, 
  formatTime(date){
    date = new Date(date * 1000)

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return month + '月' + day + '日' + ' ' + hour + ':' + minute    
  }, 
  onLoad(options){
    let _this = this
    wx.showLoading({
      title: '加载中',
    })
    app.getUserInfo(function (userInfo) {
      _this.getList(options)
    })    
  }
})