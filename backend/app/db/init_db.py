from sqlalchemy import text
from app.db.session import engine, Base

def init_db():
    # Enable pgvector extension
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    
    # Create tables
    import app.models.core  # Import to register models with Base
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialized.")
