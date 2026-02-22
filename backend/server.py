from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import io
from PyPDF2 import PdfReader
from emergentintegrations.llm.chat import LlmChat, UserMessage
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Profile fields
    skill_mirror_id: Optional[str] = None
    profile_completed: bool = False
    university: Optional[str] = None
    course: Optional[str] = None
    prn_number: Optional[str] = None
    graduation_year: Optional[int] = None
    country: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

class ProfileCompletionRequest(BaseModel):
    full_name: str
    university: str
    course: str
    prn_number: str
    graduation_year: int
    country: str
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionResponse(BaseModel):
    user: User
    session_token: str

class Analysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    analysis_id: str
    user_id: str
    resume_text: str
    job_description: str
    linkedin_profile: Optional[str] = None
    result: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisRequest(BaseModel):
    resume_text: str
    job_description: str
    linkedin_profile: Optional[str] = None

class ATSAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str

class ResumeOptimizerRequest(BaseModel):
    resume_text: str
    job_description: str

# Helper Functions
async def get_user_from_session(session_token: Optional[str] = Cookie(None)) -> Optional[User]:
    """Get user from session token"""
    if not session_token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)

async def create_gemini_analysis(resume_text: str, job_description: str, linkedin_profile: Optional[str] = None) -> Dict[str, Any]:
    """Create AI analysis using Gemini"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"analysis_{uuid.uuid4().hex[:8]}",
            system_message="You are an expert career analyst and resume optimizer. Analyze resumes and provide detailed insights in clean JSON format only."
        )
        chat.with_model("gemini", "gemini-3-pro-preview")
        
        linkedin_context = f"\n\nLinkedIn Profile: {linkedin_profile}" if linkedin_profile else ""
        
        prompt = f"""Analyze this resume against the job description and provide detailed career insights.

Resume:
{resume_text}

Job Description:
{job_description}{linkedin_context}

Provide your analysis in this EXACT JSON format (return only valid JSON, no markdown, no extra text):
{{
  "resumeSkills": [list of skills from resume],
  "jobSkills": [list of skills required in job],
  "matchedSkills": [skills that match between resume and job],
  "missingSkills": [skills required but missing from resume],
  "matchScore": number between 0-100,
  "careerFieldSuggestions": [suggested career fields],
  "strengthsSummary": "brief summary of strengths",
  "weaknessesSummary": "brief summary of weaknesses",
  "suggestedProjects": [project suggestions to fill gaps],
  "certificationRecommendations": [relevant certifications],
  "salaryInsight": "salary range insight",
  "jobLevelFit": "Junior/Mid/Senior",
  "ATSScore": number between 0-100,
  "30DayRoadmap": [
    {{"week": 1, "tasks": ["task1", "task2"]}},
    {{"week": 2, "tasks": ["task1", "task2"]}},
    {{"week": 3, "tasks": ["task1", "task2"]}},
    {{"week": 4, "tasks": ["task1", "task2"]}}
  ]
}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Clean response and parse JSON
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        logger.error(f"Gemini analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

async def create_ats_analysis(resume_text: str, target_role: str) -> Dict[str, Any]:
    """Create ATS analysis for specific role"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ats_{uuid.uuid4().hex[:8]}",
            system_message="You are an ATS (Applicant Tracking System) expert. Analyze resumes for keyword optimization and ATS compatibility."
        )
        chat.with_model("gemini", "gemini-3-pro-preview")
        
        prompt = f"""Analyze this resume for ATS compatibility for a {target_role} role.

Resume:
{resume_text}

Target Role: {target_role}

Provide analysis in this EXACT JSON format (return only valid JSON):
{{
  "ats_score": number between 0-100,
  "matching_skills": [list of matching keywords],
  "missing_skills": [list of missing critical keywords],
  "remove_suggestions": [list of irrelevant content to remove],
  "improvement_tips": [list of specific improvement suggestions],
  "summary_feedback": "overall feedback summary",
  "keyword_density": "assessment of keyword usage",
  "weak_sections": [list of sections needing improvement]
}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        logger.error(f"ATS analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")

async def create_resume_optimization(resume_text: str, job_description: str) -> Dict[str, Any]:
    """Create resume optimization suggestions"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"optimize_{uuid.uuid4().hex[:8]}",
            system_message="You are a professional resume writer. Provide optimization suggestions using simple, clear language."
        )
        chat.with_model("gemini", "gemini-3-pro-preview")
        
        prompt = f"""Optimize this resume for the job description. Provide suggestions in simple language.

Resume:
{resume_text}

Job Description:
{job_description}

Provide optimization in this EXACT JSON format (return only valid JSON):
{{
  "optimized_summary": "improved professional summary",
  "optimized_skills": ["skill 1", "skill 2"],
  "experience_improvements": [
    {{"original": "original bullet", "improved": "improved bullet", "reason": "why it's better"}}
  ],
  "missing_keywords": ["keyword1", "keyword2"],
  "remove_items": ["irrelevant item 1"],
  "overall_tips": ["tip 1", "tip 2"],
  "optimization_score": number between 0-100
}}"""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        logger.error(f"Resume optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Resume optimization failed: {str(e)}")

def generate_pdf_report(analysis_data: Dict[str, Any], user_name: str) -> io.BytesIO:
    """Generate professional PDF report"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#6366f1',
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor='#6366f1',
        spaceBefore=20,
        spaceAfter=10
    )
    
    story = []
    
    # Title
    story.append(Paragraph("Professional Career Analysis Report", title_style))
    story.append(Paragraph(f"Candidate: {user_name}", styles['Normal']))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Scores
    story.append(Paragraph("Score Summary", heading_style))
    story.append(Paragraph(f"Match Score: {analysis_data.get('matchScore', 'N/A')}%", styles['Normal']))
    story.append(Paragraph(f"ATS Score: {analysis_data.get('ATSScore', 'N/A')}%", styles['Normal']))
    story.append(Paragraph(f"Job Level Fit: {analysis_data.get('jobLevelFit', 'N/A')}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Skills
    story.append(Paragraph("Skills Analysis", heading_style))
    if 'matchedSkills' in analysis_data:
        story.append(Paragraph(f"<b>Matched Skills:</b> {', '.join(analysis_data['matchedSkills'])}", styles['Normal']))
    if 'missingSkills' in analysis_data:
        story.append(Paragraph(f"<b>Missing Skills:</b> {', '.join(analysis_data['missingSkills'])}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Strengths and Weaknesses
    story.append(Paragraph("Profile Assessment", heading_style))
    story.append(Paragraph(f"<b>Strengths:</b> {analysis_data.get('strengthsSummary', 'N/A')}", styles['Normal']))
    story.append(Paragraph(f"<b>Areas for Improvement:</b> {analysis_data.get('weaknessesSummary', 'N/A')}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Career Insights
    story.append(Paragraph("Career Insights", heading_style))
    story.append(Paragraph(f"<b>Salary Range:</b> {analysis_data.get('salaryInsight', 'N/A')}", styles['Normal']))
    if 'careerFieldSuggestions' in analysis_data:
        story.append(Paragraph(f"<b>Career Fields:</b> {', '.join(analysis_data['careerFieldSuggestions'])}", styles['Normal']))
    story.append(Spacer(1, 0.2*inch))
    
    # Recommendations
    if 'certificationRecommendations' in analysis_data:
        story.append(Paragraph("Recommended Certifications", heading_style))
        for cert in analysis_data['certificationRecommendations']:
            story.append(Paragraph(f"• {cert}", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
    
    if 'suggestedProjects' in analysis_data:
        story.append(Paragraph("Suggested Projects", heading_style))
        for project in analysis_data['suggestedProjects']:
            story.append(Paragraph(f"• {project}", styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
    
    # 30-Day Roadmap
    if '30DayRoadmap' in analysis_data:
        story.append(Paragraph("30 Day Career Roadmap", heading_style))
        for week_data in analysis_data['30DayRoadmap']:
            story.append(Paragraph(f"<b>Week {week_data['week']}</b>", styles['Normal']))
            for task in week_data['tasks']:
                story.append(Paragraph(f"• {task}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

# Auth Routes
@api_router.post("/auth/session", response_model=SessionResponse)
async def create_session(session_id: str, response: Response):
    """Exchange session_id for user data and set cookie"""
    import httpx
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            resp.raise_for_status()
            session_data = resp.json()
        
        # Create or update user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": session_data["name"],
                    "picture": session_data.get("picture")
                }}
            )
        else:
            user_doc = {
                "user_id": user_id,
                "email": session_data["email"],
                "name": session_data["name"],
                "picture": session_data.get("picture"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        # Create session
        session_token = session_data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7*24*60*60,
            path="/"
        )
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        return SessionResponse(user=User(**user), session_token=session_token)
        
    except Exception as e:
        logger.error(f"Session creation error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@api_router.get("/auth/me", response_model=User)
async def get_current_user(session_token: Optional[str] = Cookie(None)):
    """Get current user from session"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Analysis Routes
@api_router.post("/analyze/upload")
async def upload_resume(
    file: UploadFile = File(...),
    session_token: Optional[str] = Cookie(None)
):
    """Upload resume and extract text"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        
        return {"resume_text": text}
    except Exception as e:
        logger.error(f"PDF extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF")

@api_router.post("/analyze/process")
async def process_analysis(
    request: AnalysisRequest,
    session_token: Optional[str] = Cookie(None)
):
    """Process full career analysis"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await create_gemini_analysis(
        request.resume_text,
        request.job_description,
        request.linkedin_profile
    )
    
    # Save analysis
    analysis_id = f"analysis_{uuid.uuid4().hex[:12]}"
    analysis_doc = {
        "analysis_id": analysis_id,
        "user_id": user.user_id,
        "resume_text": request.resume_text,
        "job_description": request.job_description,
        "linkedin_profile": request.linkedin_profile,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.analyses.insert_one(analysis_doc)
    
    return {"analysis_id": analysis_id, "result": result}

@api_router.post("/analyze/ats")
async def analyze_ats(
    request: ATSAnalysisRequest,
    session_token: Optional[str] = Cookie(None)
):
    """Analyze ATS score for target role"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await create_ats_analysis(request.resume_text, request.target_role)
    
    # Save ATS analysis
    analysis_id = f"ats_{uuid.uuid4().hex[:12]}"
    analysis_doc = {
        "analysis_id": analysis_id,
        "user_id": user.user_id,
        "resume_text": request.resume_text,
        "target_role": request.target_role,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ats_analyses.insert_one(analysis_doc)
    
    return result

@api_router.post("/analyze/optimize")
async def optimize_resume(
    request: ResumeOptimizerRequest,
    session_token: Optional[str] = Cookie(None)
):
    """Optimize resume for job description"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await create_resume_optimization(request.resume_text, request.job_description)
    
    # Save optimization
    optimization_id = f"opt_{uuid.uuid4().hex[:12]}"
    optimization_doc = {
        "optimization_id": optimization_id,
        "user_id": user.user_id,
        "resume_text": request.resume_text,
        "job_description": request.job_description,
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resume_optimizations.insert_one(optimization_doc)
    
    return result

@api_router.get("/history")
async def get_history(session_token: Optional[str] = Cookie(None)):
    """Get user's analysis history"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    analyses = await db.analyses.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return analyses

@api_router.delete("/history/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Delete an analysis"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    result = await db.analyses.delete_one({
        "analysis_id": analysis_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"message": "Analysis deleted"}

@api_router.post("/export/pdf/{analysis_id}")
async def export_pdf(
    analysis_id: str,
    session_token: Optional[str] = Cookie(None)
):
    """Export analysis as PDF"""
    user = await get_user_from_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    analysis = await db.analyses.find_one(
        {"analysis_id": analysis_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    pdf_buffer = generate_pdf_report(analysis["result"], user.name)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=career_analysis_{analysis_id}.pdf"}
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
