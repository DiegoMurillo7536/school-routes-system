from app.database import database_is_reachable
from app.main import create_app

app = create_app(database_is_reachable)
