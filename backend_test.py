import requests
import sys
import json
import io
from datetime import datetime
import time

class SkillMirrorAPITester:
    def __init__(self, base_url="https://smartcareer-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.analysis_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        # Override with custom headers if provided
        if headers:
            test_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, response.content
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def setup_test_user(self):
        """Create test user and session in MongoDB using mongosh"""
        print("\n🔧 Setting up test user and session...")
        
        # Generate unique identifiers
        timestamp = int(time.time())
        user_id = f"test-user-{timestamp}"
        session_token = f"test_session_{timestamp}"
        
        # MongoDB command to create test user and session
        mongo_command = f'''
mongosh --eval "
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
db.users.insertOne({{
  user_id: userId,
  email: 'test.user.{timestamp}@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
'''
        
        try:
            import subprocess
            result = subprocess.run(mongo_command, shell=True, capture_output=True, text=True)
            print(f"MongoDB setup result: {result.stdout}")
            if result.stderr:
                print(f"MongoDB setup error: {result.stderr}")
            
            self.session_token = session_token
            self.user_id = user_id
            print(f"✅ Test user created - ID: {user_id}")
            print(f"✅ Session token: {session_token}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to setup test user: {str(e)}")
            return False

    def test_auth_me(self):
        """Test /auth/me endpoint with session token"""
        if not self.session_token:
            print("❌ No session token available")
            return False
            
        success, response = self.run_test(
            "Auth Me",
            "GET",
            "auth/me",
            200,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success and 'user_id' in response:
            print(f"   User: {response.get('name', 'Unknown')}")
            return True
        return False

    def test_resume_upload(self):
        """Test resume PDF upload"""
        # Create a simple test PDF content
        test_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Full Stack Developer) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n299\n%%EOF"
        
        files = {
            'file': ('test_resume.pdf', io.BytesIO(test_pdf_content), 'application/pdf')
        }
        
        success, response = self.run_test(
            "Resume Upload",
            "POST",
            "analyze/upload",
            200,
            files=files,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success and 'resume_text' in response:
            print(f"   Extracted text length: {len(response['resume_text'])}")
            return response['resume_text']
        return None

    def test_process_analysis(self, resume_text):
        """Test full career analysis"""
        data = {
            "resume_text": resume_text or "Full Stack Developer with 5 years of experience in React, Node.js, Python, MongoDB, AWS. Built 10+ production applications.",
            "job_description": "Looking for Senior Full Stack Developer with React, Node.js, Docker, Kubernetes, CI/CD experience. Must have 5+ years experience.",
            "linkedin_profile": "https://linkedin.com/in/testuser"
        }
        
        success, response = self.run_test(
            "Process Analysis",
            "POST",
            "analyze/process",
            200,
            data=data,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success and 'analysis_id' in response:
            self.analysis_id = response['analysis_id']
            result = response.get('result', {})
            print(f"   Analysis ID: {self.analysis_id}")
            print(f"   Match Score: {result.get('matchScore', 'N/A')}")
            print(f"   ATS Score: {result.get('ATSScore', 'N/A')}")
            return True
        return False

    def test_ats_analysis(self, resume_text):
        """Test ATS analysis"""
        data = {
            "resume_text": resume_text or "Full Stack Developer with 5 years of experience in React, Node.js, Python, MongoDB, AWS. Built 10+ production applications.",
            "target_role": "Full Stack Developer"
        }
        
        success, response = self.run_test(
            "ATS Analysis",
            "POST",
            "analyze/ats",
            200,
            data=data,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success and 'ats_score' in response:
            print(f"   ATS Score: {response.get('ats_score', 'N/A')}")
            print(f"   Matching Skills: {len(response.get('matching_skills', []))}")
            return True
        return False

    def test_resume_optimization(self, resume_text):
        """Test resume optimization"""
        data = {
            "resume_text": resume_text or "Full Stack Developer with 5 years of experience in React, Node.js, Python, MongoDB, AWS. Built 10+ production applications.",
            "job_description": "Looking for Senior Full Stack Developer with React, Node.js, Docker, Kubernetes, CI/CD experience. Must have 5+ years experience."
        }
        
        success, response = self.run_test(
            "Resume Optimization",
            "POST",
            "analyze/optimize",
            200,
            data=data,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success and 'optimization_score' in response:
            print(f"   Optimization Score: {response.get('optimization_score', 'N/A')}")
            print(f"   Improvements: {len(response.get('experience_improvements', []))}")
            return True
        return False

    def test_history(self):
        """Test analysis history"""
        success, response = self.run_test(
            "Get History",
            "GET",
            "history",
            200,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success:
            analyses = response if isinstance(response, list) else []
            print(f"   Found {len(analyses)} analyses in history")
            return True
        return False

    def test_pdf_export(self):
        """Test PDF export"""
        if not self.analysis_id:
            print("❌ No analysis ID available for PDF export")
            return False
            
        success, response = self.run_test(
            "PDF Export",
            "POST",
            f"export/pdf/{self.analysis_id}",
            200,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success:
            print(f"   PDF generated successfully")
            return True
        return False

    def test_delete_analysis(self):
        """Test analysis deletion"""
        if not self.analysis_id:
            print("❌ No analysis ID available for deletion")
            return False
            
        success, response = self.run_test(
            "Delete Analysis",
            "DELETE",
            f"history/{self.analysis_id}",
            200,
            headers={'Authorization': f'Bearer {self.session_token}'}
        )
        
        if success:
            print(f"   Analysis deleted successfully")
            return True
        return False

def main():
    print("🚀 Starting SkillMirror AI Backend API Tests")
    print("=" * 50)
    
    tester = SkillMirrorAPITester()
    
    # Setup test user and session
    if not tester.setup_test_user():
        print("❌ Failed to setup test user, stopping tests")
        return 1
    
    # Test authentication
    if not tester.test_auth_me():
        print("❌ Authentication failed, stopping tests")
        return 1
    
    # Test resume upload
    resume_text = tester.test_resume_upload()
    
    # Test analysis endpoints
    tester.test_process_analysis(resume_text)
    tester.test_ats_analysis(resume_text)
    tester.test_resume_optimization(resume_text)
    
    # Test history and export
    tester.test_history()
    tester.test_pdf_export()
    tester.test_delete_analysis()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Backend API Test Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())