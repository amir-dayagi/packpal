from flask import request, jsonify
from typing import List, Dict, Any

def validate_json(required_properties: List[str]) -> tuple[Dict[str, Any], int]:
    """
    Validates that the request's JSON body contains all required properties.

    Args:
        required_properties: A list of strings representing the required JSON keys.

    Returns:
        A tuple:
          - None, if all required properties are present.
          - A JSON response with error message and status code 400 if any property is missing.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    json_data = request.get_json()

    if json_data is None:
       return jsonify({"error": "Invalid JSON data"}), 400


    missing_properties = [prop for prop in required_properties if prop not in json_data]

    if missing_properties:
        return jsonify({"error": f"Missing required properties: {', '.join(missing_properties)}"}), 400

    return None # Validation successful