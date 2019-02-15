import os
import sys

import django
from django.conf import settings
from django.test.utils import get_runner


if __name__ == "__main__":
    os.environ['DJANGO_SETTINGS_MODULE'] = 'AQNEXT.settings'
    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
    django.setup()
    TestRunner = get_runner(settings)

    test_runner = TestRunner(keepdb=True, verbosity=0, liveserver="localhost:8081")
    failures = test_runner.run_tests(sys.argv[1:])

    sys.exit(bool(failures))
