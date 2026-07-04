import sys
import json
import subprocess
import os

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print("{}")
            return
            
        data = json.loads(input_data)
        
        # Only inject on the first invocation
        if data.get("invocationNum", 0) != 0:
            print("{}")
            return
            
        # Extract workspace path from the payload
        workspace_paths = data.get("workspacePaths", [])
        cwd = workspace_paths[0] if workspace_paths else None
            
        script_dir = os.path.dirname(os.path.abspath(__file__))
        bash_script = os.path.join(script_dir, "session-start.sh")
        
        # Run bash with the correct working directory!
        result = subprocess.run(["bash", bash_script], cwd=cwd, capture_output=True, text=True)
        output_text = result.stdout.strip()
        
        if not output_text:
            print("{}")
            return
            
        output_json = {
            "injectSteps": [
                {
                    "ephemeralMessage": output_text
                }
            ]
        }
        
        print(json.dumps(output_json))
        
    except Exception as e:
        print("{}")

if __name__ == "__main__":
    main()
