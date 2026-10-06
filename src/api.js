import axios from 'axios'

const api = axios.create({ baseURL: 'https://route-posts.routemisr.com' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const FIELDS = { password: 'Password', rePassword: 'Confirm password', email: 'Email', name: 'Name', username: 'Username' }


const friendly = (msg) => {
  if (/incorrect email or password/i.test(msg)) return 'Invalid username or password'
  if (/^user already exists/i.test(msg)) return 'This email is already registered.'
  if (/^username already exists/i.test(msg)) return 'This username is already taken.'
  const m = msg.match(/^"(\w+)" with value .* fails to match/)
  if (m) {
    if (m[1] === 'password' || m[1] === 'newPassword') return 'Password needs 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol (e.g. !@#$).'
    return `${FIELDS[m[1]] || 'This field'} is not in a valid format.`
  }
  return msg.replace(/"(\w+)"/g, (_, f) => FIELDS[f] || f)
}

export const errMsg = (e) =>
  friendly(e.response?.data?.message || e.message || 'Something went wrong')

export default api
