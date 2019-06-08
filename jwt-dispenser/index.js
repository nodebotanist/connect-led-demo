const jwt = require('jsonwebtoken')

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * when a request comes in, dispense a jwt signed with an ENV 
 * variable
 * @param {Request} request
 */
async function handleRequest(request) {
  require('dotenv').config()
  let token = jwt.sign({demo: 'connect-color'}, process.env.JWT_SECRET_KEY)
  return new Response(token, { status: 200 })
}
