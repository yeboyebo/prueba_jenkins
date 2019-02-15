# @class_declaration interna #
from YBUTILS.test_tools import YBTestCase


# @class_declaration diagnosis #
class diagnosis(YBTestCase):

    def test_assert1(self):
        a = [[1, 2], [2, 2], [3, 3], [3, 4], [4, 4]]

        for i in a:
            with self.subTest(i=i):
                self.assertEqual(i[0], i[1])

    def juan(self, a, b):
        return a + b

    def test_subtest(self):
        inputs = [[1, 2], [2, 2], [3, 3], [3, 4], [4, 4]]
        outputs = [3, 4, 2, 6, 1]

        self.subAssertEqual(self.juan, inputs, outputs)


# @class_declaration pruebatestcase #
class pruebatestcase(diagnosis):

    __test__ = True
