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
  // r.get('.*/bar', () => new Response('responding for /bar'))
  // r.get('.*/foo', req => handler(req))

  try {
    let decoded = jwt.verify(userJWT, secrets.JWT_SECRET_KEY)
    // key works, off we go!
    r.get('.*/', (req) => addColor(decoded))
  } catch (err) {
    return new Response(err, {status: 403})
  }

  const resp = await r.route(request)
  return resp
}

async function addColor(decoded) {
  console.log(decoded)
  let userColor, colorType
  if (decoded.color) {
    colorType = 'CSS'
  } else if (decoded.h || decoded.s || decoded.v) {
    colorType = 'HSV'
  } else if (decoded.r || decoded.g || decoded.b) {
    colorType = 'RGB'
  } else {
    console.log(decoded)
    return new Response('Invalid color in JWT ', { status: 400 })
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
  return new Response(userColor.toString(), { status: 200 })
}

