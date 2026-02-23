import os
import importlib
import traceback
from fastapi import FastAPI
from backend.config.logger import get_dynamic_logger

logger = get_dynamic_logger("router_loader")

def include_routers(app: FastAPI):
    routers_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "routers")

    for filename in os.listdir(routers_dir):
        if filename.endswith(".py") and filename != "__init__.py":
            module_name = filename[:-3]

            try:
                # Import path must be relative to the application root to find submodules correctly
                module = importlib.import_module(f"backend.routers.{module_name}")

                if hasattr(module, "router"):
                    tag = module_name.capitalize()
                    app.include_router(module.router, tags=[tag])
                    logger.info(f"Included router: {module_name} with tag {tag}")
            except Exception as e:
                if os.getenv("TESTING"):
                    raise
                logger.error(f"Failed to load router {module_name}: {e}\n{traceback.format_exc()}")
