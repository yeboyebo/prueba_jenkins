import time

from django.test import TestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.contrib.auth.models import User

from selenium.webdriver.chrome.webdriver import WebDriver as ChromeWebDriver

from YBUTILS.DbRouter import fake_request


class YBTestCase(TestCase):

    __test__ = False

    def setUp(self):
        if not self.__test__:
            self.skipTest("Skipped test")

    def subAssertEqual(self, fun, inputs, outputs):
        for i in range(len(inputs)):
            with self.subTest(i=i):
                self.assertEqual(fun(*inputs[i]), outputs[i])

    def tearDown(self):
        pass


class YBLiveTestCase(StaticLiveServerTestCase):

    __test__ = False

    driver = None

    def setUp(self):
        if not self.__test__:
            self.skipTest("Skipped test")

        self.driver = YBWebDriver(sleep=0)
        self.driver.implicitly_wait(2)
        self.addCleanup(self.driver.quit)
        self.setUpCreateUser()
        fake_request()
        self.setUpLogin()

    def setUpCreateUser(self):
        User.objects.create_user(username="testing", password="testing").save()

    def setUpLogin(self):
        self.driver.get("{}{}".format("localhost:8081", "/login/?next=/"))
        self.driver.send_keys_by_name("username", "testing")
        self.driver.send_keys_by_name("password", "testing")
        self.driver.click_by_name("loginSubmit")


class YBWebDriver(ChromeWebDriver):

    _sleep = None

    def __init__(self, sleep=None):
        super().__init__()
        self._sleep = sleep

    def send_keys_by_name(self, name, keys):
        resp = super().find_element_by_name(name)
        if not resp:
            return resp

        resp = resp.send_keys(keys)

        if self._sleep:
            time.sleep(self._sleep)

        return resp

    def click_by_name(self, name):
        resp = super().find_element_by_name(name)
        if not resp:
            return resp

        resp = resp.click()

        if self._sleep:
            time.sleep(self._sleep)

        return resp

    def find_by_css(self, css):
        resp = super().find_element_by_css_selector(css)

        if self._sleep:
            time.sleep(self._sleep)

        return resp

    def click_by_css(self, css):
        resp = super().find_element_by_css_selector(css)
        if not resp:
            return resp

        resp = resp.click()

        if self._sleep:
            time.sleep(self._sleep)

        return resp
