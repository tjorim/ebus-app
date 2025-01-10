import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

EBUSD_HOST = "192.168.0.92"
EBUSD_PORT = 8889

app = FastAPI(title="eBUSD Interface")


@app.get("/data")
async def get_ebusd_data():
    url = f"http://{EBUSD_HOST}:{EBUSD_PORT}/data"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, timeout=5)
            resp.raise_for_status()
            return resp.json()  # or text if ebusd returns text
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # or ["*"] for testing
    allow_methods=["*"],
    allow_headers=["*"],
)
