/****
 * 2018-1-20 23:09 By chao
 * game.js
 * * */
const app = getApp()
const Zan = require('../common/component')

Page(Object.assign({}, Zan.TopTips, Zan.Dialog,{
  data: {
    activeName: '鼠',
    activeIndex: 0,
    activeType: 1,
    point: '60',
    goods_id: '',
    num: '',
    money: '',
    packetMoney: '',
    title: '',
    list: [],
    buttonName: '生成十二生肖',
    is_status: true,
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
        active: true
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
        active: false
      }]  
    },
    type: [{
      name: '简单',
      point: '30'
    }, {
      name: '一般',
      point: '22'
    }, {
      name: '困难',
      point: '15'
    }, {
      name: '变态',
      point: '10'
    }],
    actionSheetHidden: true,
    actionSheetItems: ['来，比一比谁的手气好', '新年快乐，抢红包啦', '不服来战']    
  },
  toogleType(options){
    const index = options.currentTarget.dataset.index,
      point = options.currentTarget.dataset.point
    this.setData({
      activeType: index,
      point: point
    })  
  },
  toogle(options){
    const index = options.currentTarget.dataset.index,
      name = options.currentTarget.dataset.name,
      id = options.currentTarget.dataset.id
    this.setData({
      activeIndex: index,
      activeName: name,
      goods_id: id
    })
  },
  ruleDialog(){
    this.showZanDialog({
      title: '游戏介绍',
      content: '您可以设置一个生肖，在这个生肖下面填写红包金额，数量，玩家在游戏界面会随机分配红包金额',
      showCancel: false
    })
  },
  toGame(){
    let param = "" + app.globalData.goods_id + "-" + app.globalData.share_id + "";
    wx.redirectTo({
      url: '../index/index?scene=' + param,
    })
  },
  listenerButton() {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  listenerActionSheet() {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },  
  bindItemTap: function (e) {
    this.setData({
      title: e.currentTarget.dataset.title,
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  getMoney(e){
    this.setData({
      packetMoney: parseFloat(e.detail.value),
      money: parseFloat(e.detail.value) + (parseFloat(e.detail.value) * 0.02),
      buttonName: e.detail.value ? '还需支付' + (parseFloat(e.detail.value)+(parseFloat(e.detail.value) * 0.02)) + '元' : '生成十二生肖'
    })
  },
  getNum(e) {
    this.setData({
      num: e.detail.value
    })
  },
  getTitle(e) {
    this.setData({
      title: e.detail.value.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, '')
    })
  },  
  submit() {
    const _this = this
    if (_this.data.title == ''){
      _this.showZanDialog({
        title: '提示',
        content: '请输入游戏标题'
      })
    } else if (_this.data.packetMoney == '' || _this.data.packetMoney == 0) {
      _this.showZanDialog({
        title: '提示',
        content: '请输入有效赏金金额'
      })
    } else if (_this.data.num == ''){
      _this.showZanDialog({
        title: '提示',
        content: '请输入1-' + parseInt(_this.data.packetMoney / 1)+'数量'
      })
    } else if ((_this.data.packetMoney / _this.data.num) < 1){
      _this.showZanDialog({
        title: '提示',
        content: '每人获得的打赏不得低于1元'
      })
    }else{
      wx.showLoading({
        title: '请稍候',
        success: function(){
          _this.setData({
            is_status: false
          })
        }
      })   
      if (_this.data.is_status){   
        wx.request({
          url: app.globalData.ajaxUrl + 'games-config/create',
          method: 'POST',
          header: {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          },
          data: {
            'access_token': encodeURIComponent(wx.getStorageSync('sessionId')),
            'AppID': app.globalData.appID,
            'goods_id': _this.data.goods_id,
            'title': _this.data.title,
            'buy_num': _this.data.num,
            'pay_money': _this.data.money,
            'probability': _this.data.point
          },
          success: function (data) {
            const res = data.data.result
            if (data.data.code == 1001) {
              wx.hideLoading()
              _this.setData({
                is_status: true
              })
              // 调微信支付
              wx.requestPayment({
                'timeStamp': res.timeStamp,
                'nonceStr': res.nonceStr,
                'package': res.package,
                'signType': 'MD5',
                'paySign': res.paySign,
                'success': function () {
                  // 跳转分享页面
                  wx.navigateTo({
                    url: '../code/code?id=' + data.data.games_config_id + '&title=' + _this.data.title
                  })
                },
                'fail': function (res) {
                  _this.showZanDialog({
                    title: '提示',
                    content: '支付失败，请重新支付'
                  })
                }
              })
            } else {
              _this.showZanDialog({
                title: '提示',
                content: data.data.msg
              })
            }
          }
        })
      }
    }  
  },
  getList() {
    const _this = this,
          _list = [],
          index = 12
    wx.request({
      url: app.globalData.ajaxUrl + 'goods/index?pageSize=12&goods_category=20',
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId'),
        'AppID': app.globalData.appID
      },
      success: function (data) {
        if (data.data.length !== '0' && !data.data.msg) {
          data.data.map(item => {
            _list.push({
              goods_id: item.goods_id,
              name: item.goods_name,
              pic: item.cover ? item.cover[0].url : ''
            })
          })
          _this.setData({
            list: _list,
            goods_id: data.data[0].goods_id
          })
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  onLoad() {
    const _this = this
    wx.showLoading({
      title: '加载中',
    })
    app.getUserInfo(function (userInfo) {
      _this.getList()
    })
  }
}))
