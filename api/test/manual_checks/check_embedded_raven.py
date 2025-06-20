import logging
import traceback
from ravendb_embedded import EmbeddedServer, ServerOptions, CopyServerProvider

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

try:
    server = EmbeddedServer()
    options = ServerOptions()
    options.provider = CopyServerProvider(".venv/lib/python3.13/site-packages/ravendb_embedded/target/nuget/contentFiles/any/any/RavenDBServer")
    server.start_server(options)
    logger.info("Embedded server started successfully.")
except RuntimeError as e:
    logger.error("Failed to start EmbeddedServer: %s", str(e))
    traceback.print_exc()
    raise
