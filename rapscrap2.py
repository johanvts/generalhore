import asyncio
import aiohttp
import itertools
import re
import hashlib

def clean_text(text):
    text = text.replace('<br />', '\n')
    text = re.sub('<.*?>', '', text)
    text = re.sub('\n+', '\n', text)
    return text

async def scrape_text(session, url):
    print('scraping', url)
    response = await session.request('GET', url)
    html = await response.read()
    raps = []
    for post in re.findall('id="post_\d+">(.*?)</li>', html.decode('ISO-8859-1')):
        print(post)
        match = re.search('<a class="username .*?><strong>(.*?)</strong></a>', post)
        match2 = re.search('<h2 class="title icon">(.*?)</h2>', post)
        match3 = re.search('<blockquote.*?>(.*?)</blockquote>', post)
        print(match, match2, match3)
        if match and match2 and match3:
            name = match.group(1).strip().lower()
            title = match.group(2).strip().lower()
            if name in title:
                raps.append(clean_text(match.group(3)))
    return raps

# url -> async [text]]
async def scrape_page(session, url):
    response = await session.request('GET', url)
    html = await response.read()
    lyrurls = re.findall('"showthread.php\?(.*?)"', html.decode('ISO-8859-1'))
    lyrurls = [url for url in lyrurls if 'vs' in url or 'v-s' in url]
    lyrurls = ['http://rapbattles.com/showthread.php?' + url for url in lyrurls]
    lyrs = await asyncio.gather(*[scrape_text(session, url) for url in lyrurls[:2]])
    return lyrs

async def login(session):
    response = await session.request('GET', 'http://rapbattles.com')
    html = await response.read()
    html = html.decode('ISO-8859-1')
    match = re.search('name="securitytoken" value="(.*?)" />', html)
    md5 = hashlib.md5()
    md5.update(b'hack4DK')
    data = {
        'vb_login_username': 'Generalen',
        'vb_login_password': '',
        'vb_login_password_hint': 'Password',
        's':'',
        'securitytoken': match.group(1),
        'do': 'login',
        'vb_login_md5password': md5.hexdigest(),
        'vb_login_md5password_utf': md5.hexdigest()
    }
    res2 = await session.post('http://rapbattles.com/login.php', data=data)
    html = await res2.read()
    html = html.decode('ISO-8859-1')
    if 'Generalen' in html:
        print('Login gik godt!')
    else:
        print('Login gik ikke godt')

async def scrape_main(session):
    await login(session)
    url = 'http://rapbattles.com/forumdisplay.php?197-Closed-Battles/page{}&s=&pp=1000000'
    pages = [url.format(i) for i in range(1,2)]
    #pages = [url.format(i) for i in range(1,37)]
    for lyrs in await asyncio.gather(*[scrape_page(session, page) for page in pages]):
        for lyr in lyrs:
            print(lyr)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    session = aiohttp.ClientSession(loop = loop)
    loop.run_until_complete(scrape_main(session))
    #loop.run_until_complete(login(session))
    session.close()
    loop.stop()
    loop.run_forever()
    loop.close()

