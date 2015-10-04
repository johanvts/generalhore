import asyncio
from aiohttp import web
import subprocess

CV = '/home/generalen/char-rnn/cv/lm_lstm_epoch7.63_1.5315.t7'
CWD = '/home/generalen/char-rnn/'
TORCH = '/home/generalen/torch/install/bin/th'
SAMPLE = '/home/generalen/char-rnn/sample.lua'
TEMP = '0.8'
#th sample.lua cv/lm_rap_stor_rigtig_epoch0.36_1.5111.t7 -gpuid -1 -temperature 0.8 -primetext "En mand der går " -length 250 -verbose 0

def get_rap(seed, length):
    args = [TORCH, SAMPLE, CV, '-gpuid', '-1',
            '-temperature', '0.8',
            '-primetext', seed,
            '-length', str(length),
            '-verbose', '0']
    sp = subprocess.Popen(args, stdout=subprocess.PIPE, cwd=CWD)
    so, se = sp.communicate()
    code = sp.wait()
    print('Return code', code)
    print('Stdout', so)

def json_format(rap):
    rap.split('\n')

async def handle(request):
    name = ''.join(request.GET['seed'])
    text = "Fucking, " + name
    return web.Response(body=text.encode('utf-8'))

async def init(loop, add, port):
    app = web.Application(loop=loop)
    app.router.add_route('GET', '/', handle)
    srv = await loop.create_server(app.make_handler(), add, port) 
    print("Server started at {}:{}".format(add, port))
    return srv

import sys
if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(init(loop, sys.argv[1], sys.argv[2]))
    loop.run_forever()

