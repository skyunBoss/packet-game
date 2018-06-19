/****
 * 2018-1-20 23:09 By chao
 * money.js
 * * */
const app = getApp()
const Zan = require('../common/component')

Page(Object.assign({}, Zan.TopTips, Zan.Dialog, {
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
        active: true
      }, {  //我的记录
        "pagePath": "/pages/record/record",
        "iconPath": "../../assets/images/record.png",
        "selectedIconPath": "../../assets/images/recordhover.png",
        "text": '我的记录',
        active: false
      }]
    },
    money: '',
    inputVal: ''
  },
  toGame() {
    let param = "" + app.globalData.goods_id + "-" + app.globalData.share_id + "";
    wx.redirectTo({
      url: '../index/index?scene=' + param,
    })
  },  
  getInputVal(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },  
  getAllMoney(){ 
    let _this = this
    if (parseFloat(_this.data.money) > 0){
      _this.setData({
        inputVal: _this.data.money
      })
    } else{
      _this.showZanDialog({
        title: '提示',
        content: '提现金额不能小于0.00元'
      })
    }
  },
  takeMoney(){  //提现
    let _this = this
    if (_this.data.inputVal !== '' && parseFloat(_this.data.inputVal) <= parseFloat(_this.data.money)) {
      if (parseFloat(_this.data.inputVal) < 1){
        _this.showZanDialog({
          title: '提示',
          content: '到账金额不能低于1元'
        })
      } else if (parseFloat(_this.data.inputVal) > 20000){
        _this.showZanDialog({
          title: '提示',
          content: '每人每日每笔提现金额不能超过2W'
        })
      }else{
        wx.request({
          url: app.globalData.ajaxUrl + 'member/tx',
          method: 'POST',
          header: {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          },
          data: {
            'access_token': encodeURIComponent(wx.getStorageSync('sessionId')),
            'AppID': app.globalData.appID,
            'money': _this.data.inputVal
          },
          success: function (data) {
            if(data.data.code == 1001){
              _this.showZanDialog({
                title: '提示',
                content: '提现成功，预计1-2个工作日内到账'
              })
              _this.getMoney()
              _this.setData({
                inputVal: ''
              })
            }else{
              _this.showZanDialog({
                title: '提示',
                content: '提现失败'
              })
            }
          },
          complete: function () {
            wx.hideLoading()
          }
        })  
      }
    } else{
      _this.showZanDialog({
        title: '提示',
        content: '请输入有效提现金额'
      })
    }
  },
  getMoney(){
    let _this = this
    wx.request({
      url: app.globalData.ajaxUrl + 'member/view?id=0&fields=money',
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId')
      },
      success: function (data) {
        if(data.data.money){
          _this.setData({
            money: data.data.money
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
      _this.getMoney()
    })
  },
}))
