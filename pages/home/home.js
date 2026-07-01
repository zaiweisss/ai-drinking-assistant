const storage = require('../../utils/storage')
const riskUtil = require('../../utils/risk')

Page({
  data: {
    risk: {
      score: 0,
      level: { text: '低风险', className: 'risk-low' },
      totalAlcoholGrams: 0,
      standardDrinks: 0,
      drinkCount: 0,
      speed: '暂无'
    },
    advice: {
      action: '先填写身体状态，再记录今晚喝了什么。'
    },
    sessionStatusText: '未开始',
    sessionSummaryText: '开始酒局后，系统会按本场记录计算纯酒精、标准杯和风险。',
    sessionButtonText: '开始今晚酒局'
  },

  onShow() {
    this.refresh()
  },

  refresh() {
    const profile = storage.getProfile()
    const bodyStatus = storage.getBodyStatus()
    const records = storage.getDrinkRecords()
    const session = storage.getCurrentSession()
    const risk = riskUtil.calculateRisk(profile, bodyStatus, records)
    const advice = riskUtil.generateAdvice(risk)

    this.setData({
      risk,
      advice,
      sessionStatusText: this.getSessionStatusText(session),
      sessionSummaryText: this.getSessionSummaryText(session, records.length),
      sessionButtonText: session?.status === 'active' ? '结束本场酒局' : '开始今晚酒局'
    })
  },

  goAddDrink() {
    this.ensureSession()
    wx.navigateTo({ url: '/pages/add-drink/add-drink' })
  },

  goStatus() {
    this.ensureSession()
    wx.navigateTo({ url: '/pages/status/status' })
  },

  goAdvice() {
    wx.navigateTo({ url: '/pages/advice/advice' })
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  handleSession() {
    const session = storage.getCurrentSession()

    if (session?.status === 'active') {
      storage.endSession()
      wx.showToast({ title: '已结束酒局', icon: 'success' })
    } else {
      storage.startSession()
      wx.showToast({ title: '已开始酒局', icon: 'success' })
    }

    this.refresh()
  },

  ensureSession() {
    storage.ensureActiveSession()
  },

  getSessionStatusText(session) {
    if (!session) {
      return '未开始'
    }

    return session.status === 'active' ? '进行中' : '已结束'
  },

  getSessionSummaryText(session, recordCount) {
    if (!session) {
      return '当前没有进行中的酒局。开始后，风险只按本场饮酒记录和身体状态计算。'
    }

    if (session.status === 'active') {
      return `本场已记录 ${recordCount} 次饮酒。风险根据身体状态、纯酒精摄入、饮酒速度和连续饮酒情况计算。`
    }

    return `上一场酒局已结束，共记录 ${recordCount} 次饮酒。再次记一杯会自动开启新酒局并重新计算。`
  }
})
