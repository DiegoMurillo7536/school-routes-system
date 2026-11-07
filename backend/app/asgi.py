from app.database import Database
from app.main import SchoolRouteApi

app = SchoolRouteApi(Database().is_reachable).build()
