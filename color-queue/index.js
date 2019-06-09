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
    r.get('.*/', (req) => addColor(decoded))
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
  let colorQueue = await COLOR_QUEUE.get('queue')
  colorQueue = JSON.parse(colorQueue)
  if(!colorQueue) colorQueue = []
  colorQueue.push(userColor.toString())
  await COLOR_QUEUE.put('queue', JSON.stringify(colorQueue))
  return new Response(userColor.toString(), { status: 200 })
}

async function getColors() {
  let colors = await COLOR_QUEUE.get('queue')
  await COLOR_QUEUE.put('queue', '[]')
  return new Response(colors, {status: 200})
}