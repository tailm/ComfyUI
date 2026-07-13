import os

import pytest


# Command line arguments for pytest

def pytest_addoption(parser):
    parser.addoption(
        '--baseline_dir',
        action='store',
        default='tests/inference/baseline',
        help='Directory for ground-truth images',
    )
    parser.addoption(
        '--test_dir',
        action='store',
        default='tests/inference/samples',
        help='Directory for images to test',
    )
    parser.addoption(
        '--metrics_file',
        action='store',
        default='tests/metrics.md',
        help='Output file for metrics',
    )
    parser.addoption(
        '--img_output_dir',
        action='store',
        default='tests/compare/samples',
        help='Output directory for diff metric images',
    )


# This initializes args at the beginning of the test session
@pytest.fixture(scope='session', autouse=True)
def args_pytest(pytestconfig):
    args = {}
    args['baseline_dir'] = pytestconfig.getoption('baseline_dir')
    args['test_dir'] = pytestconfig.getoption('test_dir')
    args['metrics_file'] = pytestconfig.getoption('metrics_file')
    args['img_output_dir'] = pytestconfig.getoption('img_output_dir')

    # Initialize metrics file
    with open(args['metrics_file'], 'a') as f:
        # if file is empty, write header
        if os.stat(args['metrics_file']).st_size == 0:
            f.write("| date | run | file | status | value | \n")
            f.write("| --- | --- | --- | --- | --- | \n")

    if not os.path.isdir(args['baseline_dir']):
        pytest.skip(
            (
                "Baseline directory {0} not found; generate it with "
                "`pytest tests/inference --output_dir {0}`"
            ).format(
                args['baseline_dir'],
            )
        )
    if not os.path.isdir(args['test_dir']):
        pytest.skip(
            (
                "Test directory {0} not found; provide images in {0}"
            ).format(
                args['test_dir'],
            )
        )

    baseline_files = gather_file_basenames(args['baseline_dir'])
    if not baseline_files:
        pytest.skip(
            (
                "No baseline .png files found in {0}; generate them with "
                "`pytest tests/inference --output_dir {0}`"
            ).format(
                args['baseline_dir'],
            )
        )
    test_files = gather_file_basenames(args['test_dir'])
    if not test_files:
        pytest.skip(
            (
                "No test .png files found in {0}; provide images in {0}"
            ).format(
                args['test_dir'],
            )
        )

    return args


def gather_file_basenames(directory: str):
    files = []
    if not os.path.isdir(directory):
        return files
    for file in os.listdir(directory):
        if file.endswith(".png"):
            files.append(file)
    return files


# Creates the list of baseline file names to use as a fixture
def pytest_generate_tests(metafunc):
    if 'baseline_fname' in metafunc.fixturenames:
        baseline_dir = metafunc.config.getoption('baseline_dir')
        baseline_fnames = gather_file_basenames(baseline_dir)
        if not baseline_fnames:
            pytest.skip(
                (
                    "No baseline .png files found in {0}; generate them with "
                    "`pytest tests/inference --output_dir {0}`"
                ).format(
                    baseline_dir,
                )
            )
        metafunc.parametrize('baseline_fname', baseline_fnames)
