import json, sys
def first_json(s):
    # bỏ mọi junk trước '{' đầu tiên, rồi raw_decode
    i = s.find('{"id"')
    if i < 0: i = s.find('{')
    obj, end = json.JSONDecoder().raw_decode(s[i:])
    return obj, i, end
if __name__ == '__main__':
    raw = open(sys.argv[1], encoding='utf-8', errors='replace').read()
    obj, i, end = first_json(raw)
    msg = obj['choices'][0]['message']
    print('finish', obj['choices'][0].get('finish_reason'))
    print('json obj span', i, end, 'filelen', len(raw))
    print('trailing', repr(raw[i+end:i+end+40]))
    c = msg.get('content','')
    print('content len', len(c))
    print(c[:1200])
