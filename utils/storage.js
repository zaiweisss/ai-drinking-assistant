const KEYS = {
  profile: 'profile',
  bodyStatus: 'bodyStatus',
  currentSession: 'currentSession',
  drinkRecords: 'drinkRecords'
}

function getProfile() {
  return wx.getStorageSync(KEYS.profile) || null
}

function saveProfile(profile) {
  wx.setStorageSync(KEYS.profile, profile)
}

function getBodyStatus() {
  return wx.getStorageSync(KEYS.bodyStatus) || null
}

function saveBodyStatus(status) {
  wx.setStorageSync(KEYS.bodyStatus, status)
}

function getCurrentSession() {
  return wx.getStorageSync(KEYS.currentSession) || null
}

function getActiveSession() {
  const session = getCurrentSession()
  return session?.status === 'active' ? session : null
}

function saveCurrentSession(session) {
  wx.setStorageSync(KEYS.currentSession, session)
}

function startSession() {
  const session = {
    sessionId: `session_${Date.now()}`,
    startTime: new Date().toISOString(),
    endTime: '',
    status: 'active'
  }

  saveCurrentSession(session)
  wx.setStorageSync(KEYS.drinkRecords, [])
  return session
}

function ensureActiveSession() {
  return getActiveSession() || startSession()
}

function endSession() {
  const session = getCurrentSession()
  if (!session || session.status === 'ended') {
    return null
  }

  const endedSession = {
    ...session,
    endTime: new Date().toISOString(),
    status: 'ended'
  }

  saveCurrentSession(endedSession)
  return endedSession
}

function getDrinkRecords() {
  return wx.getStorageSync(KEYS.drinkRecords) || []
}

function addDrinkRecord(record) {
  const session = ensureActiveSession()
  const records = getDrinkRecords()
  const nextRecords = [
    ...records,
    {
      ...record,
      sessionId: session.sessionId,
      drinkId: `drink_${Date.now()}`
    }
  ]

  wx.setStorageSync(KEYS.drinkRecords, nextRecords)
  return nextRecords
}

module.exports = {
  getProfile,
  saveProfile,
  getBodyStatus,
  saveBodyStatus,
  getCurrentSession,
  getActiveSession,
  saveCurrentSession,
  startSession,
  ensureActiveSession,
  endSession,
  getDrinkRecords,
  addDrinkRecord
}
