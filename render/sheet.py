"""Stitch rendered PNGs into one contact sheet over the site's dark ink,
so candidate orientations can be compared in a single look."""
import struct, zlib, pathlib, sys
def readpng(p):
    d=pathlib.Path(p).read_bytes(); pos=8; w=h=None; idat=b''
    while pos<len(d):
        ln=struct.unpack('>I',d[pos:pos+4])[0]; typ=d[pos+4:pos+8]
        data=d[pos+8:pos+8+ln]
        if typ==b'IHDR': w,h,bd,ct=struct.unpack('>IIBB',data[:10])
        elif typ==b'IDAT': idat+=data
        pos+=12+ln
    raw=zlib.decompress(idat); stride=w*4; out=bytearray(); prev=bytearray(stride); i=0
    for y in range(h):
        f=raw[i]; i+=1; line=bytearray(raw[i:i+stride]); i+=stride
        if f:
            for x in range(stride):
                a=line[x-4] if x>=4 else 0; b=prev[x]; c=prev[x-4] if x>=4 else 0
                if f==1: line[x]=(line[x]+a)&255
                elif f==2: line[x]=(line[x]+b)&255
                elif f==3: line[x]=(line[x]+(a+b)//2)&255
                elif f==4:
                    pp=a+b-c; pa=abs(pp-a); pb=abs(pp-b); pc=abs(pp-c)
                    pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                    line[x]=(line[x]+pr)&255
        out+=line; prev=line
    return w,h,bytes(out)
def writepng(p,w,h,px):
    raw=b''.join(b'\x00'+px[y*w*4:(y+1)*w*4] for y in range(h))
    def ch(t,d):
        return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    pathlib.Path(p).write_bytes(b'\x89PNG\r\n\x1a\n'
        +ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))
        +ch(b'IDAT',zlib.compress(raw,6))+ch(b'IEND',b''))
out=sys.argv[1]; cols=int(sys.argv[2]); files=sys.argv[3:]
ims=[readpng(f) for f in files]
w,h,_=ims[0]; rows=(len(ims)+cols-1)//cols
W,H=w*cols,h*rows
canvas=bytearray(b'\x29\x2d\x39\xff'*(W*H))
for i,(iw,ih,px) in enumerate(ims):
    ox,oy=(i%cols)*w,(i//cols)*h
    for y in range(ih):
        base=(y*iw)*4; drow=((oy+y)*W+ox)*4
        for x in range(iw):
            s=base+x*4; a=px[s+3]
            if not a: continue
            d=drow+x*4
            for k in range(3): canvas[d+k]=(px[s+k]*a+canvas[d+k]*(255-a))//255
            canvas[d+3]=255
writepng(out,W,H,bytes(canvas)); print('sheet:',out,W,'x',H)
