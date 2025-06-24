from api.core.database.seeders.Seeder import Seeder
from api.modules.user.model import User
from api.modules.user.enum import UserRole
from api.modules.shared.model import Address, Phone
from api.core.auth.service import hash_password

class CreateAdminUserSeeder(Seeder):
    def run(self, session):
        # Check if admin user already exists
        if list(session.query(object_type=User).where(email="admin@admin.com")):
            print("Admin user already exists.")
            return

        admin_user = User(
            name="Admin",
            email="admin@admin.com",
            cpf="00000000000",
            password=hash_password("123"),
            phones=[
                Phone(country_code="55", area_code="61", number="999999999")
            ],
            address=Address(
                street="Admin St",
                number="123",
                neighborhood="Admin Neighborhood",
                city="Admin City",
                state="AS",
                zip_code="12345-678"
            ),
            role=UserRole.ADMIN
        )

        session.store(admin_user)
        session.save_changes()
        print("Admin user created.") 