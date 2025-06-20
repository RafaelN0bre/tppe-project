from Seeder import Seeder
from UserSeder import UserSeeder

class DBSeeder(Seeder):
    def seed(self):
        UserSeeder.seed()

if __name__ == "__main__":
    DBSeeder().seed()
