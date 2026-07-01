const storage = require('../../utils/storage')

Page({
  data: {
    toleranceOptions: ['低', '中', '高'],
    frequencyOptions: ['很少', '每月几次', '每周 1-2 次', '每周 3 次以上'],
    toleranceIndex: 1,
    frequencyIndex: 1,
    form: {
      toleranceLevel: '中',
      drinkingFrequency: '每月几次',
      sensitiveAlcoholType: '',
      strictMode: true
    }
  },

  onLoad() {
    const profile = storage.getProfile()
    if (profile) {
      this.setData({
        form: profile,
        toleranceIndex: getSafeIndex(this.data.toleranceOptions, profile.toleranceLevel, 1),
        frequencyIndex: getSafeIndex(this.data.frequencyOptions, profile.drinkingFrequency, 1)
      })
    }
  },

  onToleranceChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      toleranceIndex: index,
      'form.toleranceLevel': this.data.toleranceOptions[index]
    })
  },

  onFrequencyChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      frequencyIndex: index,
      'form.drinkingFrequency': this.data.frequencyOptions[index]
    })
  },

  onSensitiveInput(event) {
    this.setData({ 'form.sensitiveAlcoholType': event.detail.value })
  },

  onStrictChange(event) {
    this.setData({ 'form.strictMode': event.detail.value })
  },

  save() {
    storage.saveProfile(this.data.form)
    wx.showToast({ title: '已保存', icon: 'success' })
    wx.navigateBack()
  }
})

function getSafeIndex(options, value, fallback) {
  const index = options.indexOf(value)
  return index >= 0 ? index : fallback
}
