import pytest
from ravendb_embedded import EmbeddedServer, ServerOptions, CopyServerProvider

from api.core.database.dependency import get_session, get_session_read_only

@pytest.fixture(scope="session")
def embedded_server():
    """Start RavenDB Embedded Server."""
    server_options = ServerOptions()
    server_options.provider = CopyServerProvider(".venv/lib/python3.13/site-packages/ravendb_embedded/target/nuget/contentFiles/any/any/RavenDBServer")
    server = EmbeddedServer()
    server.start_server(server_options)
    yield server
    server.close()

@pytest.fixture(scope="session")
def test_store(embedded_server):
    """Create a new RavenDB test store."""
    with embedded_server.get_document_store("TestDB") as store:
        store.conventions.identity_parts_separator = "-"
        yield store
        store.close()

@pytest.fixture(scope="function")
def test_session(test_store):
    """Create a test session per function, rolling back after each test."""
    with test_store.open_session() as session:
        yield session
        session.close()


@pytest.fixture(scope="function", autouse=True)
def override_deps(test_session):
    """Override FastAPI `get_session` dependencies."""
    def get_session_override():
        yield test_session

    def get_session_read_only_override():
        yield test_session

    from api.__main__ import app

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_session_read_only] = get_session_read_only_override
    
    yield

    app.dependency_overrides.clear()
