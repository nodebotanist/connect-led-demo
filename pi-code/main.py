import unicornhathd
import urllib3
import time
import json

urllib3.disable_warnings()
http = urllib3.PoolManager()

internalBuffer = []

while True:
	r = http.request('GET', 'http://color-queue.kas.workers.dev/get-colors', headers={'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xvciI6ImJsdWUifQ.IYQvIrX4Igk8zogYwIinHxJmDva213hrUUn0tBTjdhM', 'Accept': '*/*'})
	data = json.loads(r.data.decode('utf-8'))
	for color in data:
		internalBuffer.insert(0, color['color'])
	if len(internalBuffer) >= 255: internalBuffer = internalBuffer[0-255]
	x = 0
	y = 0
	index = 0
	for color in internalBuffer:
		unicornhathd.set_pixel(x, y, internalBuffer[index][0],  internalBuffer[index][1],  internalBuffer[index][2])
		x += 1
		index +=1
		if x > 15: 
			x = 0
			y += 1
	unicornhathd.show()
	time.sleep(5)