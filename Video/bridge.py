from flask import Flask, jsonify
import subprocess
import os
import traceback
import sys

app = Flask(__name__)

# --- BULLETPROOF CONFIGURATION ---
PYTHON_EXE = "python"

CURRENT_FOLDER = os.path.dirname(os.path.abspath(__file__))
SCRIPT_TO_RUN = os.path.join(CURRENT_FOLDER, "standard_edits.py")

if not os.path.exists(SCRIPT_TO_RUN):
    print(f"\n❌ FATAL ERROR: I cannot find the file here: {SCRIPT_TO_RUN}")
    print("Please make sure standard_edits.py is in the exact same folder as bridge.py!\n")
# ---------------------------------

@app.route('/run-script', methods=['GET'])
def run_script():
    try:
        print(f"🔄 Executing: {SCRIPT_TO_RUN}")
        
        result = subprocess.run(
            [PYTHON_EXE, SCRIPT_TO_RUN],
            capture_output=True,
            text=True,
            check=True
        )

        # ✅ NOW MATCHES THE JS CODE NODE OUTPUT EXACTLY
        return jsonify({
            "status": "Standard Edits Completed Successfully!",
            "log": result.stdout
        }), 200

    except subprocess.CalledProcessError as e:
        # Still returns clean JSON (so n8n error branch is consistent)
        print(f"❌ Script failed with exit code {e.returncode}")
        return jsonify({
            "status": "failed",
            "error": "The video script returned an error.",
            "log": (e.stdout or "") + (e.stderr or "")
        }), 500

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"🔥 System Error: {error_details}")
        return jsonify({
            "status": "failed",
            "error": str(e),
            "log": error_details
        }), 500


if __name__ == '__main__':
    print("🚀 n8n Python Bridge is running on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)