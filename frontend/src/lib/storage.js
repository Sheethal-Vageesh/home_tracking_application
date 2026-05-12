// const KEY = 'home-tracking-auth'

// export function loadAuth() {
//   try {
//     const raw = localStorage.getItem(KEY)
//     return raw ? JSON.parse(raw) : null
//   } catch {
//     return null
//   }
// }

// export function saveAuth(value) {
//   localStorage.setItem(KEY, JSON.stringify(value))
// }

// export function clearAuth() {
//   localStorage.removeItem(KEY)
// }

const KEY = 'home-tracking-auth'

export function loadAuth() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAuth(value) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

export function clearAuth() {
  localStorage.removeItem(KEY)
}