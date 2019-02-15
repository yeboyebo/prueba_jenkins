from YBUTILS import tools
from YBUTILS.test_tools import YBTestCase


class test_utiltools(YBTestCase):

    def test_deepUpdate(self):
        a = {
            "a": "b",
            "c": {
                "m": "n",
                "o": {"x": {"u": "v"}, "y": "z"},
                "p": "q",
            },
            "d": "e"
        }

        b = {
            "c": {
                "o": {"x": {"u": "w"}},
                "p": "r",
            },
            "d": "f"
        }

        c = {
            "a": "b",
            "c": {
                "m": "n",
                "o": {"x": {"u": "w"}, "y": "z"},
                "p": "r",
            },
            "d": "a"
        }

        self.assertEqual(tools.deepUpdate(a, b), c)
