from YBLEGACY import constantes
from YBUTILS.test_tools import YBTestCase


class Test_constantes(YBTestCase):

    def test_parseFloat(self):
        self.assertEqual(constantes.parseFloat("555.24"), 555.24)
