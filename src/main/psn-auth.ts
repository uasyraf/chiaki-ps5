import { BrowserWindow } from 'electron'
import { PsnTokens } from './types'
import { readPsnTokens, writePsnTokens } from './chiaki-config'

const PSN_CLIENT_ID = 'ba495a24-818c-472b-b12d-ff231c1b5745'
const PSN_REDIRECT_URI = 'https://remoteplay.dl.playstation.net/remoteplay/redirect'
const PSN_OAUTH_URL = 'https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/authorize'
const PSN_TOKEN_URL = 'https://auth.api.sonyentertainmentnetwork.com/2.0/oauth/token'
const PSN_ACCOUNT_URL = 'https://dms.api.playstation.com/api/v1/devices/accounts/me'

function buildOAuthUrl(): string {
  const params = new URLSearchParams({
    service_entity: 'urn:service-entity:psn',
    response_type: 'code',
    client_id: PSN_CLIENT_ID,
    redirect_uri: PSN_REDIRECT_URI,
    scope: 'psn:clientapp',
    request_locale: 'en_US',
    ui: 'pr',
    service_logo: 'ps',
    layout_type: 'popup',
    smcid: 'remoteplay',
    prompt: 'always',
    PlatformPrivacyWs1: 'minimal',
    no_captcha: 'true',
  })
  return `${PSN_OAUTH_URL}?${params.toString()}`
}

async function exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: PSN_REDIRECT_URI,
    client_id: PSN_CLIENT_ID,
  })

  const response = await fetch(PSN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600,
  }
}

async function fetchAccountId(accessToken: string): Promise<string> {
  const response = await fetch(PSN_ACCOUNT_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Account fetch failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  return data.accountId || data.account_id || ''
}

export async function refreshPsnToken(refreshToken: string): Promise<PsnTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: PSN_CLIENT_ID,
  })

  const response = await fetch(PSN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error(`Token refresh failed (${response.status})`)
  }

  const data = await response.json()
  const expiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString()

  const existing = readPsnTokens()
  const tokens: PsnTokens = {
    accountId: existing?.accountId || '',
    authToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    authTokenExpiry: expiry,
  }

  writePsnTokens(tokens)
  return tokens
}

export function isTokenValid(): boolean {
  const tokens = readPsnTokens()
  if (!tokens || !tokens.authToken || !tokens.authTokenExpiry) return false
  return new Date(tokens.authTokenExpiry) > new Date()
}

export function startPsnOAuth(parentWindow: BrowserWindow): Promise<PsnTokens> {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 480,
      height: 700,
      parent: parentWindow,
      modal: true,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    authWindow.setMenuBarVisibility(false)
    const oauthUrl = buildOAuthUrl()

    authWindow.webContents.on('will-redirect', async (_event, url) => {
      if (!url.startsWith(PSN_REDIRECT_URI)) return

      const parsed = new URL(url)
      const code = parsed.searchParams.get('code')

      if (!code) {
        authWindow.close()
        reject(new Error('No authorization code received'))
        return
      }

      authWindow.close()

      try {
        const tokenData = await exchangeCodeForTokens(code)
        const accountId = await fetchAccountId(tokenData.accessToken)
        const expiry = new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()

        const tokens: PsnTokens = {
          accountId,
          authToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          authTokenExpiry: expiry,
        }

        writePsnTokens(tokens)
        resolve(tokens)
      } catch (err) {
        reject(err)
      }
    })

    authWindow.on('closed', () => {
      reject(new Error('Login window closed'))
    })

    authWindow.once('ready-to-show', () => authWindow.show())
    authWindow.loadURL(oauthUrl)
  })
}
