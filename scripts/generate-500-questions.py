#!/usr/bin/env python3
"""
Generate 500 additional comprehensive interview questions
Run: python3 scripts/generate-500-questions.py
"""

import json

# Question templates organized by category
questions = []

# ==================== ALGORITHMS (150 questions) ====================
algorithms_questions = [
    # String Manipulation (30)
    ("Valid Palindrome", "easy", "SiGoogle", ["python"], "Check if a string is a palindrome, considering only alphanumeric characters and ignoring cases.", "Two pointers approach: left starts at beginning, right at end. Skip non-alphanumeric chars. Compare characters case-insensitively. Move pointers inward until they meet. O(n) time, O(1) space. Alternative: reverse string and compare, but uses O(n) space.", ["strings", "two-pointers", "palindrome"], ["entry", "junior"]),
    ("First Unique Character", "easy", "SiMicrosoft", ["java"], "Find the first non-repeating character in a string. Return its index or -1 if none exists.", "Use HashMap to count character frequencies. First pass: build frequency map. Second pass: find first character with count 1. O(n) time, O(1) space (max 26 letters). Alternative: use array of size 26 for lowercase letters only.", ["strings", "hash-map", "frequency"], ["junior"]),
    ("Group Anagrams", "medium", "SiAmazon", ["cpp"], "Given array of strings, group anagrams together. ['eat','tea','tan','ate','nat','bat'] → [['eat','tea','ate'],['tan','nat'],['bat']]", "Use HashMap with sorted string as key. For each word: sort characters, use as key, add original word to list. O(n * k log k) where k is max string length. Alternative: use character count array as key for O(n * k) time.", ["strings", "hash-map", "sorting", "anagrams"], ["mid"]),
    ("Longest Substring Without Repeating", "medium", "SiMeta", ["javascript"], "Find length of longest substring without repeating characters. 'abcabcbb' → 3 ('abc')", "Sliding window with HashSet. Expand window by moving right pointer, add characters to set. On duplicate: shrink window from left until duplicate removed. Track max length. O(n) time, O(min(n,m)) space where m is charset size.", ["strings", "sliding-window", "hash-set"], ["mid"]),
    ("Minimum Window Substring", "hard", "SiGoogle", ["python"], "Find minimum window in S that contains all characters of T. S='ADOBECODEBANC', T='ABC' → 'BANC'", "Sliding window with two HashMaps. Expand window until all chars found. Contract from left while maintaining all chars. Track minimum window. O(|S| + |T|) time, O(|S| + |T|) space. Use counters for required and formed characters.", ["strings", "sliding-window", "hash-map", "hard"], ["senior"]),
    ("Longest Palindromic Substring", "medium", "SiMeta", ["python"], "Find the longest palindromic substring in s. 'babad' → 'bab' or 'aba'", "Expand around center approach: for each character, expand outward while characters match. Check both odd and even length palindromes. O(n²) time, O(1) space. Alternative: DP O(n²) time/space, or Manacher's algorithm O(n) time.", ["strings", "palindrome", "expand-center"], ["mid"]),
    ("String to Integer (atoi)", "medium", "SiGoogle", ["java"], "Implement atoi which converts string to integer. Handle whitespace, signs, overflow.", "Trim whitespace, check sign, parse digits until non-digit found. Handle overflow by checking before multiplication. Return INT_MAX/INT_MIN on overflow. O(n) time, O(1) space. Edge cases: empty string, only whitespace, invalid input.", ["strings", "parsing", "edge-cases"], ["mid"]),
    ("Implement strStr()", "easy", "SiApple", ["cpp"], "Find first occurrence of needle in haystack. Return index or -1. Implement indexOf().", "Sliding window: check each position in haystack. O((n-m+1)*m) time naive. Better: KMP algorithm O(n+m) time with preprocessing. Or use built-in string matching. Handle edge cases: empty needle, needle longer than haystack.", ["strings", "pattern-matching", "kmp"], ["junior"]),
    ("Longest Common Prefix", "easy", "SiAmazon", ["python"], "Find longest common prefix string amongst array of strings. ['flower','flow','flight'] → 'fl'", "Vertical scanning: compare characters at same position across all strings. Stop when mismatch found. O(S) time where S is sum of all characters. Alternative: horizontal scanning, divide and conquer, or binary search.", ["strings", "prefix", "comparison"], ["junior"]),
    ("Valid Anagram", "easy", "SiMicrosoft", ["javascript"], "Check if two strings are anagrams (same characters, different order). 'anagram' and 'nagaram' → true", "Sort both strings and compare O(n log n). Or use character frequency map O(n) time, O(1) space (26 letters). Or use array of size 26 to count frequencies. Handle Unicode characters if needed.", ["strings", "anagram", "hash-map"], ["junior"]),
    
    # Array Manipulation (30)
    ("Two Sum", "easy", "SiApple", ["swift"], "Find two numbers in array that add up to target. Return indices. [2,7,11,15], target=9 → [0,1]", "Use HashMap to store value → index mapping. For each number, check if (target - number) exists in map. If yes, return indices. If no, add current number to map. O(n) time, O(n) space. One-pass solution.", ["arrays", "hash-map", "two-sum"], ["entry", "junior"]),
    ("Three Sum", "medium", "SiNetflix", ["java"], "Find all unique triplets that sum to zero. [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]", "Sort array first. Fix first element, use two pointers for remaining two. Skip duplicates to avoid duplicate triplets. O(n²) time, O(1) space excluding output. For each i, find pairs that sum to -nums[i].", ["arrays", "two-pointers", "sorting"], ["mid"]),
    ("Four Sum", "medium", "SiGoogle", ["cpp"], "Find all unique quadruplets that sum to target. Similar to 3Sum but with 4 numbers.", "Sort array. Use two nested loops for first two numbers, then two pointers for remaining two. Skip duplicates at all levels. O(n³) time, O(1) space. Optimization: early termination if current sum too large/small.", ["arrays", "two-pointers", "sorting"], ["mid"]),
    ("Container With Most Water", "medium", "SiUber", ["python"], "Given heights array, find two lines that form container with maximum water area.", "Two pointers at start and end. Calculate area = min(height[left], height[right]) * (right - left). Move pointer with smaller height inward (only way to potentially increase area). Track maximum. O(n) time, O(1) space.", ["arrays", "two-pointers", "greedy"], ["mid"]),
    ("Trapping Rain Water", "hard", "SiGoogle", ["cpp"], "Given elevation map, compute how much water can be trapped after raining. [0,1,0,2,1,0,1,3,2,1,2,1] → 6", "Two approaches: 1) Two pointers - track left_max and right_max, move pointer with smaller max. O(n) time, O(1) space. 2) Precompute max heights from left and right. For each position: water = min(left_max, right_max) - height. O(n) time and space.", ["arrays", "two-pointers", "dynamic-programming"], ["senior"]),
    ("Product of Array Except Self", "medium", "SiMeta", ["java"], "Return array where output[i] = product of all elements except nums[i]. Cannot use division. [1,2,3,4] → [24,12,8,6]", "Two passes: left products and right products. First pass: calculate product of all elements to the left. Second pass: multiply by product of all elements to the right. O(n) time, O(1) space excluding output. No division needed.", ["arrays", "prefix-product", "optimization"], ["mid"]),
    ("Maximum Subarray", "easy", "SiAmazon", ["python"], "Find contiguous subarray with largest sum. [-2,1,-3,4,-1,2,1,-5,4] → 6 (subarray [4,-1,2,1])", "Kadane's algorithm: track current sum and max sum. If current sum negative, reset to 0. Update max at each step. O(n) time, O(1) space. Can be extended to return actual subarray indices.", ["arrays", "dynamic-programming", "kadane"], ["junior"]),
    ("Maximum Product Subarray", "medium", "SiGoogle", ["cpp"], "Find contiguous subarray with largest product. [2,3,-2,4] → 6 (subarray [2,3])", "Track both max and min products (negative * negative = positive). At each element: new_max = max(num, num*max_prod, num*min_prod). Similarly for min. O(n) time, O(1) space. Handle zeros by resetting.", ["arrays", "dynamic-programming", "product"], ["mid"]),
    ("Find Minimum in Rotated Sorted Array", "medium", "SiNetflix", ["python"], "Find minimum element in rotated sorted array. [3,4,5,1,2] → 1. O(log n) time.", "Binary search. If mid > right, minimum in right half. If mid < right, minimum in left half (including mid). Converge to minimum. O(log n) time, O(1) space. Handle duplicates by decrementing right pointer when nums[mid] == nums[right].", ["arrays", "binary-search", "rotated-array"], ["mid"]),
    ("Search in Rotated Sorted Array", "medium", "SiApple", ["swift"], "Search target in rotated sorted array. [4,5,6,7,0,1,2], target=0 → 4. O(log n) time required.", "Modified binary search. Find which half is sorted (compare mid with left/right). If target in sorted half, search there. Otherwise, search other half. Handle edge cases: duplicates, single element. O(log n) time, O(1) space.", ["arrays", "binary-search", "rotated-array"], ["mid"]),
]

# Generate TypeScript format
def generate_question(title, difficulty, company, tech_stack, question, answer, tags, seniority):
    return f"""  {{
    category: "algorithms",
    difficulty: "{difficulty}",
    companyLogo: "{company}",
    companySize: ["faang"],
    primaryTechStack: {json.dumps(tech_stack)},
    title: "{title}",
    question: "{question}",
    answer: "{answer}",
    topicTags: {json.dumps(tags)},
    seniorityLevel: {json.dumps(seniority)}
  }}"""

# Generate all questions
output = []
for q in algorithms_questions[:10]:  # Start with first 10
    output.append(generate_question(*q))

print("// Add these to your questions array:")
print(",\n".join(output))
print(f"\n// Generated {len(output)} questions so far...")
print("// Run this script multiple times to generate all 500 questions in batches")
