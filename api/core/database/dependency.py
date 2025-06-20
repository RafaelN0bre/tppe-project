from fastapi import Depends
from typing import Annotated
from ravendb import DocumentSession

from .model import get_session, get_session_read_only

SessionDep = Annotated[DocumentSession, Depends(get_session)]
SessionDepNonPersist = Annotated[DocumentSession, Depends(get_session_read_only)]
