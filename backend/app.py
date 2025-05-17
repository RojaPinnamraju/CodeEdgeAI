from groq import Groq
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import sys
import traceback
from tutor import get_tutor_response
from collections import defaultdict
import random

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS for production
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://*.netlify.app",  # Allow all Netlify deployments
            "https://codeedgeai.netlify.app"  # Your main Netlify domain
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Groq client
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Store conversation history for each user
conversation_history = defaultdict(list)

# Store user progress
user_progress = defaultdict(lambda: {
    'easy_solved': 0,
    'medium_solved': 0,
    'hard_solved': 0,
    'current_difficulty': 'easy',
    'concepts_mastered': set()
})

# Define system prompts for different categories and concepts
system_prompts = {
    'data_structures': {
        'arrays': {
            'easy': """Generate an original coding problem about arrays (1D arrays, 2D arrays, array manipulation). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate an original coding problem about arrays (array sorting, searching, matrix operations). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate an original coding problem about arrays (complex array operations, advanced matrix problems). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints."""
        },
        'linked_lists': {
            'easy': """Generate a problem about linked lists (basic operations, traversal). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about linked lists (node manipulation, cycle detection). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about linked lists (complex operations, advanced algorithms). Include a clear problem title, description, examples, and constraints."""
        },
        'stacks': {
            'easy': """Generate a problem about stacks (basic operations, LIFO). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about stacks (complex operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about stacks (advanced applications, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'queues': {
            'easy': """Generate a problem about queues (basic operations, FIFO). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about queues (priority queues, circular queues). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about queues (advanced queue types, applications). Include a clear problem title, description, examples, and constraints."""
        },
        'hash_tables': {
            'easy': """Generate a problem about hash tables (basic operations, collision handling). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about hash tables (advanced operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about hash tables (complex applications, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'graphs': {
            'easy': """Generate a problem about graphs (basic operations, representations). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about graphs (traversal, path finding). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about graphs (complex algorithms, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'trees': {
            'easy': """Generate a problem about trees (basic operations, traversal). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about trees (binary trees, BST operations). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about trees (self-balancing trees, advanced operations). Include a clear problem title, description, examples, and constraints."""
        },
        'heaps': {
            'easy': """Generate a problem about heaps (basic operations, heapify). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about heaps (priority queues, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about heaps (complex operations, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'tries': {
            'easy': """Generate a problem about tries (basic operations, string handling). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about tries (advanced operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about tries (complex applications, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'segment_trees': {
            'easy': """Generate a problem about segment trees (basic operations, range queries). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about segment trees (advanced operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about segment trees (complex operations, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'fenwick_trees': {
            'easy': """Generate a problem about Fenwick trees (basic operations, prefix sums). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about Fenwick trees (advanced operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about Fenwick trees (complex operations, optimization). Include a clear problem title, description, examples, and constraints."""
        },
        'disjoint_set': {
            'easy': """Generate a problem about disjoint set union (basic operations, union-find). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about disjoint set union (advanced operations, applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about disjoint set union (complex operations, optimization). Include a clear problem title, description, examples, and constraints."""
        }
    },
    'algorithms': {
        'sorting': {
            'easy': """Generate an original coding problem about sorting algorithms (bubble sort, counting sort). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate an original coding problem about sorting algorithms (quick sort, merge sort). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate an original coding problem about sorting algorithms (radix sort, advanced sorting). The problem should be unique and not copied from any existing platforms. Include a clear problem title, description, examples, and constraints."""
        },
        'searching': {
            'easy': """Generate a problem about searching algorithms (linear search). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about searching algorithms (binary search). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about searching algorithms (advanced searching). Include a clear problem title, description, examples, and constraints."""
        },
        'divide_conquer': {
            'easy': """Generate a problem about divide and conquer algorithms (basic applications). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about divide and conquer algorithms (advanced applications). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about divide and conquer algorithms (complex applications). Include a clear problem title, description, examples, and constraints."""
        },
        'greedy': {
            'easy': """Generate a problem about greedy algorithms (basic applications). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about greedy algorithms (interval scheduling, knapsack). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about greedy algorithms (complex applications). Include a clear problem title, description, examples, and constraints."""
        },
        'dynamic_programming': {
            'easy': """Generate a problem about dynamic programming (basic applications). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about dynamic programming (knapsack, LCS). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about dynamic programming (complex applications). Include a clear problem title, description, examples, and constraints."""
        },
        'graph_algorithms': {
            'easy': """Generate a problem about graph algorithms (BFS, DFS). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about graph algorithms (Dijkstra, Bellman-Ford). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about graph algorithms (Floyd-Warshall, MST). Include a clear problem title, description, examples, and constraints."""
        },
        'string_algorithms': {
            'easy': """Generate a problem about string algorithms (basic operations). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about string algorithms (KMP, pattern matching). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about string algorithms (complex applications). Include a clear problem title, description, examples, and constraints."""
        },
        'number_theory': {
            'easy': """Generate a problem about number theory (basic concepts). Include a clear problem title, description, examples, and constraints.""",
            'medium': """Generate a problem about number theory (Sieve of Eratosthenes). Include a clear problem title, description, examples, and constraints.""",
            'hard': """Generate a problem about number theory (complex applications). Include a clear problem title, description, examples, and constraints."""
        }
    }
}

# Define problem categories and their descriptions
problem_categories = {
    'arrays_and_hashing': 'Problems involving array manipulation, hash maps, and frequency counting',
    'two_pointers': 'Problems solved using two pointer technique for array/string manipulation',
    'sliding_window': 'Problems involving fixed or variable size window over arrays/strings',
    'stack': 'Problems requiring LIFO operations and stack-based solutions',
    'binary_search': 'Problems involving searching in sorted arrays or binary search trees',
    'linked_list': 'Problems involving linked list manipulation and traversal',
    'trees': 'Problems involving binary trees, BST, and tree traversal',
    'tries': 'Problems involving prefix trees and string operations',
    'heap_priority_queue': 'Problems requiring heap data structure and priority queues',
    'backtracking': 'Problems involving recursive backtracking and state space exploration',
    'graphs': 'Problems involving graph traversal, BFS, DFS, and basic graph algorithms',
    'advanced_graphs': 'Complex graph problems involving shortest paths, MST, and topological sort',
    '1d_dynamic_programming': 'One-dimensional dynamic programming problems',
    '2d_dynamic_programming': 'Two-dimensional dynamic programming and matrix problems',
    'greedy': 'Problems solved using greedy algorithms and local optimization',
    'intervals': 'Problems involving interval merging, scheduling, and range queries',
    'math_and_geometry': 'Problems involving mathematical concepts and geometric algorithms',
    'bit_manipulation': 'Problems involving bitwise operations and binary manipulation'
}

def get_problem_prompt(category, difficulty):
    return f"""Generate an original coding problem focusing on {category}.
Category Description: {problem_categories[category]}
Difficulty: {difficulty}

The problem should:
1. Have a clear, descriptive title
2. Include a detailed problem description
3. Provide 2-3 example test cases with input and expected output
4. Include appropriate constraints and edge cases
5. Focus on the core concepts of {category}
6. Be solvable in Python
7. Have a clear, unambiguous solution approach
8. Be educational and help users learn the concept
9. Be completely original and not copied from any existing platforms
10. ALWAYS verify that the expected outputs are correct and consistent with the problem description
11. Test all examples before including them in the problem statement
12. Ensure the examples follow the exact same rules as described in the problem
13. For each example:
    - First write the solution
    - Then run the solution with the example input
    - Verify the output matches the expected output
    - Only include the example if the output is correct
14. If any example's output doesn't match, either:
    - Fix the example to match the actual output
    - Or fix the solution to match the expected output
15. Make sure all examples are consistent with each other

Format the response as:
Title: [Problem Title]

Description:
[Problem description]

Examples:
Input: [example input]
Output: [example output]
Explanation: [detailed explanation of how the output was calculated]

Constraints:
[Problem constraints]"""

def get_next_question(user_id, category=None):
    if category:
        # Generate a new question for this category
        prompt = get_problem_prompt(category, 'medium')  # Default to medium difficulty
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Generate a new problem. Make sure to test all examples and verify the outputs are correct. For each example, first write and test the solution, then include the example only if the output matches."}
            ],
            model="llama3-70b-8192",
            temperature=0.8,
            max_tokens=500
        )
        return {
            'title': completion.choices[0].message.content.split('\n')[0].replace('Title: ', ''),
            'content': completion.choices[0].message.content,
            'category': category,
            'difficulty': 'medium'
        }
    
    # If no category specified, randomly select one
    category = random.choice(list(problem_categories.keys()))
    prompt = get_problem_prompt(category, 'medium')
    completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Generate a new problem."}
        ],
        model="llama3-70b-8192",
        temperature=0.8,
        max_tokens=500
    )
    return {
        'title': completion.choices[0].message.content.split('\n')[0].replace('Title: ', ''),
        'content': completion.choices[0].message.content,
        'category': category,
        'difficulty': 'medium'
    }

@app.route('/api/welcome', methods=['POST'])
def welcome():
    data = request.json
    message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful welcome agent for a portfolio website."},
                {"role": "user", "content": message}
            ],
            model="llama-3.3-70b-versatile",
        )
        return jsonify({"response": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/project', methods=['POST'])
def project():
    data = request.json
    message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful project agent for a portfolio website."},
                {"role": "user", "content": message}
            ],
            model="llama-3.3-70b-versatile",
        )
        return jsonify({"response": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/career', methods=['POST'])
def career():
    data = request.json
    message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful career agent for a portfolio website."},
                {"role": "user", "content": message}
            ],
            model="llama-3.3-70b-versatile",
        )
        return jsonify({"response": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/client', methods=['POST'])
def client_route():
    data = request.json
    message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful business advisor agent for a portfolio website."},
                {"role": "user", "content": message}
            ],
            model="llama-3.3-70b-versatile",
        )
        return jsonify({"response": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/research', methods=['POST'])
def research():
    data = request.json
    message = data.get('message', '')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful research agent for a portfolio website."},
                {"role": "user", "content": message}
            ],
            model="llama-3.3-70b-versatile",
        )
        return jsonify({"response": chat_completion.choices[0].message.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/run', methods=['POST'])
def run_code():
    try:
        data = request.json
        code = data.get('code', '')
        
        # Create a string buffer to capture output
        output_buffer = io.StringIO()
        sys.stdout = output_buffer
        
        # Execute the code with access to built-ins
        try:
            exec(code, {'__builtins__': __builtins__})
            output = output_buffer.getvalue()
            return jsonify({
                'success': True,
                'output': output
            })
        except Exception as e:
            error_traceback = traceback.format_exc()
            return jsonify({
                'success': False,
                'error': str(e),
                'traceback': error_traceback
            })
        finally:
            sys.stdout = sys.__stdout__
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/ai', methods=['POST'])
def ai():
    try:
        data = request.json
        problem = data.get('problem', '')
        code = data.get('code', '')
        question = data.get('question', '')
        question_type = data.get('type', 'general')
        user_id = data.get('user_id', 'default')  # Add user_id to track conversations
        
        # Get previous conversation history
        history = conversation_history[user_id]
        
        # Get response from tutor with history
        response = get_tutor_response(
            question_type=question_type,
            problem=problem,
            code=code,
            question=question,
            history=history
        )
        
        # Store the current interaction in history
        conversation_history[user_id].append({
            'question': question,
            'response': response
        })
        
        # Limit history to last 10 interactions
        if len(conversation_history[user_id]) > 10:
            conversation_history[user_id] = conversation_history[user_id][-10:]
        
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/generate-question', methods=['GET'])
def generate_question():
    try:
        user_id = request.args.get('user_id', 'default')
        category = request.args.get('category', 'data_structures')
        concept = request.args.get('concept', None)
        difficulty = request.args.get('difficulty', None)
        use_advanced = request.args.get('use_advanced', 'false').lower() == 'true'
        
        # For Code with AI page, use advanced problem generation
        if use_advanced:
            # Get the next question based on user's progress
            question = get_next_question(user_id, concept)
            if question:
                return jsonify({
                    'success': True,
                    'question': question['content'],
                    'difficulty': question['difficulty'],
                    'concept': question['category'],
                    'is_advanced': True
                })
            else:
                # If no more questions available, generate a new one
                category = random.choice(list(problem_categories.keys()))
                prompt = get_problem_prompt(category, 'medium')
                completion = client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": "Generate a new problem."}
                    ],
                    model="llama3-70b-8192",
                    temperature=0.8,
                    max_tokens=500
                )
                return jsonify({
                    'success': True,
                    'question': completion.choices[0].message.content,
                    'difficulty': 'medium',
                    'concept': category,
                    'is_advanced': True
                })
        
        # For main page, use the original system
        if concept is None:
            difficulty = user_progress[user_id]['current_difficulty']
            concepts = list(system_prompts[category].keys())
            concept = random.choice(concepts)
        
        print(f"Generating question for user {user_id} with category: {category}, concept: {concept}, difficulty: {difficulty}")
        
        prompt = system_prompts.get(category, {}).get(concept, {}).get(difficulty, system_prompts['data_structures']['arrays']['medium'])
        
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Generate a problem in the {category} category, specifically about {concept}, with {difficulty} difficulty. Include a clear problem title."}
            ],
            model="llama3-70b-8192",
            temperature=0.8,
            max_tokens=500
        )
        
        return jsonify({
            'success': True,
            'question': completion.choices[0].message.content,
            'difficulty': difficulty,
            'concept': concept,
            'is_advanced': False
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_next_difficulty(user_id):
    progress = user_progress[user_id]
    # Start with easy if no problems solved
    if progress['easy_solved'] == 0:
        return 'easy'
    # Move to medium after solving some easy problems
    elif progress['easy_solved'] > 0 and progress['medium_solved'] == 0:
        return 'medium'
    # Move to hard after solving some medium problems
    elif progress['medium_solved'] > 0 and progress['hard_solved'] == 0:
        return 'hard'
    # Once all difficulties are unlocked, randomly select difficulty
    else:
        difficulties = ['easy', 'medium', 'hard']
        weights = [0.4, 0.4, 0.2]  # 40% easy, 40% medium, 20% hard
        return random.choices(difficulties, weights=weights)[0]

def update_user_progress(user_id, difficulty):
    progress = user_progress[user_id]
    if difficulty == 'easy':
        progress['easy_solved'] += 1
    elif difficulty == 'medium':
        progress['medium_solved'] += 1
    elif difficulty == 'hard':
        progress['hard_solved'] += 1
    progress['current_difficulty'] = get_next_difficulty(user_id)

@app.route('/update-progress', methods=['POST'])
def update_progress():
    try:
        data = request.json
        user_id = data.get('user_id', 'default')
        difficulty = data.get('difficulty', 'easy')
        
        # Update progress
        update_user_progress(user_id, difficulty)
        
        return jsonify({
            'success': True,
            'current_difficulty': user_progress[user_id]['current_difficulty'],
            'progress': {
                'easy_solved': user_progress[user_id]['easy_solved'],
                'medium_solved': user_progress[user_id]['medium_solved'],
                'hard_solved': user_progress[user_id]['hard_solved']
            }
        })
    except Exception as e:
        print(f"Error updating progress: {str(e)}")  # Add logging
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False) 