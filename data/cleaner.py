import html
import re

r = open('rapbattles_all','r').read()
r = html.unescape(r)
r = '\n'.join(l.strip() for l in r.split('\n') if len(l.strip()) >= 40)

print(r)
