from fastapi import Request
from fastapi.responses import JSONResponse

from app import create_app

app = create_app()


@app.exception_handler(Exception)
async def global_exception_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "Ocurrió un error inesperado",
        },
    )
