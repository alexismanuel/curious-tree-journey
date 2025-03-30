"""Test the improved JSON parsing functionality."""
from src.api.json_parser import extract_json, try_parse_json

def test_parsing():
    """Test various JSON parsing scenarios."""
    test_cases = [
        # Test case 1: JSON in markdown code block
        '''Here's the plan:
```json
{
    "title": "Learning Docker",
    'description': "A comprehensive guide",
    chapters: [
        {
            id: "c1",
            title: "Introduction",
            prerequisites: []
        }
    ]
}
```''',

        # Test case 2: Malformed JSON with mixed quotes and missing quotes
        '''{
    title: "Docker Basics",
    'chapters': [
        {
            'id': 'c1',
            title: Basic Concepts,
            prerequisites: [],
            content: null
        }
    ]
}''',

        # Test case 3: JSON with boolean and special characters
        '''{
    "success": true,
    "error": null,
    "message": "Here's a message with 'quotes' and special chars: /\\n"
}'''
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print("Input:")
        print(test_case)
        
        # First try to extract JSON from markdown
        extracted = extract_json(test_case)
        print("\nExtracted JSON:")
        print(extracted)
        
        # Try to parse the JSON
        parsed, error = try_parse_json(extracted)
        if error:
            print("\nParsing Error:")
            print(f"❌ {error}")
        else:
            print("\nParsed JSON:")
            print(parsed)
            print("✅ Successfully parsed!")

if __name__ == "__main__":
    test_parsing()
