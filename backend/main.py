from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import List, Dict
import asyncio

# from camrtsp.rtsp import camrtsp
# Import routes for hotspots
from routes.hotspotRoutes import router as hotspot_router
from routes.websocket_handlers import router as video_analysis_router
# from routes.websocket_handler_app import router as safe_mode_analysis_router
# from routes.twiliocallRoutes import router as twiliocaller
# from routes.twiliosmsRoutes import router as twiliosms
# from routes.websocket_handler_app import router as safe_mode_analysis_router
# from routes.twiliocallRoutes import router as twiliocaller
# from routes.twiliosmsRoutes import router as twiliosms
# from routes.websocket_handler_app import router as safe_mode_analysis_router
from routes.alertRoutes import router as alertRouter
from routes.cameraRoutes import router as cameraRouter
# from routes.websocket_livelocation import router as liveLocation
# from routes.websocket_hotspotdetection import router as hotspotDetector
from routes.dashboardRoute import router as dashBoardRouter
from routes.gesture_handler import router as gesture_analysis_router

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
# app.include_router(safe_mode_analysis_router,prefix="/ws")
# app.include_router(twiliocaller,prefix="/tw")
# app.include_router(twiliosms,prefix="/tw")
# app.include_router(safe_mode_analysis_router,prefix="/ws")
# app.include_router(twiliocaller,prefix="/tw")
# app.include_router(twiliosms,prefix="/tw")
# app.include_router(safe_mode_analysis_router,prefix="/ws")
app.include_router(alertRouter,prefix="/alerts")
app.include_router(cameraRouter,prefix="/cameras")
# app.include_router(liveLocation, prefix='/ws')
# app.include_router(hotspotDetector, prefix='/ws')
app.include_router(dashBoardRouter, prefix='/dashboard')
app.include_router(gesture_analysis_router,prefix="/gesture")





@app.on_event("startup")
async def on_start():
    # Code to run when the application starts
    print("The application has started!")
    # asyncio.run(camrtsp.main())


@app.get("/")
def read_root():
    return {"message": "Welcome to the Crime Hotspot API!"}
