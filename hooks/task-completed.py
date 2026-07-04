import sys
import json
import subprocess
import os

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print('{"decision": "stop"}')
            return
            
        data = json.loads(input_data)
        
        # Only nag on the very first stop attempt of a turn
        if data.get("executionNum", 1) != 1:
            print('{"decision": "stop"}')
            return
            
        # Extract workspace path from the payload
        workspace_paths = data.get("workspacePaths", [])
        cwd = workspace_paths[0] if workspace_paths else None
        
        if not cwd:
            print('{"decision": "stop"}')
            return

        # Query trekker for in_progress tasks
        # If trekker is not initialized in this workspace, it will likely return a non-zero exit code or output nothing.
        # We use a shell to ensure trekker command resolves properly on windows if it's a batch wrapper.
        result = subprocess.run(
            "trekker --toon task list --status in_progress",
            cwd=cwd, shell=True, capture_output=True, text=True
        )
        
        if result.returncode != 0:
            print('{"decision": "stop"}')
            return
            
        output = result.stdout.strip()
        
        # Parse total count from the toon output format ("total: N")
        total = 0
        for line in output.split('\n'):
            if line.startswith('total:'):
                try:
                    total = int(line.replace('total:', '').strip())
                except ValueError:
                    pass
                break
        
        if total > 0:
            response = {
                "decision": "continue",
                "reason": "Safety Gate: You still have in_progress tasks in Trekker. If you finished your work during this session, please use the Trekker MCP tools to mark them as completed and add a summary before stopping. If you are stuck, mark them blocked. If you are just taking a break or they belong to another session, you can ignore this and I will let you stop on your next attempt."
            }
            print(json.dumps(response))
            return
            
        # No active tasks, allow stop
        print('{"decision": "stop"}')
        
    except Exception:
        # Fail open
        print('{"decision": "stop"}')

if __name__ == "__main__":
    main()
