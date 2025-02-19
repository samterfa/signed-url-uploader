from pathlib import Path
import os
import subprocess
import setuptools
from setuptools.command.build_py import build_py

class BuildFrontend(build_py):
    """Custom build command to build the frontend before packaging."""
    
    def run(self):
        frontend_dir = os.path.join(os.path.dirname(__file__), "st_signedUrl_uploader/frontend")
        if os.path.exists(frontend_dir):
            print("Building frontend...")
            subprocess.check_call(["npm", "install"], cwd=frontend_dir)
            subprocess.check_call(["npm", "run", "build"], cwd=frontend_dir)
        else:
            print("Warning: Frontend directory not found, skipping build.")
        super().run()


this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setuptools.setup(
    name="st-signedUrl-uploader",
    version="1.3.0",
    author="Meryam Assermouh",
    author_email="",
    description="Streamlit component that allows you to upload files to Google Cloud Storage via signed url",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="",
    cmdclass={"build_py": BuildFrontend}, 
    packages=setuptools.find_packages(),
    include_package_data=True,
    package_data={
        "st_signedUrl_uploader": [
            "frontend/*",           
            "frontend/**/*",         
        ]
    },
    classifiers=[],
    python_requires=">=3.7",
    install_requires=[
        "streamlit >= 0.63",
    ],
    extras_require={
        "devel": [
            "wheel",
            "pytest==7.4.0",
            "playwright==1.39.0",
            "requests==2.31.0",
            "pytest-playwright-snapshot==1.0",
            "pytest-rerunfailures==12.0",
        ]
    }
)
