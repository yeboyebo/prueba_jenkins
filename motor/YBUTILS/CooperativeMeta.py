class CooperativeMeta(type):
    def __new__(cls, name, bases, members):
        # collect up the metaclasses
        metas = [type(base) for base in bases]

        # prune repeated or conflicting entries
        metas = [
            meta for index, meta in enumerate(metas)
            if not [
                later for later in metas[index + 1:]
                if issubclass(later, meta)
            ]
        ]

        # whip up the actual combined meta class derive off all of these
        meta = type(name, tuple(metas), dict(combined_metas=metas))

        # make the actual object
        return meta(name, bases, members)

    def __init__(self, name, bases, members):
        for meta in self.combined_metas:
            meta.__init__(self, name, bases, members)
