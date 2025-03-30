"""Utilities for handling JSON parsing and extraction."""
import re
import json
from typing import Dict, Any, Tuple

def extract_json(text: str) -> str:
    """Extract JSON content from text, handling markdown code blocks."""
    # First try to find content between ```json and ``` markers
    json_pattern = r'```json\s*([^`]+?)\s*```'
    match = re.search(json_pattern, text)
    if match:
        return match.group(1).strip()
    
    # If no ```json block found, try to find content between { and }
    if '{' in text and '}' in text:
        # Find the outermost JSON object
        stack = []
        start = -1
        for i, c in enumerate(text):
            if c == '{':
                if not stack:
                    start = i
                stack.append(c)
            elif c == '}':
                if stack:
                    stack.pop()
                    if not stack and start >= 0:
                        return text[start:i+1]
    
    return text.strip()

def try_parse_json(text: str) -> Tuple[Dict[str, Any], str]:
    """Try to parse JSON with basic cleanup. Returns (parsed_json, error_message)."""
    try:
        # Try parsing as-is first
        return json.loads(text), ""
    except json.JSONDecodeError as e1:
        # Basic cleanup: replace single quotes with double quotes
        text = text.replace("'", '"')
        try:
            return json.loads(text), ""
        except json.JSONDecodeError as e2:
            return {}, f"Invalid JSON: {str(e2)}"
