import asyncio
import websockets

async def stream_handler(websocket, path):
    from urllib.parse import urlparse, parse_qs
    print(path)
    query = urlparse(path).query
    params = parse_qs(query)
    rtsp_url = params.get("url", [None])[0]  # Default to None if not provided

    if not rtsp_url:
        await websocket.close(reason="RTSP URL not provided")
        return

    command = [
        "ffmpeg",
        "-i", rtsp_url,
        "-f", "mpegts",
        "-codec:v", "mpeg1video",
        "-r", "30",
        "-s", "640x480",
        "-b:v", "1000k",
        "pipe:1",
    ]

    process = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.DEVNULL
    )

    try:
        while True:
            data = await process.stdout.read(1024)
            if not data:
                break

            await websocket.send(data)
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")
    finally:
        process.terminate()
        await process.wait()


async def main():
    server = await websockets.serve(stream_handler, "localhost", 9999)
    print("WebSocket server started on ws://localhost:9999")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
