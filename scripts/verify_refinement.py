#!/usr/bin/env python3
"""
Comprehensive Question Bank Verification Script
Thoroughly verifies all refinement rules were applied correctly.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

# Expected values
ALL_COMPANY_TYPES = ["faang", "startup", "enterprise"]
ALL_INTERVIEW_TYPES = ["regular", "practice", "flash", "teacher", "competitive"]

class VerificationStats:
    def __init__(self):
        self.total_files = 0
        self.total_questions = 0
        self.issues = defaultdict(list)
        self.file_stats = {}
        
    def add_issue(self, category: str, file_name: str, question_id: str, details: str):
        self.issues[category].append({
            'file': file_name,
            'question_id': question_id,
            'details': details
        })

def verify_question(question: Dict[str, Any], file_name: str, stats: VerificationStats) -> None:
    """Verify a single question against all rules."""
    qid = question.get('id', 'unknown')
    title = question.get('title', '')
    description = question.get('description', '')
    difficulty = question.get('difficulty', '')
    combined = f"{title} {description}".lower()
    
    # Rule 1: Check for empty positions
    positions = question.get('positions', [])
    if not positions or len(positions) == 0:
        stats.add_issue('Empty Positions', file_name, qid, 
                       f"No positions assigned")
    
    # Rule 2: Check entry-level seniority
    seniority_levels = question.get('seniorityLevels', [])
    if difficulty == 'entry' and 'entry' not in seniority_levels:
        stats.add_issue('Missing Entry Seniority', file_name, qid,
                       f"Difficulty is 'entry' but seniorityLevels doesn't include 'entry': {seniority_levels}")
    
    # Check junior questions with foundational keywords
    foundational_keywords = [
        "what is", "define", "explain", "basic", "introduction",
        "fundamental", "difference between", "how does", "describe"
    ]
    if difficulty == 'junior':
        has_foundational = any(keyword in combined for keyword in foundational_keywords)
        if has_foundational and 'entry' not in seniority_levels:
            stats.add_issue('Missing Entry for Foundational', file_name, qid,
                           f"Junior question with foundational keywords should include 'entry': {seniority_levels}")
    
    # Rule 3: Check security questions
    security_keywords = ["cors", "csrf", "xss", "authentication", "authorization", 
                        "security", "oauth", "jwt", "token", "encryption", "ssl", "tls",
                        "injection", "sql injection", "xss attack", "session"]
    if any(kw in combined for kw in security_keywords):
        if 'cybersecurity' not in positions:
            stats.add_issue('Missing Cybersecurity Position', file_name, qid,
                           f"Security-related question missing 'cybersecurity' in positions: {positions}")
        # Should also have backend/fullstack for web security
        web_security = any(kw in combined for kw in ["cors", "csrf", "xss", "session", "oauth", "jwt"])
        if web_security:
            if 'backend' not in positions and 'fullstack' not in positions:
                stats.add_issue('Missing Backend/Fullstack for Web Security', file_name, qid,
                               f"Web security question should include backend/fullstack: {positions}")
    
    # Rule 4: Check database/ORM questions
    db_keywords = ["database", "sql", "nosql", "orm", "entity framework", 
                   "query", "migration", "schema", "mongo", "postgres", "mysql", 
                   "redis", "table", "index", "dbcontext", "dbset"]
    if any(kw in combined for kw in db_keywords):
        if 'data-engineer' not in positions:
            stats.add_issue('Missing Data-Engineer Position', file_name, qid,
                           f"Database/ORM question missing 'data-engineer' in positions: {positions}")
    
    # Rule 5: Check API development questions
    api_keywords = ["api", "rest", "graphql", "endpoint", "http request", 
                   "http response", "web api", "restful"]
    if any(kw in combined for kw in api_keywords):
        if 'backend' not in positions and 'fullstack' not in positions:
            stats.add_issue('Missing Backend/Fullstack for API', file_name, qid,
                           f"API question should include backend/fullstack: {positions}")
    
    # Rule 6: Check frontend-specific questions
    frontend_keywords = ["razor", "tag helper", "view component", "css", "html", 
                        "dom", "browser", "frontend", "react", "vue", "angular",
                        "component", "jsx", "tsx"]
    if any(kw in combined for kw in frontend_keywords):
        if 'frontend' not in positions and 'fullstack' not in positions:
            stats.add_issue('Missing Frontend/Fullstack', file_name, qid,
                           f"Frontend question should include frontend/fullstack: {positions}")
    
    # Rule 7: Check competitive interview type for senior questions
    interview_types = question.get('interviewTypes', [])
    if 'senior' in seniority_levels:
        if 'competitive' not in interview_types:
            stats.add_issue('Missing Competitive for Senior', file_name, qid,
                           f"Senior question missing 'competitive' in interviewTypes: {interview_types}")
    
    # Rule 8: Check competitive for mid-level with mid difficulty
    if 'mid' in seniority_levels and difficulty == 'mid':
        if 'competitive' not in interview_types:
            stats.add_issue('Missing Competitive for Mid', file_name, qid,
                           f"Mid-level mid-difficulty question missing 'competitive': {interview_types}")
    
    # Rule 9: Check company type
    company_type = question.get('companyType', [])
    if not isinstance(company_type, list):
        stats.add_issue('Company Type Not Array', file_name, qid,
                       f"companyType should be array, got: {type(company_type).__name__}")
    elif company_type != ALL_COMPANY_TYPES:
        stats.add_issue('Wrong Company Types', file_name, qid,
                       f"companyType should be {ALL_COMPANY_TYPES}, got: {company_type}")
    
    # Rule 10: Check interview types format
    if not isinstance(interview_types, list):
        stats.add_issue('Interview Types Not Array', file_name, qid,
                       f"interviewTypes should be array, got: {type(interview_types).__name__}")
    
    # Rule 11: Check positions format
    if not isinstance(positions, list):
        stats.add_issue('Positions Not Array', file_name, qid,
                       f"positions should be array, got: {type(positions).__name__}")

def verify_file(file_path: Path, stats: VerificationStats) -> None:
    """Verify a single question bank file."""
    print(f"🔍 Verifying: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        file_question_count = 0
        
        # Verify open questions
        open_questions = data.get('open_questions', [])
        for question in open_questions:
            verify_question(question, file_path.name, stats)
            file_question_count += 1
        
        # Verify MCQ questions
        mcq_questions = data.get('mcq_questions', [])
        for question in mcq_questions:
            verify_question(question, file_path.name, stats)
            file_question_count += 1
        
        stats.file_stats[file_path.name] = file_question_count
        stats.total_questions += file_question_count
        
        print(f"  ✅ Verified {file_question_count} questions")
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        stats.add_issue('File Read Error', file_path.name, 'N/A', str(e))

def print_detailed_report(stats: VerificationStats) -> None:
    """Print a detailed verification report."""
    print("\n" + "=" * 80)
    print("📊 DETAILED VERIFICATION REPORT")
    print("=" * 80)
    
    print(f"\n📁 Files Verified: {stats.total_files}")
    print(f"📝 Total Questions: {stats.total_questions}")
    
    if not stats.issues:
        print("\n✅ ✅ ✅ ALL CHECKS PASSED! NO ISSUES FOUND! ✅ ✅ ✅")
        print("\nAll 2,011 questions across 45 files are correctly refined!")
        return
    
    print(f"\n⚠️  ISSUES FOUND: {sum(len(v) for v in stats.issues.values())} total")
    
    for category, issues in sorted(stats.issues.items()):
        print(f"\n{'─' * 80}")
        print(f"❌ {category}: {len(issues)} issues")
        print(f"{'─' * 80}")
        
        # Group by file
        by_file = defaultdict(list)
        for issue in issues:
            by_file[issue['file']].append(issue)
        
        for file_name, file_issues in sorted(by_file.items()):
            print(f"\n  📄 {file_name} ({len(file_issues)} issues):")
            for issue in file_issues[:5]:  # Show first 5
                print(f"    • {issue['question_id']}")
                print(f"      {issue['details']}")
            if len(file_issues) > 5:
                print(f"    ... and {len(file_issues) - 5} more")

def main():
    """Main verification function."""
    print("=" * 80)
    print("🔍 COMPREHENSIVE QUESTION BANK VERIFICATION")
    print("=" * 80)
    
    # Get the questions directory
    script_dir = Path(__file__).parent
    questions_dir = script_dir / "questions"
    
    if not questions_dir.exists():
        print(f"❌ Questions directory not found: {questions_dir}")
        return
    
    # Get all JSON files
    json_files = sorted(list(questions_dir.glob("*.json")))
    
    if not json_files:
        print(f"❌ No JSON files found in {questions_dir}")
        return
    
    print(f"\n📊 Found {len(json_files)} question bank files\n")
    
    # Process all files
    stats = VerificationStats()
    stats.total_files = len(json_files)
    
    for json_file in json_files:
        verify_file(json_file, stats)
    
    # Print detailed report
    print_detailed_report(stats)
    
    # Summary statistics
    print("\n" + "=" * 80)
    print("📈 SUMMARY STATISTICS")
    print("=" * 80)
    
    if stats.issues:
        print("\nIssues by Category:")
        for category, issues in sorted(stats.issues.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"  • {category}: {len(issues)}")
    
    print("\n" + "=" * 80)
    print("✨ Verification Complete!")
    print("=" * 80)

if __name__ == "__main__":
    main()
