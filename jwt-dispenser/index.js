const jwt = require("jsonwebtoken");
const secrets = require("./secrets");
const Router = require("./router");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * when a request comes in, dispense a jwt signed with an ENV
 * variable
 * @param {Request} request
 */

let r = new Router();

async function handleRequest(request) {
  r.post(".*/", request => generateToken(request));

  const resp = await r.route(request);
  return resp;
}

async function generateToken(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("invalid JSON in request body", { status: 400 });
  }
  if (
    !body.color &&
    ((!body.r && !body.r === 0) ||
      (!body.g && !body.g === 0) ||
      (!body.b && !body.b === 0)) &&
    ((!body.h && !body.h === 0) ||
      (!body.s && !body.s === 0) ||
      (!body.v && !body.v === 0))
  ) {
    return new Response("No valid color in payload", { status: 400 });
  }
  let token = jwt.sign(body, secrets.JWT_SECRET_KEY);
  console.log(token)
  return new Response(token, { status: 200 });
}
