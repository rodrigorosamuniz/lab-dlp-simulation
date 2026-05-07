from fastapi import FastAPI

from app.api import router

app = FastAPI(title="Lab DLP Simulation")
app.include_router(router)
