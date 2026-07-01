const storage = require('../../utils/storage')
const riskUtil = require('../../utils/risk')

Page({
  data: {
    typeOptions: ['啤酒', '红酒', '白酒', '洋酒', '鸡尾酒', '其他'],
    speedOptions: ['慢', '正常', '快'],
    typeIndex: 0,
    speedIndex: 1,
    quickOptions: [
      { name: '啤酒 330ml 4%', alcoholType: '啤酒', volumeMl: 330, abvPercent: 4 },
      { name: '啤酒 500ml 4%', alcoholType: '啤酒', volumeMl: 500, abvPercent: 4 },
      { name: '红酒 150ml 13%', alcoholType: '红酒', volumeMl: 150, abvPercent: 13 },
      { name: '白酒 50ml 42%', alcoholType: '白酒', volumeMl: 50, abvPercent: 42 },
      { name: '白酒 50ml 52%', alcoholType: '白酒', volumeMl: 50, abvPercent: 52 },
      { name: '威士忌 45ml 40%', alcoholType: '洋酒', volumeMl: 45, abvPercent: 40 }
    ],
    form: {
      alcoholType: '啤酒',
      brand: '',
      abvPercent: 4,
      volumeMl: 500,
      quantity: 1,
      drinkingSpeed: '正常'
    },
    previewAlcoholGrams: 15.78
  },

  onLoad() {
    this.updatePreview()
  },

  selectQuick(event) {
    const option = this.data.quickOptions[Number(event.currentTarget.dataset.index)]
    this.setData({
      form: {
        ...this.data.form,
        alcoholType: option.alcoholType,
        volumeMl: option.volumeMl,
        abvPercent: option.abvPercent,
        quantity: 1
      },
      typeIndex: this.data.typeOptions.indexOf(option.alcoholType)
    })
    this.updatePreview()
  },

  onTypeChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      typeIndex: index,
      'form.alcoholType': this.data.typeOptions[index]
    })
  },

  onBrandInput(event) {
    this.setData({ 'form.brand': event.detail.value })
  },

  onAbvInput(event) {
    this.setData({ 'form.abvPercent': event.detail.value })
    this.updatePreview()
  },

  onVolumeInput(event) {
    this.setData({ 'form.volumeMl': event.detail.value })
    this.updatePreview()
  },

  onQuantityInput(event) {
    this.setData({ 'form.quantity': event.detail.value })
    this.updatePreview()
  },

  onSpeedChange(event) {
    const index = Number(event.detail.value)
    this.setData({
      speedIndex: index,
      'form.drinkingSpeed': this.data.speedOptions[index]
    })
  },

  updatePreview() {
    const form = this.data.form
    const alcoholGrams = riskUtil.calculateAlcoholGrams(
      form.volumeMl,
      Number(form.abvPercent) / 100,
      form.quantity
    )

    this.setData({ previewAlcoholGrams: alcoholGrams })
  },

  save() {
    const form = this.data.form
    const abvPercent = Number(form.abvPercent)
    const volumeMl = Number(form.volumeMl)
    const quantity = Number(form.quantity)

    if (!Number.isFinite(abvPercent) || abvPercent <= 0 || abvPercent > 100) {
      wx.showToast({ title: '酒精度需 >0 且 <=100', icon: 'none' })
      return
    }

    if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
      wx.showToast({ title: '容量需大于 0', icon: 'none' })
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      wx.showToast({ title: '数量需大于 0', icon: 'none' })
      return
    }

    const session = storage.ensureActiveSession()
    const alcoholGrams = riskUtil.calculateAlcoholGrams(
      volumeMl,
      abvPercent / 100,
      quantity
    )

    storage.addDrinkRecord({
      sessionId: session.sessionId,
      alcoholType: form.alcoholType,
      brand: form.brand,
      abv: abvPercent / 100,
      volumeMl,
      quantity,
      drinkingSpeed: form.drinkingSpeed,
      finishedAt: new Date().toISOString(),
      alcoholGrams
    })

    wx.showToast({ title: '已记录', icon: 'success' })
    wx.navigateBack()
  }
})
