/****
 * 2018-1-20 23:09 By chao
 * record.js
 * * */
const app = getApp()
const until = require('../../utils/util')

Page({
  data: {
    tabBar: {
      "color": "#a9b7b7",
      "selectedColor": "#d95940",
      "backgroundColor": "#fff",
      "borderStyle": "#ccc",
      "list": [{  //玩法设置
        "pagePath": "/pages/setting/setting",
        "iconPath": "../../assets/images/game.png",
        "selectedIconPath": "../../assets/images/gamehover.png",
        "text": '我要发包',
        active: false
      }, {  //余额提现
        "pagePath": "/pages/money/money",
        "iconPath": "../../assets/images/money.png",
        "selectedIconPath": "../../assets/images/moneyhover.png",
        "text": '余额提现',
        active: false
      }, {  //我的记录
        "pagePath": "/pages/record/record",
        "iconPath": "../../assets/images/record.png",
        "selectedIconPath": "../../assets/images/recordhover.png",
        "text": '我的记录',
        active: true
      }]
    },
    avatarUrl: '',
    username: '',
    list: [],
    total_number: 0,  //总金额
    total_money: 0,  //总金额
    hidden: false,
    page: 0,  //第几页
    pageSize: 10  //一页多少条
  },
  getList(){
    let _this = this,
        _list = []
    wx.request({
      url: app.globalData.ajaxUrl + 'games-config/index',
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId')
      },
      success: function (data) {
        if (data.data.code == 1001 && data.data.res.length !== 0){
          data.data.res.map(item => {
            _list.push({
              title: item.title,
              money: item.money,
              time: until.formatTime(parseInt(item.create_time)),
              number: item.number,
              surplus_num: item.surplus_num,
              games_config_id: item.games_config_id
            })
          })
          _this.setData({
            list: _list,
            total_money: data.data.total ? data.data.total.total_money : 0,
            total_number: data.data.total ? data.data.total.total_number : 0
          })
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })       
  },
  onLoad(options) {
    let _this = this
    wx.showLoading({
      title: '加载中',
    })
    app.getUserInfo(function (userInfo) {
      _this.getList()
      _this.setData({
        avatarUrl: userInfo.avatarUrl,
        username: userInfo.nickName
      })
    })
  }  
})
