const storage = require('../../utils/storage')

Page({
  data: {
    sleepOptions: ['好', '一般', '差'],
    fatigueOptions: ['低', '中', '高'],
    sleepIndex: 1,
    fatigueIndex: 1,
    form: {
      isEmptyStomach: false,
      sleepQuality: '一般',
      fatigueLevel: '中',
      isMedicated: false,
      isUnwell: false
    }
  },

  onLoad() {
    const bodyStatus = storage.getBodyStatus()
    if (bodyStatus) {
      this.setData({
        form: bodyStatus,
        sleepIndex: getSafeIndex(this.data.sleepOptions, bodyStatus.sleepQuality, 1),
        fatigueIndex: getSafeIndex(this.data.fatigueOptions, bodyStatus.fatigueLevel, 1)
      })
    }
  },

  onEmptyStomachChange(event) {
    this.setData({ 'form.isEmptyStomach': event.detail.value })
  },

  onSleepChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      sleepIndex: index,
      'form.sleepQuality': this.data.sleepOptions[index]
    })
  },

  onFatigueChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      fatigueIndex: index,
      'form.fatigueLevel': this.data.fatigueOptions[index]
    })
  },

  onMedicatedChange(event) {
    this.setData({ 'form.isMedicated': event.detail.value })
  },

  onUnwellChange(event) {
    this.setData({ 'form.isUnwell': event.detail.value })
  },

  save() {
    storage.saveBodyStatus({
      ...this.data.form,
      updatedAt: new Date().toISOString()
    })
    wx.showToast({ title: '已保存', icon: 'success' })
    wx.navigateBack()
  }
})

function getSafeIndex(options, value, fallback) {
  const index = options.indexOf(value)
  return index >= 0 ? index : fallback
}
