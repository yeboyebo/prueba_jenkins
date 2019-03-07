from django.db import transaction


class FLTransactional:
    """
      Clase interna de la que heredan objetos con capacidad transaccional
    """

    def __init(self):
        # self._micounterTran=0
        pass

    def transaction(self, bValor):
        try:
            if bValor:
                pass
            else:
                transaction.savepoint()
            #    self._micounterTran+=1
        except Exception:
            return False
        else:
            return True

    def commit(self):
        try:
            # self._micounterTran-=1
            transaction.savepoint_commit()
        except Exception:
            return False
        else:
            return True

    def rollback(self):
        try:
            # self._micounterTran-=1
            transaction.savepoint_rollback()
        except Exception:
            return False
        else:
            return True

    def transactionLevel(self):
        try:
            # return self._micounterTran
            return 0
        except Exception:
            return 1
        else:
            return 0
