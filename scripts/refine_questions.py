#!/usr/bin/env python3
"""
Question Bank Refinement Script - ENHANCED VERSION
Refines question banks with improved keyword matching.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any

# Available positions
VALID_POSITIONS = [
    "frontend", "backend", "fullstack", "devops", "mobile",
    "data-engineer", "data-scientist", "cybersecurity"
]

# Company types (all should be included)
ALL_COMPANY_TYPES = ["faang", "startup", "enterprise"]

# Interview types
INTERVIEW_TYPES = ["regular", "practice", "flash", "teacher", "competitive"]


def should_include_entry(question: Dict[str, Any]) -> bool:
    """
    Determine if 'entry' should be added to seniority levels.
    Entry-level for basic, foundational concepts.
    """
    difficulty = question.get("difficulty", "")
    seniority_levels = question.get("seniorityLevels", [])
    
    # If difficulty is "entry", definitely include it
    if difficulty == "entry":
        return True
    
    # If it's junior difficulty and has foundational keywords in description/title
    if difficulty == "junior":
        title = question.get("title", "").lower()
        description = question.get("description", "").lower()
        combined = f"{title} {description}"
        
        # Foundational keywords
        foundational_keywords = [
            "what is", "define", "explain", "basic", "introduction",
            "fundamental", "difference between", "how does", "describe"
        ]
        
        if any(keyword in combined for keyword in foundational_keywords):
            return True
    
    return False


def expand_positions(question: Dict[str, Any]) -> List[str]:
    """
    Expand positions array based on the question content and current positions.
    """
    current_positions = set(question.get("positions", []))
    topic = question.get("topic", "")
    title = question.get("title", "").lower()
    description = question.get("description", "").lower()
    tags = [tag.lower() for tag in question.get("tags", [])]
    combined = f"{title} {description} {' '.join(tags)}".lower()
    
    # Security topics - MORE COMPREHENSIVE
    security_keywords = [
        "cors", "csrf", "xss", "authentication", "authorization", 
        "security", "oauth", "jwt", "token", "encryption", "ssl", "tls",
        "session", "cookie", "auth", "password", "hash", "bcrypt",
        "injection", "sql injection", "sanitize", "validate input",
        "secure", "vulnerability", "attack", "threat"
    ]
    if any(keyword in combined for keyword in security_keywords):
        current_positions.update(["fullstack", "backend", "cybersecurity"])
    
    # Database/ORM topics - MORE COMPREHENSIVE
    db_keywords = [
        "database", "sql", "nosql", "orm", "entity framework", 
        "query", "migration", "schema", "mongo", "postgres", "mysql", 
        "redis", "table", "index", "dbcontext", "dbset", "relational",
        "non-relational", "acid", "transaction", "db", "data storage",
        "persistence", "repository", "data access", "sqlite", "mariadb",
        "firebase", "firestore", "dynamodb", "cassandra", "couchdb",
        "constraint", "foreign key", "primary key", "join", "query builder"
    ]
    if any(keyword in combined for keyword in db_keywords):
        current_positions.update(["backend", "data-engineer"])
        if "fullstack" not in current_positions and "backend" in current_positions:
            current_positions.add("fullstack")
    
    # API development
    api_keywords = ["api", "rest", "graphql", "endpoint", "http", "request", "response"]
    if any(keyword in combined for keyword in api_keywords):
        current_positions.update(["fullstack", "backend"])
    
    # Frontend-specific
    frontend_keywords = ["razor", "tag helper", "view component", "css", "html", 
                        "dom", "browser", "ui", "frontend", "react", "vue", "angular",
                        "component", "jsx", "tsx", "styling", "layout"]
    if any(keyword in combined for keyword in frontend_keywords):
        current_positions.update(["frontend", "fullstack"])
    
    # DevOps topics
    devops_keywords = ["docker", "kubernetes", "ci/cd", "deployment", "infrastructure",
                      "terraform", "ansible", "jenkins", "pipeline", "container",
                      "orchestration", "k8s", "helm", "devops"]
    if any(keyword in combined for keyword in devops_keywords):
        current_positions.add("devops")
    
    # Mobile topics
    mobile_keywords = ["ios", "android", "mobile", "flutter", "react native", 
                      "swift", "kotlin", "app", "mobile app"]
    if any(keyword in combined for keyword in mobile_keywords):
        current_positions.add("mobile")
    
    # Data science/ML
    ds_keywords = ["machine learning", "ml", "neural network", "statistics", 
                   "analytics", "data science", "model", "training", "prediction",
                   "ai", "artificial intelligence", "deep learning"]
    if any(keyword in combined for keyword in ds_keywords):
        current_positions.add("data-scientist")
    
    # Based on topic
    if topic == "fullstack":
        current_positions.update(["fullstack", "backend"])
    elif topic == "frontend":
        current_positions.update(["frontend", "fullstack"])
    elif topic == "backend":
        current_positions.update(["backend", "fullstack"])
    
    # Ensure at least one position
    if not current_positions:
        # Default to fullstack if we can't determine
        current_positions.add("fullstack")
    
    # Return sorted list
    return sorted(list(current_positions))


def should_add_competitive(question: Dict[str, Any]) -> bool:
    """
    Determine if 'competitive' should be added to interview types.
    - All senior level questions
    - Mid level questions with mid difficulty that cover advanced topics
    """
    seniority_levels = question.get("seniorityLevels", [])
    difficulty = question.get("difficulty", "")
    
    # All senior questions
    if "senior" in seniority_levels:
        return True
    
    # Mid level with mid difficulty
    if "mid" in seniority_levels and difficulty == "mid":
        return True
    
    return False


def refine_question(question: Dict[str, Any]) -> Dict[str, Any]:
    """
    Refine a single question according to the rules.
    """
    # 1. Seniority Level Refinement
    seniority_levels = question.get("seniorityLevels", [])
    if should_include_entry(question) and "entry" not in seniority_levels:
        if "entry" not in seniority_levels:
            seniority_levels.insert(0, "entry")
    question["seniorityLevels"] = seniority_levels
    
    # 2. Position Assignment
    question["positions"] = expand_positions(question)
    
    # 3. Interview Type Assignment
    interview_types = question.get("interviewTypes", [])
    if should_add_competitive(question) and "competitive" not in interview_types:
        interview_types.append("competitive")
    question["interviewTypes"] = interview_types
    
    # 4. Company Type Standardization
    # Always set to all three company types
    question["companyType"] = ALL_COMPANY_TYPES
    
    return question


def process_question_bank(file_path: Path) -> tuple[int, int, int]:
    """
    Process a single question bank file.
    Returns (total_questions, modified_questions, error_count)
    """
    print(f"\n📄 Processing: {file_path.name}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        total_questions = 0
        modified_questions = 0
        
        # Process open questions
        if "open_questions" in data:
            for i, question in enumerate(data["open_questions"]):
                total_questions += 1
                original = json.dumps(question, sort_keys=True)
                refined = refine_question(question)
                data["open_questions"][i] = refined
                
                if json.dumps(refined, sort_keys=True) != original:
                    modified_questions += 1
        
        # Process MCQ questions
        if "mcq_questions" in data:
            for i, question in enumerate(data["mcq_questions"]):
                total_questions += 1
                original = json.dumps(question, sort_keys=True)
                refined = refine_question(question)
                data["mcq_questions"][i] = refined
                
                if json.dumps(refined, sort_keys=True) != original:
                    modified_questions += 1
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Total: {total_questions} | Modified: {modified_questions}")
        return total_questions, modified_questions, 0
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return 0, 0, 1


def main():
    """Main execution function."""
    print("=" * 80)
    print("🔧 Question Bank Refinement Script - ENHANCED VERSION")
    print("=" * 80)
    
    # Get the questions directory
    script_dir = Path(__file__).parent
    questions_dir = script_dir / "questions"
    
    if not questions_dir.exists():
        print(f"❌ Questions directory not found: {questions_dir}")
        return
    
    # Get all JSON files
    json_files = list(questions_dir.glob("*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {questions_dir}")
        return
    
    print(f"\n📊 Found {len(json_files)} question bank files")
    
    # Process all files
    total_qs = 0
    total_modified = 0
    total_errors = 0
    
    for json_file in sorted(json_files):
        qs, mod, err = process_question_bank(json_file)
        total_qs += qs
        total_modified += mod
        total_errors += err
    
    # Summary
    print("\n" + "=" * 80)
    print("📈 SUMMARY")
    print("=" * 80)
    print(f"Files processed: {len(json_files)}")
    print(f"Total questions: {total_qs}")
    print(f"Modified questions: {total_modified}")
    print(f"Errors: {total_errors}")
    
    print("\n" + "=" * 80)
    print("✨ Done!")
    print("=" * 80)


if __name__ == "__main__":
    main()
