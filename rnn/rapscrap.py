import asyncio
import aiohttp
import itertools
import re

def clean_text(text):
    text = text.replace('<br />', '\n')
    text = re.sub('<.*?>', '', text)
    text = re.sub('\n+', '\n', text)
    return text

async def scrape_text(url):
    response = await aiohttp.request('GET', url)
    html = await response.read()
    match = re.search('<div class="lyric">(.*?)</div>', html.decode('utf-8'))
    if not match:
        return ''
    return clean_text(match.group(1))

# url -> async [text]]
async def scrape_page(url):
    response = await aiohttp.request('GET', url)
    html = await response.read()
    lyrurls = re.findall('"(/lyrics/[^/"]+/[^/"]+)"', html.decode('utf-8'))
    lyrs = await asyncio.gather(*[scrape_text('http://raptekster.dk'+lyrurl) for lyrurl in lyrurls])
    return lyrs

async def scrape_main():
    pages = ['http://raptekster.dk/find?s=&page={}'.format(i) for i in range(40,42)]
    for lyrs in await asyncio.gather(*[scrape_page(page) for page in pages]):
        for lyr in lyrs:
            print('---')
            print(lyr)

async def test(url):
    response = await aiohttp.request('GET', 'http://raptekster.dk')
    raw_html = await response.read()
    print(raw_html)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(scrape_main())
    loop.stop()
    loop.run_forever()
    loop.close()

