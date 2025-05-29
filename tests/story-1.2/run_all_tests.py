#!/usr/bin/env python3
"""
Story 1.2 Test Runner
Comprehensive test execution with reporting and results analysis
"""
import subprocess
import sys
import time
from datetime import datetime
import asyncio
import httpx

def print_banner(text):
    """Print a formatted banner"""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80)

def print_section(text):
    """Print a formatted section header"""
    print(f"\n🔍 {text}")
    print("-" * 60)

async def check_mcp_server_health():
    """Check if MCP server is healthy before running tests"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8002/health", timeout=5)
            data = response.json()
            if data.get("status") == "healthy":
                print("✅ MCP Auth Server is healthy and ready")
                return True
            else:
                print(f"❌ MCP Auth Server unhealthy: {data}")
                return False
    except Exception as e:
        print(f"❌ Cannot connect to MCP Auth Server: {e}")
        return False

def run_test_suite(test_file, test_class=None, verbose=True):
    """Run a specific test suite"""
    cmd = ["python", "-m", "pytest"]
    
    if test_class:
        cmd.append(f"{test_file}::{test_class}")
    else:
        cmd.append(test_file)
    
    if verbose:
        cmd.extend(["-v", "-s"])
    
    cmd.extend(["--tb=short"])  # Short traceback format
    
    print(f"Running: {' '.join(cmd)}")
    start_time = time.time()
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"Duration: {duration:.1f}s")
        print(f"Exit code: {result.returncode}")
        
        if result.stdout:
            print("STDOUT:")
            print(result.stdout)
        
        if result.stderr and result.returncode != 0:
            print("STDERR:")
            print(result.stderr)
        
        return {
            "success": result.returncode == 0,
            "duration": duration,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
        
    except subprocess.TimeoutExpired:
        print("❌ Test suite timed out after 300 seconds")
        return {"success": False, "duration": 300, "timeout": True}
    except Exception as e:
        print(f"❌ Error running test suite: {e}")
        return {"success": False, "error": str(e)}

async def main():
    """Main test execution function"""
    print_banner("STORY 1.2 COMPREHENSIVE TEST EXECUTION")
    print(f"Test execution started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test infrastructure setup
    print_section("Pre-flight Infrastructure Check")
    
    # Check if MCP server is running
    mcp_healthy = await check_mcp_server_health()
    if not mcp_healthy:
        print("❌ MCP Auth Server is not available. Please ensure Docker containers are running.")
        print("Run: docker-compose ps | grep auth")
        sys.exit(1)
    
    # Test execution plan
    test_plan = [
        {
            "name": "Infrastructure Setup Verification",
            "file": "test_setup_verification.py",
            "classes": [
                "TestStory12SetupVerification"
            ]
        },
        {
            "name": "Core Authentication Flow",
            "file": "test_comprehensive_auth.py", 
            "classes": [
                "TestStory12UserLoginFlow"
            ]
        },
        {
            "name": "Security Features",
            "file": "test_comprehensive_auth.py",
            "classes": [
                "TestStory12SecurityFeatures"
            ]
        },
        {
            "name": "Edge Cases and Error Handling",
            "file": "test_comprehensive_auth.py",
            "classes": [
                "TestStory12EdgeCases"
            ]
        },
        {
            "name": "Integration Tests",
            "file": "test_comprehensive_auth.py",
            "classes": [
                "TestStory12Integration"
            ]
        },
        {
            "name": "Performance Tests",
            "file": "test_performance_security.py",
            "classes": [
                "TestStory12Performance"
            ]
        },
        {
            "name": "Security Tests",
            "file": "test_performance_security.py",
            "classes": [
                "TestStory12Security"
            ]
        },
        {
            "name": "Error Handling Tests",
            "file": "test_performance_security.py",
            "classes": [
                "TestStory12ErrorHandling"
            ]
        }
    ]
    
    # Execute test suites
    results = []
    total_start_time = time.time()
    
    for test_suite in test_plan:
        print_section(f"Executing: {test_suite['name']}")
        
        suite_results = []
        for test_class in test_suite.get("classes", [None]):
            if test_class:
                print(f"\n📋 Running test class: {test_class}")
                result = run_test_suite(test_suite["file"], test_class)
            else:
                print(f"\n📋 Running entire test file: {test_suite['file']}")
                result = run_test_suite(test_suite["file"])
            
            result["test_suite"] = test_suite["name"]
            result["test_class"] = test_class
            suite_results.append(result)
        
        results.extend(suite_results)
        
        # Summary for this suite
        suite_success = all(r["success"] for r in suite_results)
        suite_duration = sum(r["duration"] for r in suite_results)
        
        status = "✅ PASSED" if suite_success else "❌ FAILED"
        print(f"\n{status} - {test_suite['name']} ({suite_duration:.1f}s)")
    
    # Final results summary
    total_duration = time.time() - total_start_time
    
    print_banner("TEST EXECUTION SUMMARY")
    
    passed_suites = [r for r in results if r["success"]]
    failed_suites = [r for r in results if not r["success"]]
    
    print(f"📊 Test Results Summary:")
    print(f"   Total test suites: {len(results)}")
    print(f"   Passed: {len(passed_suites)}")
    print(f"   Failed: {len(failed_suites)}")
    print(f"   Success rate: {len(passed_suites)/len(results)*100:.1f}%")
    print(f"   Total execution time: {total_duration:.1f}s")
    
    if failed_suites:
        print(f"\n❌ Failed Test Suites:")
        for result in failed_suites:
            print(f"   - {result['test_suite']}")
            if result.get("test_class"):
                print(f"     Class: {result['test_class']}")
            print(f"     Duration: {result['duration']:.1f}s")
    
    if passed_suites:
        print(f"\n✅ Passed Test Suites:")
        for result in passed_suites:
            print(f"   - {result['test_suite']} ({result['duration']:.1f}s)")
    
    # Story 1.2 completion assessment
    print_section("Story 1.2 Implementation Assessment")
    
    critical_tests = [
        "Infrastructure Setup Verification",
        "Core Authentication Flow",
        "Integration Tests"
    ]
    
    critical_passed = [r for r in results if r["test_suite"] in critical_tests and r["success"]]
    critical_total = [r for r in results if r["test_suite"] in critical_tests]
    
    if len(critical_passed) == len(critical_total):
        print("🎉 STORY 1.2 IMPLEMENTATION: READY FOR PRODUCTION")
        print("   All critical authentication features are working correctly")
    elif len(critical_passed) >= len(critical_total) * 0.8:
        print("⚠️  STORY 1.2 IMPLEMENTATION: MOSTLY COMPLETE")
        print("   Core functionality works, minor issues in non-critical areas")
    else:
        print("❌ STORY 1.2 IMPLEMENTATION: NEEDS ATTENTION")
        print("   Critical issues found that need to be resolved")
    
    # Recommendations
    print_section("Recommendations")
    
    if len(passed_suites) == len(results):
        print("✅ All tests passed! Story 1.2 is ready for production deployment.")
        print("   Consider running additional load testing in staging environment.")
    elif len(passed_suites) >= len(results) * 0.9:
        print("⚠️  Minor issues detected:")
        print("   - Review failed tests and fix any critical issues")
        print("   - Consider Story 1.2 ready for staging deployment")
    else:
        print("❌ Significant issues detected:")
        print("   - Address failed tests before proceeding")
        print("   - Review authentication implementation")
        print("   - Consider additional security testing")
    
    print(f"\nTest execution completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Exit with appropriate code
    if len(failed_suites) == 0:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n❌ Test execution interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        sys.exit(1) 