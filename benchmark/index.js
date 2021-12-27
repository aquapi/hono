import Benchmark from 'benchmark'
import { makeEdgeEnv } from 'edge-mock'
import Hono from '../src/hono.js'
import itty from 'itty-router'
const { Router: ItteyRouter } = itty
import { Router as SunderRouter, Sunder } from 'sunder'

makeEdgeEnv()

const hono = Hono()
hono.get('/user', () => new Response('User'))
hono.get('/user/comments', () => new Response('User Comments'))
hono.get('/user/avatar', () => new Response('User Avatar'))
hono.get('/user/lookup/username/:username', () => new Response('User Lookup Username'))
hono.get('/user/lookup/email/:address', () => new Response('User Lookup Email Address'))
hono.get('/event/:id', () => new Response('Event'))
hono.get('/event/:id/comments', () => new Response('Event Comments'))
hono.post('/event/:id/comments', () => new Response('POST Event Comments'))
hono.post('/status', () => new Response('Status'))
hono.get('/very/deeply/nested/route/hello/there', () => new Response('Very Deeply Nested Route'))
//hono.get('/static/*', () => new Response('Static'))
hono.get('/user/lookup/username/:username', (c) => {
  return new Response(`Hello ${c.req.params('username')}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  })
})

const ittyRouter = ItteyRouter()
ittyRouter.get('/user', () => new Response('User'))
ittyRouter.get('/user/comments', () => new Response('User Comments'))
ittyRouter.get('/user/avatar', () => new Response('User Avatar'))
ittyRouter.get('/user/lookup/email/:address', () => new Response('User Lookup Email Address'))
ittyRouter.get('/event/:id', () => new Response('Event'))
ittyRouter.get('/event/:id/comments', () => new Response('Event Comments'))
ittyRouter.post('/event/:id/comments', () => new Response('POST Event Comments'))
ittyRouter.post('/status', () => new Response('Status'))
ittyRouter.get('/very/deeply/nested/route/hello/there', () => new Response('Very Deeply Nested Route'))
//ittyRouter.get('/static/*', () => new Response('Static'))
ittyRouter.get('/user/lookup/username/:username', ({ params }) => {
  return new Response(`Hello ${params.username}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  })
})

const sunderRouter = new SunderRouter()
sunderRouter.get('/user', (response) => {
  response.body('User')
})
sunderRouter.get('/user/comments', (response) => {
  response.body('User Comments')
})
sunderRouter.get('/user/avatar', (response) => {
  response.body('User Avatar')
})
sunderRouter.get('/user/lookup/email/:address', (response) => {
  response.body('User Lookup Email Address')
})
sunderRouter.get('/event/:id', (response) => {
  response.body('Event')
})
sunderRouter.get('/event/:id/comments', (response) => {
  response.body('Event Comments')
})
sunderRouter.post('/event/:id/comments', (response) => {
  response.body('POST Event Comments')
})
sunderRouter.post('/status', (response) => {
  response.body('Status')
})
sunderRouter.get('/very/deeply/nested/route/hello/there', (response) => {
  response.body('Very Deeply Nested Route')
})
//sunderRouter.get('/static/*', () => {})
sunderRouter.get('/user/lookup/username/:username', ({ response, params }) => {
  response.body = `Hello ${params.username}`
})
const sunderApp = new Sunder()
sunderApp.use(sunderRouter.middleware)

// Request Object
const request = new Request('/user/lookup/username/hey', { method: 'GET' })
// FetchEvent Object
const event = new FetchEvent('fetch', { request })

const suite = new Benchmark.Suite()

const fn = async () => {
  let res = await hono.handleEvent(event)
  console.log(await res.text())
  res = await ittyRouter.handle(event.request)
  console.log(await res.text())
  res = await sunderApp.handle(event)
  console.log(await res.text())
}
fn()

suite
  .add('hono', () => {
    hono.handleEvent(event)
  })
  .add('itty-router', () => {
    ittyRouter.handle(event.request)
  })
  .add('sundar', () => {
    sunderApp.handle(event)
  })
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log(`Fastest is ${this.filter('fastest').map('name')}`)
  })
  .run({ async: true })
