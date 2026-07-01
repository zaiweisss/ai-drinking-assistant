const storage = require('../../utils/storage')
const riskUtil = require('../../utils/risk')

Page({
  data: {
    risk: {
      score: 0,
      level: { text: '低风险', className: 'risk-low' },
      totalAlcoholGrams: 0,
      standardDrinks: 0
    },
    advice: {
      summary: '',
      action: '',
      script: ''
    }
  },

  onShow() {
    const profile = storage.getProfile()
    const bodyStatus = storage.getBodyStatus()
    const records = storage.getDrinkRecords()
    const risk = riskUtil.calculateRisk(profile, bodyStatus, records)
    const advice = riskUtil.generateAdvice(risk)

    this.setData({ risk, advice })
  }
})
