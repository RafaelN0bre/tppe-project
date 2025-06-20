import os
import inspect
import importlib.util

from api.database.migrations.Migration import Migration

current_folder = os.path.dirname(os.path.abspath(__file__))
migration_scripts_root = os.path.join(current_folder, 'scripts')

class DBMigration(Migration):
    def apply(self):

        for filename in os.listdir(migration_scripts_root):
            if filename.endswith('.py'):
                module_path = os.path.join(migration_scripts_root, filename)
                module_name = os.path.splitext(filename)[0]
                print(module_name)
                spec = importlib.util.spec_from_file_location(module_name, module_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)

                for name, obj in inspect.getmembers(module):
                    if inspect.isclass(obj) and issubclass(obj, Migration) and obj is not Migration:
                        print(f"{name} . . .")

                        migration_instance = obj()
                        migration_instance.apply()


if __name__ == "__main__":
    DBMigration().apply()
