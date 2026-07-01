const STANDARD_DRINK_GRAMS = 14

function calculateAlcoholGrams(volumeMl, abv, quantity) {
  const volume = Number(volumeMl) || 0
  const alcoholByVolume = Number(abv) || 0
  const count = Number(quantity) || 0

  return round(volume * alcoholByVolume * count * 0.789)
}

function calculateStandardDrinks(alcoholGrams) {
  return round((Number(alcoholGrams) || 0) / STANDARD_DRINK_GRAMS)
}

function summarizeDrinks(records) {
  const totalAlcoholGrams = records.reduce((sum, record) => {
    return sum + (Number(record.alcoholGrams) || 0)
  }, 0)

  return {
    totalAlcoholGrams: round(totalAlcoholGrams),
    standardDrinks: calculateStandardDrinks(totalAlcoholGrams),
    count: records.length
  }
}

function calculateRisk(profile, bodyStatus, records) {
  let score = 0
  const reasons = []

  if (bodyStatus?.isEmptyStomach) {
    score += 20
    reasons.push('空腹饮酒')
  }

  if (bodyStatus?.sleepQuality === '差') {
    score += 15
    reasons.push('睡眠状态差')
  }

  if (bodyStatus?.fatigueLevel === '高') {
    score += 15
    reasons.push('疲劳程度高')
  }

  if (bodyStatus?.isMedicated) {
    score += 30
    reasons.push('正在服药')
  }

  if (bodyStatus?.isUnwell) {
    score += 30
    reasons.push('身体不适')
  }

  const recentRecords = getRecentRecords(records, 30)
  if (recentRecords.length > 1) {
    score += 20
    reasons.push('最近 30 分钟连续饮酒')
  }

  if (records.some((record) => record.drinkingSpeed === '快')) {
    score += 15
    reasons.push('饮酒速度偏快')
  }

  const summary = summarizeDrinks(records)
  const toleranceScore = getToleranceScore(profile?.toleranceLevel, summary.standardDrinks)
  if (toleranceScore > 0) {
    score += toleranceScore
    reasons.push('摄入量接近日常承受范围')
  }

  if (profile?.strictMode) {
    score += 10
    reasons.push('严格提醒模式')
  }

  const finalScore = Math.min(score, 100)
  const level = getRiskLevel(finalScore)

  return {
    score: finalScore,
    level,
    reasons,
    totalAlcoholGrams: summary.totalAlcoholGrams,
    standardDrinks: summary.standardDrinks,
    drinkCount: summary.count,
    speed: getSpeedText(records)
  }
}

function generateAdvice(riskResult) {
  const reasons = riskResult.reasons.length ? riskResult.reasons.join('、') : '当前记录较少'

  if (riskResult.level.key === 'danger') {
    return {
      summary: `当前为${riskResult.level.text}，主要原因是${reasons}。`,
      action: '建议立即停止饮酒，不要独处，也不要驾驶或骑行。如有明显不适、呕吐不止、意识模糊，请尽快让身边人协助就医。',
      script: '我今天真的不能再喝了，先停一下，后面我用茶水陪大家。'
    }
  }

  if (riskResult.level.key === 'high') {
    return {
      summary: `当前为${riskResult.level.text}，主要原因是${reasons}。`,
      action: '建议接下来 30-60 分钟暂停饮酒，先喝水并吃一些主食或热菜，今晚不建议继续喝高度酒。',
      script: '我今天状态一般，先缓一轮，后面我用茶水陪大家。'
    }
  }

  if (riskResult.level.key === 'medium') {
    return {
      summary: `当前为${riskResult.level.text}，主要原因是${reasons}。`,
      action: '建议放慢节奏，先喝水，吃点东西，下一杯不要急着跟。',
      script: '我先慢点喝，垫点东西，等会儿再陪大家。'
    }
  }

  return {
    summary: `当前为${riskResult.level.text}，目前没有明显高风险信号。`,
    action: '可以继续观察，但建议控制速度，穿插喝水，不要连续快饮。',
    script: '我先喝点水，慢慢陪大家。'
  }
}

function getRiskLevel(score) {
  if (score >= 81) {
    return { key: 'danger', text: '危险', className: 'risk-danger' }
  }

  if (score >= 61) {
    return { key: 'high', text: '高风险', className: 'risk-high' }
  }

  if (score >= 31) {
    return { key: 'medium', text: '中风险', className: 'risk-medium' }
  }

  return { key: 'low', text: '低风险', className: 'risk-low' }
}

function getToleranceScore(toleranceLevel, standardDrinks) {
  const thresholds = {
    低: 1.5,
    中: 3,
    高: 5
  }
  const threshold = thresholds[toleranceLevel] || thresholds['中']

  if (standardDrinks >= threshold) {
    return 30
  }

  if (standardDrinks >= threshold * 0.7) {
    return 20
  }

  return 0
}

function getRecentRecords(records, minutes) {
  const now = Date.now()
  const range = minutes * 60 * 1000

  return records.filter((record) => {
    const finishedAt = new Date(record.finishedAt).getTime()
    return Number.isFinite(finishedAt) && now - finishedAt <= range
  })
}

function getSpeedText(records) {
  if (!records.length) {
    return '暂无'
  }

  if (records.some((record) => record.drinkingSpeed === '快')) {
    return '偏快'
  }

  return '正常'
}

function round(value) {
  return Math.round(value * 100) / 100
}

module.exports = {
  calculateAlcoholGrams,
  calculateStandardDrinks,
  summarizeDrinks,
  calculateRisk,
  generateAdvice
}
