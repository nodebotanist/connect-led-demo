import unicornhathd
import urllib3

unicornhathd.set_pixel(0,0,255,0,0)
unicornhathd.set_pixel(0,1,0,255,0)
unicornhathd.set_pixel(1,0,0,0,255)
unicornhathd.set_pixel(1,1,255,255,255)

unicornhathd.show()

while True:
	unicornhathd.show()