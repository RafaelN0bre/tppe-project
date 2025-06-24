from abc import ABC, abstractmethod

class Seeder(ABC):

    @abstractmethod
    def run(self, session):
        raise NotImplementedError("Seeders must implement the run method.")
