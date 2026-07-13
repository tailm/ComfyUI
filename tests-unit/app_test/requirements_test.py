from pathlib import Path


def test_runtime_requirements_include_trampoline_and_compatible_numpy():
    requirements_path = Path(__file__).resolve().parents[2] / "utils" / "requirements.txt"
    requirements = requirements_path.read_text(encoding="utf-8").splitlines()

    package_names = {
        line.strip().split("==")[0].split(">=")[0].split("~=", 1)[0].split("<", 1)[0].strip()
        for line in requirements
        if line.strip() and not line.lstrip().startswith("#")
    }

    assert "trampoline" in package_names
    assert "kornia-rs" in package_names
    assert "comfyui-workflow-templates-core" in package_names
    assert "comfyui-workflow-templates-media-api" in package_names
    assert "comfyui-workflow-templates-media-image" in package_names
    assert "comfyui-workflow-templates-media-video" in package_names
    assert "comfyui-workflow-templates-media-other" in package_names

    numpy_requirement = next(
        (line.strip() for line in requirements if line.strip().startswith("numpy")),
        None,
    )
    assert numpy_requirement is not None
    assert "<2.3" in numpy_requirement
