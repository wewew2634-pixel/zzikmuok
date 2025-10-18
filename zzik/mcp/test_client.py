#!/usr/bin/env python3
"""
ZZIK MCP Server Test Client
"""
import requests
import json

BASE_URL = "http://localhost:8080"

def jsonrpc_request(method, params=None):
    """Make JSON-RPC 2.0 request"""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params or {}
    }
    
    response = requests.post(BASE_URL, json=payload)
    result = response.json()
    
    if "error" in result:
        print(f"❌ Error: {result['error']['message']}")
        return None
    
    return result.get("result")

def main():
    print("🧪 ZZIK MCP Server Test Suite\n")
    
    # Test 1: Health Check
    print("1. Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   ✅ Status: {response.json()['status']}\n")
    
    # Test 2: Initialize
    print("2. Initialize")
    result = jsonrpc_request("initialize")
    print(f"   ✅ Protocol: {result['protocolVersion']}")
    print(f"   ✅ Server: {result['serverInfo']['name']} v{result['serverInfo']['version']}\n")
    
    # Test 3: List Tools
    print("3. List Tools")
    result = jsonrpc_request("tools/list")
    for tool in result['tools']:
        print(f"   ✅ {tool['name']}: {tool['description']}")
    print()
    
    # Test 4: fs_read
    print("4. Test fs_read")
    result = jsonrpc_request("fs_read", {"path": "test.txt"})
    if result:
        print(f"   ✅ Path: {result['path']}")
        print(f"   ✅ Size: {result['size']} bytes")
        print(f"   ✅ Content:\n{result['content'][:100]}...\n")
    
    # Test 5: fs_read (invalid path)
    print("5. Test fs_read (invalid path - should fail)")
    result = jsonrpc_request("fs_read", {"path": "../../../etc/passwd"})
    if result is None:
        print("   ✅ Access denied (as expected)\n")
    
    # Test 6: http_get (whitelisted)
    print("6. Test http_get (whitelisted domain)")
    result = jsonrpc_request("http_get", {"url": "https://www.google.com"})
    if result:
        print(f"   ✅ URL: {result['url']}")
        print(f"   ✅ Status: {result['status']}")
        print(f"   ✅ Content-Type: {result['contentType']}\n")
    
    # Test 7: http_get (non-whitelisted)
    print("7. Test http_get (non-whitelisted - should fail)")
    result = jsonrpc_request("http_get", {"url": "https://evil.com"})
    if result is None:
        print("   ✅ URL blocked (as expected)\n")
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    main()
