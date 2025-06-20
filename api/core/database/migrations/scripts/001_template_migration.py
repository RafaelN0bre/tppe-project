#!/usr/bin/env python
"""
Migration: 001_template_migration
---------------------------------------------------------------
This is a template migration file that can be used as a base for creating new migrations.
Replace the migration name, description, and implementation with your specific needs.

To create a new migration:
1. Copy this file and rename it with the next sequential number
2. Update the class name to match the file name
3. Update the docstring with your migration's purpose
4. Implement the apply() method with your migration logic
"""

from api.database.raven import RavenStore
from api.database.migrations.Migration import Migration

class Migration001(Migration):
    @classmethod
    def apply(cls):
        """
        Apply the migration.
        This is where you implement your migration logic.
        """
        store = RavenStore()
        
        with store.open_session() as session:
            # Your migration logic goes here
            # Example:
            # 1. Query the documents you want to modify
            # 2. Make the necessary changes
            # 3. Store the modified documents
            # 4. Save changes to the session
            
            session.save_changes()
            print("Migration complete.")
