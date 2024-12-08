import os
from supabase import create_client, Client

url: str = "https://wrtbmccxokuzvqtulctr.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydGJtY2N4b2t1enZxdHVsY3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MTgyMDAsImV4cCI6MjA0OTA5NDIwMH0.A_cXLnsbiMh-U5VGRko3DEdHpVe1oOp4naX4On7209w"

supabase: Client = create_client(url, key)

