import sys
import os
import platform

print("=== Phase 2B Environment Check ===")
print(f"OS: {platform.system()} {platform.release()} ({platform.architecture()[0]})")
print(f"Python: {sys.version.split()[0]} [{sys.executable}]")

try:
    import multiprocessing
    print(f"CPU Count: {multiprocessing.cpu_count()}")
except Exception:
    pass

packages = [
    ("pandas", True),
    ("numpy", True),
    ("sklearn", True),
    ("xgboost", True),
    ("lightgbm", True),
    ("transformers", True),
    ("torch", True),
    ("shap", False), # SHAP is optional
    ("matplotlib", True)
]

missing_mandatory = False

for pkg, is_mandatory in packages:
    try:
        if pkg == "sklearn":
            import sklearn as module
        else:
            module = __import__(pkg)
        version = getattr(module, "__version__", "unknown")
        status = "OK"
        print(f"{pkg:15s} | {version:10s} | {status}")
    except ImportError:
        status = "MISSING (Mandatory)" if is_mandatory else "MISSING (Optional)"
        print(f"{pkg:15s} | {'N/A':10s} | {status}")
        if is_mandatory:
            missing_mandatory = True

if missing_mandatory:
    print("\nERROR: Mandatory packages are missing. Exiting non-zero.")
    sys.exit(1)
else:
    print("\nSUCCESS: Environment is ready for Phase 2B.")
    sys.exit(0)
