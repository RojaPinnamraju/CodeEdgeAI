# CodeEdgeAI

A modern coding platform with AI-powered tutoring, featuring a Python code editor, real-time code execution, and interactive AI assistance.

## Features

- **Python Code Editor**: Write and edit Python code with syntax highlighting
- **Real-time Code Execution**: Run your code and see results instantly
- **AI-Powered Tutoring**: Get help from an AI tutor with different modes:
  - Debug Help: Get guidance on fixing code issues
  - Step-by-Step Explanation: Learn how to approach problems
  - Study Concepts: Understand programming concepts
- **Interactive Problem Solving**: Generate coding challenges and get guided help
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

## Tech Stack

- **Frontend**:
  - React
  - TailwindCSS
  - Monaco Editor
- **Backend**:
  - Python Flask
  - GroqAI API
  - LangChain for structured AI tutoring

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/CodeEdgeAI.git
   cd CodeEdgeAI
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
   Create a `.env` file in the backend directory with your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

4. **Run the Application**:
   - Start the backend server:
     ```bash
     cd backend
     python3 app.py
     ```
   - Start the frontend development server:
     ```bash
     cd frontend
     npm start
     ```

5. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Code Editor**:
   - Write Python code in the editor
   - Click "Run Code" to execute
   - View output in the results panel

2. **AI Tutor**:
   - Select a tutoring mode:
     - Debug Help: For fixing code issues
     - Step-by-Step Explanation: For detailed guidance
     - Study Concepts: For learning concepts
   - Ask questions about your code
   - Get interactive guidance and help

3. **Problem Solving**:
   - Click "Generate Question" for a new challenge
   - Get step-by-step guidance from the AI tutor
   - Practice solving problems with interactive help

## AI Tutoring Modes

1. **Debug Help**:
   - Get guidance on fixing code issues
   - Learn debugging techniques
   - Understand error messages

2. **Step-by-Step Explanation**:
   - Break down problems into manageable steps
   - Learn problem-solving approaches
   - Understand implementation details

3. **Study Concepts**:
   - Learn programming concepts
   - Understand data structures and algorithms
   - Get practice recommendations
