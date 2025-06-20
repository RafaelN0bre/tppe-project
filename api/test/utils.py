from ravendb import DocumentStore

from api.modules.user.model import User

def create_users(users: list[User], store: DocumentStore):
    with store.open_session() as session:
        for user in users:
            session.store(user)
        session.save_changes()
        return users
