data = open('rap.in','r',encoding='utf8').read()
chars = sorted(set(data))
print(chars)
