from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import List, Dict

# Import routes for hotspots
from routes.hotspotRoutes import router as hotspot_router
from routes.websocket_handlers import router as video_analysis_router

app = FastAPI()

# Enable CORS for frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any domain, or specify the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include hotspot routes
app.include_router(hotspot_router,prefix="/hotspot")
app.include_router(video_analysis_router,prefix="/ws")

@app.on_event("startup")
async def on_start():
    # Code to run when the application starts
    print("The application has started!")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Crime Hotspot API!"}
