from ravendb import DocumentStore

from api.modules.user.model import User
from api.modules.property.model import Property

def create_users(users: list[User], store: DocumentStore):
    with store.open_session() as session:
        for user in users:
            session.store(user)
        session.save_changes()
        return users

def create_properties(properties: list[Property], store: DocumentStore):
    with store.open_session() as session:
        for prop in properties:
            session.store(prop)
        session.save_changes()
        return properties
