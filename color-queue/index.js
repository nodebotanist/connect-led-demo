const jwt = require('jsonwebtoken')
const color = require('color')

const secrets = require('./secrets.js')
const Router = require('./router')

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  let userJWT = request.headers.get('Authorization')
  if(!userJWT) {
    return new Response('Need a JWT in your Authorization header', {status: 403})
  }
  userJWT = userJWT.replace(/^Bearer /, '')

  const r = new Router()

  try {
    let decoded = jwt.verify(userJWT, secrets.JWT_SECRET_KEY)
    // key works, off we go!
    r.post('.*/', (req) => addColor(decoded))
    r.get('.*/get-colors', (req) => getColors(decoded))
  } catch (err) {
    return new Response(err, {status: 403})
  }

  const resp = await r.route(request)
  return resp
}

async function addColor(decoded) {
  let userColor, colorType
  if (decoded.color) {
    colorType = 'CSS'
  } else if (decoded.h || decoded.s || decoded.v) {
    colorType = 'HSV'
  } else if (decoded.r || decoded.g || decoded.b) {
    colorType = 'RGB'
  } else {
    return new Response('Invalid color in JWT:' + JSON.stringify(decoded), { status: 400 })
  }
  try {
    switch (colorType) {
      case 'CSS':
        userColor = color(decoded.color)
        break
      case 'HSV':
        userColor = color({ h: decoded.h, s: decoded.s, v: decoded.v })
        break
      case 'RGB':
        userColor = color({ r: decoded.r, g: decoded.g, b: decoded.b })
    }
  } catch (err) {
    return new Response('Inwalid color: ' + err, { status: 400 })
  }

  await fetch(`https://api.keyvalue.xyz/${secrets.KV_KEY}/myKey`).then(async function(response) {
    await response.json().then(async function (resp) {
      console.log('resp', resp)
      if(!resp) resp = []
      resp.push(userColor.rgb())
      await fetch(`https://api.keyvalue.xyz/${secrets.KV_KEY}/myKey/${JSON.stringify(resp)}`, { method: 'POST'})
    })
  })
  return new Response('Color added', { status: 200 })
}

async function getColors() {
  let result
  await fetch(`https://api.keyvalue.xyz/${secrets.KV_KEY}/myKey`).then((resp) => result = resp.json().then((res) => result = JSON.stringify(res)))
  await fetch(`https://api.keyvalue.xyz/${secrets.KV_KEY}/myKey/${JSON.stringify([])}`, { method: 'POST'})
  return new Response(result, {status: 200})
}