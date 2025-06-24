import os
import importlib.util

from api.core.database.seeders.Seeder import Seeder

class DBSeeder:
    def __init__(self, scripts_path=None):
        if scripts_path is None:
            scripts_path = os.path.join(os.path.dirname(__file__), 'scripts/prod')
        self.scripts_path = scripts_path
        self.seeders = self._discover_seeders()

    def _discover_seeders(self):
        seeders = []
        for filename in os.listdir(self.scripts_path):
            if filename.endswith('.py') and not filename.startswith('__'):
                module_name = filename[:-3]
                module_path = os.path.join(self.scripts_path, filename)
                spec = importlib.util.spec_from_file_location(module_name, module_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                for attr in dir(module):
                    obj = getattr(module, attr)
                    if isinstance(obj, type) and issubclass(obj, Seeder) and obj is not Seeder:
                        seeders.append(obj())
        return seeders

    def run_all(self, session):
        for seeder in self.seeders:
            seeder.run(session)

if __name__ == "__main__":
    from api.core.database.model import RavenStore
    with RavenStore().open_session() as session:
        DBSeeder().run_all(session)
