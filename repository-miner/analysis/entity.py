import hashlib


class Entity:
    def __init__(self, entity_name: str, kind: str, file: str):
        self.entity_name = entity_name
        self.kind = kind
        self.file = file
        # we use a hash as id, in that way we know the entity-ids before
        # we add them to the DB
        self.id = hashlib.sha1(entity_name.encode()).hexdigest()
        self.hash = int(self.id, 16)

    def __hash__(self):
        return self.hash

    def __eq__(self, other):
        return self.hash == other.hash
