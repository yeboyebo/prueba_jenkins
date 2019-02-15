# @class_declaration interna #
from YBUTILS.test_tools import YBLiveTestCase


# @class_declaration diagnosis #
class diagnosis(YBLiveTestCase):

    def test_exists_elganso_magento(self):
        self.driver.click_by_css(".YBDashBoardItem:nth-child(4)")
        self.assertEqual(self.driver.title, "AQNext")

        navbar_title = self.driver.find_by_css(".YBNavBar-title").text
        self.assertEqual(navbar_title, "MAGENTO")

    def test_exists_elganso_log(self):
        self.driver.click_by_css(".YBDashBoardItem:nth-child(5)")
        self.assertEqual(self.driver.title, "AQNext")

        navbar_title = self.driver.find_by_css(".YBNavBar-title").text
        self.assertEqual(navbar_title, "LOG MAGENTO")


# @class_declaration pruebalivetestcase #
class pruebalivetestcase(diagnosis):

    __test__ = True
