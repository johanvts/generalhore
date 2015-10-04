import asyncio
import aiohttp
import itertools
import re
import hashlib

sem = asyncio.Semaphore(10)

def clean_text(text):
    text = text.replace('<br />', '\n')
    text = re.sub('<.*?>', '', text)
    text = text.replace('\r', '\n')
    text = re.sub('\n+', '\n', text)
    text = text.strip()
    return text

async def scrape_text(session, url):
    #print('scraping', url)
    with (await sem):
        response = await session.request('GET', url)
    html = await response.read()
    raps = []
    #for post in re.findall('id="post_\d+">(.*?)</li>', html.decode('ISO-8859-1'), flags=re.DOTALL):
    for post in html.decode('ISO-8859-1').split('<!-- END TEMPLATE: postbit_legacy -->'):
        match = re.search('<a class="username .*?><strong>(.*?)</strong></a>', post)
        match2 = re.search('<h2 class="title icon">(.*?)</h2>', post, flags=re.DOTALL)
        match3 = re.search('<blockquote.*?>(.*?)</blockquote>', post, flags=re.DOTALL)
        if match and match2 and match3:
            name = match.group(1).strip().lower()
            title = match2.group(1).strip().lower()
            if name in title:
                cleaned = clean_text(match3.group(1))
                if len(cleaned) > 30:
                    raps.append(cleaned)
    return raps

async def scrape_page(session, url):
    with (await sem):
        response = await session.request('GET', url)
    html = await response.read()
    lyrurls = re.findall('class="title" href="showthread.php\?(.*?)"', html.decode('ISO-8859-1'))
    lyrurls = [url for url in lyrurls if 'vs' in url or 'v-s' in url]
    lyrurls = ['http://rapbattles.com/showthread.php?' + url for url in lyrurls]
    lyrs = await asyncio.gather(*[scrape_text(session, url) for url in lyrurls])
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
    pages = [url.format(i) for i in range(35,37)]
    for lyrs in await asyncio.gather(*[scrape_page(session, page) for page in pages]):
        for lyr in lyrs:
            for l in lyr:
                print(l)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    session = aiohttp.ClientSession(loop = loop)
    loop.run_until_complete(scrape_main(session))
    #loop.run_until_complete(login(session))
    session.close()
    loop.stop()
    loop.run_forever()
    loop.close()

