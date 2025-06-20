from abc import ABC, abstractmethod

class Migration(ABC):
    @abstractmethod
    def apply(self):
        pass
