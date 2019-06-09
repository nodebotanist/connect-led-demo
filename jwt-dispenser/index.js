const jwt = require("jsonwebtoken");
const secrets = require("./secrets");
const Router = require('./router')

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * when a request comes in, dispense a jwt signed with an ENV
 * variable
 * @param {Request} request
 */

 let r = new Router()

async function handleRequest(request) {
  r.post('.*/', (request) => generateToken(request))

  const resp = await r.route(request)
  return resp
}

async function generateToken(request) {
  let token = jwt.sign({ demo: "connect-color" }, secrets.JWT_SECRET_KEY);
  return new Response(token, {status: 200})
}
