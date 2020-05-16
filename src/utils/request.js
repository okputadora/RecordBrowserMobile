import axios from 'axios'

const instance = axios.create()

const errorHandler = (error) => {
  const { response } = error
  if (response) {
    const { data } = response
    const responseError = new Error(getMessage('errors.default'))
    if (response.status < 500) responseError.message = data.error ? data.error.message || data.error : data.message
    responseError.status = response.status
    return Promise.reject(responseError)
  }

  return Promise.reject(error)
}

instance.interceptors.response.use(response => response, error => errorHandler(error))

export default async ({ authenticated = true, multiAccount = false, ...rest }) => {
  const authorization = { Authorization: `OAuth ${(await getOauthToken())}` }
  const accountId = await getAccountId()

  const defaults = {
    method: 'GET',
    baseURL: config.dugeApiUrl,
    headers: {
      ...authenticated ? authorization : {},
      ...multiAccount && accountId ? { 'x-neat-account-id': accountId } : {},
      Pragma: 'no-cache',
      Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
      'Cache-Control': 'no-cache',
    },
  }

  return instance({ ...defaults, ...rest })
}