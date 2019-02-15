from collections import OrderedDict

from YBWEB.ctxJSON import DICTJSON
from YBUTILS.test_tools import YBTestCase


class Test_DICTJSON(YBTestCase):

    def test_fromJSON(self):
        str_json = '{"a": "b", "c": {"d": "e"}}'
        json = OrderedDict([('a', 'b'), ('c', OrderedDict([('d', 'e')]))])
        self.assertEqual(DICTJSON.fromJSON(str_json), json)
