import base64
import tempfile

from typing import Any, Generator, Type
from ravendb import DocumentStore, DocumentSession
from ravendb.documents.conventions import DocumentConventions

from api.core.settings import settings
from api.core.decorators import singleton
from api.core.utils import convert_pfx_to_pem

@singleton
class RavenStore(DocumentStore):

    def __init__(self):
        def _custom_find_collection_name(object_type: Type) -> str:
            from api.modules.property.model import Property
            
            if issubclass(object_type, Property):
                return "Properties"
            return DocumentConventions.default_get_collection_name(object_type)

        super().__init__([settings.dbserver_url], settings.dbserver_database)

        pfx_base64 = settings.dbserver_cert_base64
        pfx_bytes = base64.b64decode(pfx_base64)
        pem_data = convert_pfx_to_pem(pfx_bytes)
        temp_cert_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
        temp_cert_file.write(pem_data.encode())
        temp_cert_file.close()

        self.certificate_pem_path = temp_cert_file.name

        self.conventions.identity_parts_separator = "-"
        self.conventions.find_collection_name = _custom_find_collection_name
        self.initialize()


def get_session() -> Generator[DocumentSession, Any, Any]:
    with RavenStore().open_session() as session:
        try:
            yield session
        except Exception as e:
            session.close()
            raise e
        finally:
            session.save_changes()


def get_session_read_only() -> Generator[DocumentSession, Any, Any]:
    with RavenStore().open_session() as session:
        try:
            yield session
        except Exception as e:
            session.close()
            raise e
