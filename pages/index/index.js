/****
 * 2018-1-20 23:09 By chao
 * game.js
 * * */
const app = getApp()

Page({
  data: {
    btnTouchBg: '//24haowan-cdn.shanyougame.com/dingzhi/grid-lottery/btn-start.png',
    idx: '',  //滚动到哪个位置
    len: 12,  //宫格个数
    ret: 12,  //抽奖结果对应值1～12
    speed: 100,  //速度值
    isStart: false,  //事件是否在执行
    index: -1,  //当前转动到哪个位置，起点位置
    count: 12,  //总共有多少个位置
    speed: 20,  //初始转动速度
    times: 0,  //转动次数
    timer: '',
    cycle: 50,  //转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1,  //中奖位置
    newPrize: -1,
    money: 0,  //中奖金额
    ruleContext: false,  //活动规则
    successDialog: false,  //中奖成功弹窗
    errorDialog: false,  //中奖失败弹窗
    noneDialog: false,  //红包已领完
    shareDialog: false,  //已经领过，没有机会
    status: false,  //是否抽中
    moneyLocation: -1,  //红包位置
    list: [],
    id: '',
    share_id: '',  // 分享人id
    title: '',
    centerbg: '../../assets/images/game-center.png',
    balance: 0.00  //红包余额
  },
  roll(){
    let index = this.data.index
    let count = this.data.count
    index += 1
    if (index > count - 1) {
      index = 0
    }
    this.setData({
      index: index
    })
    return false
  },
  init(){ //初始化
    let _this = this
    let timer = ''
    _this.setData({
      times: _this.data.times += 1,
      prize: _this.data.newPrize
    })
    _this.roll() //转动过程调用的是lottery的roll方法，这里是第一次调用初始化
    // _this.run.pause()
    // _this.run.play()
    if (_this.data.times > _this.data.cycle + 10 && _this.data.prize == _this.data.index) {
      clearTimeout(_this.data.timer)
      setTimeout(function(){
        if (!_this.data.status) {
          _this.audioBg.pause()
          _this.audiofail.play()
        }
        _this.setData({
          prize: -1,
          times: 0,
          isStart: false,
          successDialog: _this.data.status ? true : false,
          errorDialog: !_this.data.status ? true : false,
          speed: 20
        })
        if(_this.data.status){
          _this.getBalance()
        }
      },500)
    } else {
      if (_this.data.times < _this.data.cycle) {
        _this.setData({
          speed: _this.data.speed -= 10
        })
      } else if (_this.data.times == _this.data.cycle) {
        let index = Math.random() * (_this.data.count)|0
        _this.setData({
          prize: index
        })
      } else {
        if (_this.data.times > _this.data.cycle + 10 && ((_this.data.prize == 0 && _this.data.index == 7) || _this.data.prize == _this.data.index + 1)) {
          _this.setData({
            speed: _this.data.speed += 110
          })
        } else {
          _this.setData({
            speed: _this.data.speed += 20
          })
        }
      }
      if (_this.data.speed < 40) {
        _this.setData({
          speed: 40
        })
      }
      // _this.run.pause()
      _this.setData({
        timer: setTimeout(_this.init, _this.data.speed) //循环调用
      })
    }
    return false 
  },
  closeDialog(type){  //关闭弹窗
    type = type.currentTarget.dataset.type
    let _this = this
    switch (type){
      case 'success':
        _this.setData({
          successDialog: false
        })
        break ;
      case 'fail':
        _this.setData({
          errorDialog: false
        }) 
        this.audiofail.pause()
        this.audioBg.play()        
        break; 
      case 'none':
        _this.setData({
          noneDialog: false,
          isStart: false
        })
        break;  
      case 'share':
        _this.setData({
          shareDialog: false,
          isStart: false
        })
        break;    
      case 'rule': 
        _this.setData({
          ruleContext: false
        })
        break;   
    }
  },
  takeMoney(){  //分享
    wx.navigateTo({
      url: '../code/code?id=' + this.data.id+'&title='+this.data.title
    })
    this.audioBg.pause()
  },
  cashMoney(){  //提现
    wx.navigateTo({
      url: '../money/money'
    })
    this.audioBg.pause()
  },
  openRule(){  //open rule pop
    let _this = this
    _this.setData({
      ruleContext: _this.data.ruleContext ? false : true
    })
  },
  getBalance(){  //获取红包金额
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
        if (data.data.money) {
          _this.setData({
            balance: data.data.money
          })
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })  
  },
  winRecord(){  //查看中奖名单
    wx.navigateTo({
      url: '../winRecord/winRecord?id=' + this.data.id
    })
    this.audioBg.pause()
  },
  onceMore(){  //再来一次
    this.setData({
      errorDialog: false
    })
    this.audiofail.pause()
    this.audioBg.play()
  },
  nonePacket(){  //发红包
    wx.navigateTo({
      url: '../setting/setting'
    })
    this.audioBg.pause()
  },
  touchStart(){  
    let _this = this
    if (!_this.data.isStart && app.globalData.userInfo['nickName']){
      _this.setData({
        btnTouchBg: '//24haowan-cdn.shanyougame.com/dingzhi/grid-lottery/btn-start-active.png',
        isStart: true
      })
      if (_this.data.id !== ''){
        // _this.init()
        wx.request({
          url: app.globalData.ajaxUrl + 'games-luck-record/luck-draw?games_config_id=' + _this.data.id,
          method: 'POST',
          header: {
            "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
          },
          data: {
            'access_token': encodeURIComponent(wx.getStorageSync('sessionId')),
            'AppID': app.globalData.appID,
            'share_id': _this.data.share_id
          },
          success: function (data) {
            if(data.data.code == 1008){  //success
              _this.data.list.map((item, index) => {
                if (data.data.goods_id == item.goods_id) {
                  _this.setData({
                    money: data.data.money,
                    newPrize: index,
                    status: true,
                    title: data.data.title
                  })
                }  
              })
              _this.init()
            } else if (data.data.code == 1006){  //fail
              _this.data.list.map((item,index) => {
                if (data.data.goods_id == item.goods_id){
                  _this.setData({
                    newPrize: _this.numParseInt(index),
                    status: false,
                    title: data.data.title
                  })
                  _this.init()
                }
              })
            } else if (data.data.code == 3004){  //已经领过奖。没有机会
              _this.setData({
                shareDialog: true,
                title: data.data.title
              })
            } else{
              _this.setData({
                noneDialog: true
              })
            }
          }
        }) 
        return false   
      }else{
        _this.setData({
          noneDialog: true
        })
      }    
    }else{
      return false
    }
  },
  numParseInt(index){
    let i = parseInt(index - parseInt(Math.random() * 11 + 1))
    return i < 0 ? i + 12 : i
    // if (i == index) {
    //   if (i == 0) {
    //     return parseInt(Math.random() * (index + 1))
    //   } else {
    //     return parseInt(Math.random() * (index - 1))
    //   }
    // } else {
    //   return i
    // }
  },
  touchEnd(){
    this.setData({
      btnTouchBg: '//24haowan-cdn.shanyougame.com/dingzhi/grid-lottery/btn-start.png'
    })    
  },
  reset(){
    this.setData({
      idx: '',
      isStart: false
    }) 
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
          data.data.map((item,index) => {
            _list.push({
              goods_id: item.goods_id,
              name: item.goods_name,
              pic: item.cover ? item.cover[0].url : ''
            })
          })
          _this.setData({
            list: _list
          })
          _this.getMoneyLocation()
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },  
  getMoneyLocation(){  //获取红包位置
    let _this = this  
    wx.request({
      url: app.globalData.ajaxUrl + 'games-config/view?id=' + _this.data.id,
      method: 'POST',
      header: {
        "Content-type": "application/x-www-form-urlencoded; charset=utf-8"
      },
      data: {
        'access_token': wx.getStorageSync('sessionId'),
        'AppID': app.globalData.appID
      },
      success: function (data) {
        if (data.data['goods_id']) {
          _this.data.list.map((item, index) => {
            if (data.data['goods_id'] == item.goods_id) {
              _this.setData({
                moneyLocation: index
              })
            }
          })
        }
      }
    })      
  },
  onLoad(options){
    let _this = this,
      scene = decodeURIComponent(options.scene)
    wx.showLoading({
      title: '加载中',
    })
    _this.setData({
      id: scene !== 'undefined' ? scene.split('-')[0] : 57,
      share_id: scene !== 'undefined' ? scene.split('-')[1] : 0
    })
    app.globalData.goods_id = scene !== 'undefined' ? scene.split('-')[0] : 57
    app.globalData.share_id = scene !== 'undefined' ? scene.split('-')[1] : 0
    app.getUserInfo(function (userInfo) {
      _this.getList()
      _this.getBalance()
    })
  },
  onShow(){
    let _this = this,
      center_bg = '../../assets/images/game-center.png',
      center_bg_hover = '../../assets/images/game-center-hover.png'
    _this.audioBg = wx.createAudioContext('audioBg')
    _this.audiofail = wx.createAudioContext('fail')
    _this.run = wx.createAudioContext('run')
    _this.audiofail.pause()
    _this.audioBg.play()
    setInterval(function(){
      if (_this.data.centerbg == center_bg){
        _this.setData({
          centerbg: center_bg_hover
        })
      }else{
        _this.setData({
          centerbg: center_bg
        })        
      }
    },500)
  }
})