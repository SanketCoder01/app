"""
Backend API Tests for SkillMirror AI
Tests: Auth endpoints, PDF upload, ATS analysis, Resume optimization
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicEndpoints:
    """Basic health and endpoint availability tests"""
    
    def test_api_base_accessible(self):
        """Test that API base is accessible"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        # Should return 401 (not authenticated) not 404 or 500
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: API base accessible, auth endpoint returns 401 for unauthenticated")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_register_endpoint_exists(self):
        """Test that register endpoint exists and validates input"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "contact_number": "1234567890",
            "email": "test_invalid_email",  # Invalid email format
            "password": "testpass123"
        })
        # Should return 422 (validation error) for invalid email
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print(f"SUCCESS: Register endpoint validates email format")
    
    def test_register_valid_format(self):
        """Test registration with valid format (expects email confirmation message)"""
        import uuid
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "contact_number": "1234567890",
            "email": test_email,
            "password": "testpass123"
        })
        # Should return 200 with email confirmation message or 400 if already registered
        assert response.status_code in [200, 400], f"Expected 200 or 400, got {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "message" in data
            assert "email" in data["message"].lower() or "confirm" in data["message"].lower()
            print(f"SUCCESS: Registration returns email confirmation message")
        else:
            print(f"INFO: Registration returned 400 (possibly already registered)")
    
    def test_login_endpoint_exists(self):
        """Test that login endpoint exists and validates input"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid_email",
            "password": "testpass"
        })
        # Should return 422 for invalid email format
        assert response.status_code == 422, f"Expected 422 for invalid email, got {response.status_code}"
        print(f"SUCCESS: Login endpoint validates email format")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        # Should return 401 for invalid credentials
        assert response.status_code == 401, f"Expected 401 for invalid credentials, got {response.status_code}"
        print(f"SUCCESS: Login returns 401 for invalid credentials")
    
    def test_logout_endpoint_exists(self):
        """Test that logout endpoint exists"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        # Should return 200 even without auth
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data
        print(f"SUCCESS: Logout endpoint works")


class TestProtectedEndpoints:
    """Tests for protected endpoints (require authentication)"""
    
    def test_upload_requires_auth(self):
        """Test that upload endpoint requires authentication"""
        # Create a simple test file
        files = {'file': ('test.pdf', b'%PDF-1.4 test content', 'application/pdf')}
        response = requests.post(f"{BASE_URL}/api/analyze/upload", files=files)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: Upload endpoint requires authentication")
    
    def test_ats_analysis_requires_auth(self):
        """Test that ATS analysis endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/analyze/ats", json={
            "resume_text": "Test resume content",
            "target_role": "Software Engineer"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: ATS analysis endpoint requires authentication")
    
    def test_optimize_requires_auth(self):
        """Test that optimize endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/analyze/optimize", json={
            "resume_text": "Test resume content",
            "job_description": "Test job description"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: Optimize endpoint requires authentication")
    
    def test_history_requires_auth(self):
        """Test that history endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/history")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: History endpoint requires authentication")
    
    def test_profile_complete_requires_auth(self):
        """Test that profile completion endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/profile/complete", json={
            "full_name": "Test User",
            "university": "Test University",
            "course": "Computer Science",
            "prn_number": "12345",
            "graduation_year": 2025,
            "country": "India"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"SUCCESS: Profile completion endpoint requires authentication")


class TestPDFUploadWithAuth:
    """Tests for PDF upload with authentication (if we can get a valid token)"""
    
    @pytest.fixture
    def test_pdf_path(self):
        """Path to test PDF file"""
        return "/tmp/test_resume.pdf"
    
    def test_pdf_file_exists(self, test_pdf_path):
        """Verify test PDF file exists"""
        assert os.path.exists(test_pdf_path), f"Test PDF not found at {test_pdf_path}"
        print(f"SUCCESS: Test PDF file exists at {test_pdf_path}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
