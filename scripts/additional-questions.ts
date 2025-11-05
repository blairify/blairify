/**
 * Additional 500 Questions - Part of Massive Question Bank
 * Import and merge with main questions array
 */

export const additionalQuestions = [
  // ==================== ALGORITHMS (150 more) ====================
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Valid Palindrome",
    question:
      "Check if a string is a palindrome, considering only alphanumeric characters and ignoring cases.",
    answer:
      "Two pointers approach: left starts at beginning, right at end. Skip non-alphanumeric chars. Compare characters case-insensitively. Move pointers inward until they meet. O(n) time, O(1) space. Alternative: reverse string and compare, but uses O(n) space.",
    topicTags: ["strings", "two-pointers", "palindrome"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiMicrosoft",
    companySize: ["faang"],
    primaryTechStack: ["java"],
    title: "First Unique Character",
    question:
      "Find the first non-repeating character in a string. Return its index or -1 if none exists.",
    answer:
      "Use HashMap to count character frequencies. First pass: build frequency map. Second pass: find first character with count 1. O(n) time, O(1) space (max 26 letters). Alternative: use array of size 26 for lowercase letters only.",
    topicTags: ["strings", "hash-map", "frequency"],
    seniorityLevel: ["junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Group Anagrams",
    question:
      "Given array of strings, group anagrams together. ['eat','tea','tan','ate','nat','bat'] → [['eat','tea','ate'],['tan','nat'],['bat']]",
    answer:
      "Use HashMap with sorted string as key. For each word: sort characters, use as key, add original word to list. O(n * k log k) where k is max string length. Alternative: use character count array as key for O(n * k) time.",
    topicTags: ["strings", "hash-map", "sorting", "anagrams"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiMeta",
    companySize: ["faang"],
    primaryTechStack: ["javascript"],
    title: "Longest Substring Without Repeating",
    question:
      "Find length of longest substring without repeating characters. 'abcabcbb' → 3 ('abc')",
    answer:
      "Sliding window with HashSet. Expand window by moving right pointer, add characters to set. On duplicate: shrink window from left until duplicate removed. Track max length. O(n) time, O(min(n,m)) space where m is charset size.",
    topicTags: ["strings", "sliding-window", "hash-set"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Minimum Window Substring",
    question:
      "Find minimum window in S that contains all characters of T. S='ADOBECODEBANC', T='ABC' → 'BANC'",
    answer:
      "Sliding window with two HashMaps. Expand window until all chars found. Contract from left while maintaining all chars. Track minimum window. O(|S| + |T|) time, O(|S| + |T|) space. Use counters for required and formed characters.",
    topicTags: ["strings", "sliding-window", "hash-map", "hard"],
    seniorityLevel: ["senior"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiApple",
    companySize: ["faang"],
    primaryTechStack: ["swift"],
    title: "Two Sum",
    question:
      "Find two numbers in array that add up to target. Return indices. [2,7,11,15], target=9 → [0,1]",
    answer:
      "Use HashMap to store value → index mapping. For each number, check if (target - number) exists in map. If yes, return indices. If no, add current number to map. O(n) time, O(n) space. One-pass solution.",
    topicTags: ["arrays", "hash-map", "two-sum"],
    seniorityLevel: ["entry", "junior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiNetflix",
    companySize: ["large"],
    primaryTechStack: ["java"],
    title: "Three Sum",
    question:
      "Find all unique triplets that sum to zero. [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]",
    answer:
      "Sort array first. Fix first element, use two pointers for remaining two. Skip duplicates to avoid duplicate triplets. O(n²) time, O(1) space excluding output. For each i, find pairs that sum to -nums[i].",
    topicTags: ["arrays", "two-pointers", "sorting"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "hard",
    companyLogo: "SiGoogle",
    companySize: ["faang"],
    primaryTechStack: ["cpp"],
    title: "Trapping Rain Water",
    question:
      "Given elevation map, compute how much water can be trapped after raining. [0,1,0,2,1,0,1,3,2,1,2,1] → 6",
    answer:
      "Two approaches: 1) Two pointers - track left_max and right_max, move pointer with smaller max. O(n) time, O(1) space. 2) Precompute max heights from left and right. For each position: water = min(left_max, right_max) - height. O(n) time and space.",
    topicTags: ["arrays", "two-pointers", "dynamic-programming"],
    seniorityLevel: ["senior"],
  },
  {
    category: "algorithms",
    difficulty: "medium",
    companyLogo: "SiLinkedin",
    companySize: ["large"],
    primaryTechStack: ["java"],
    title: "Longest Consecutive Sequence",
    question:
      "Find length of longest consecutive elements sequence in unsorted array. [100,4,200,1,3,2] → 4 (sequence: 1,2,3,4)",
    answer:
      "Use HashSet for O(1) lookups. For each number, check if it's start of sequence (num-1 not in set). If yes, count consecutive numbers. O(n) time despite nested loop (each number visited at most twice), O(n) space.",
    topicTags: ["arrays", "hash-set", "sequences"],
    seniorityLevel: ["mid"],
  },
  {
    category: "algorithms",
    difficulty: "easy",
    companyLogo: "SiAmazon",
    companySize: ["faang"],
    primaryTechStack: ["python"],
    title: "Valid Parentheses",
    question:
      "Check if string with brackets is valid. '()[]{}' → true, '([)]' → false",
    answer:
      "Use stack. For opening bracket: push to stack. For closing bracket: check if stack top matches, pop if yes. Valid if stack empty at end. O(n) time, O(n) space. Handle edge cases: empty string (valid), unmatched brackets.",
    topicTags: ["strings", "stack", "parentheses"],
    seniorityLevel: ["junior"],
  },
];
