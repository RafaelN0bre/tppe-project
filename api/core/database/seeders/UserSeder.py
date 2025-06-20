from api.database.seeders.Seeder import Seeder
from api.modules.user.model import User, Phone, Address
from api.modules.user.enum import UserRole
from api.modules.auth.service import hash_password
from api.database.raven import RavenStore

class UserSeeder(Seeder):

    def seed():
        admin_user = User(
            name="Admin",
            email="admin@admin.com",
            cpf="12345678901",
            phones=[
                Phone(
                    country_code="+55",
                    area_code="61",
                    number="999999999"
                )
            ],
            address=Address(
                street="Avenida Paulista",
                number="1000",
                neighborhood="Bela Vista",
                city="São Paulo",
                state="SP",
                zip_code="01310100"
            ),
            role=UserRole.ADMIN,
            password=hash_password("admin123"),
        )

        with RavenStore().open_session() as session:
            try:
                ex_user = session.query(object_type=User).where_equals("email", "admin@admin.com").first()
            except Exception:
                ex_user = None

            if ex_user:
                session.save_changes()
                return

            session.store(admin_user)
            session.save_changes()
