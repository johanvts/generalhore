import asyncio
from aiohttp import web

async def handle(request):
    name = request.match_info.get('name', "Anonymous")
    text = "Hello, " + name
    return web.Response(body=text.encode('utf-8'))

async def wshandler(request):
    ws = web.WebSocketResponse()
    ws.start(request)

    while True:
        msg = await ws.receive()

        if msg.tp == web.MsgType.text:
            ws.send_str("Hello, {}".format(msg.data))
        elif msg.tp == web.MsgType.binary:
            ws.send_bytes(msg.data)
        elif msg.tp == web.MsgType.close:
            break

    return ws

async def init(loop):
    app = web.Application(loop=loop)
    app.router.add_route('GET', '/echo', wshandler)
    app.router.add_route('GET', '/{name}', handle)

    srv = await loop.create_server(app.make_handler(),
                                        '127.0.0.1', 80)
    print("Server started at http://127.0.0.1:8080")
    return srv

loop = asyncio.get_event_loop()
loop.run_until_complete(init(loop))
loop.run_forever()

