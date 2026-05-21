# Judge0 API Integration Guide

## Overview
Judge0 API has been integrated with the Monaco Editor for real code execution. This enables students to run Python, C, C++, Java, and JavaScript code directly from the JNTUA Labs platform.

## Setup Instructions

### Step 1: Get Judge0 API Key (Required)

1. **Visit RapidAPI**: https://rapidapi.com/judge0-official/api/judge0-ce
2. **Click "Subscribe"** - Choose the free tier
3. **Copy your API Key** from the dashboard
4. **Store it securely**

### Step 2: Configure API Key in JNTUA Labs

#### Option A: Browser Console
```javascript
localStorage.setItem("judge0_key", "YOUR_RAPIDAPI_KEY_HERE")
```

#### Option B: Environment Setup
Create a `.env` file in backend:
```
JUDGE0_API_KEY=your_key_here
```

#### Option C: Persistent Setup (Recommended)
In JNTUA Labs settings page (to be added):
- Navigate to Settings
- Paste Judge0 API Key
- Click Save

### Step 3: Test the Integration

1. **Log in as student**
2. **Navigate to Code Editor**
3. **Write Python code:**
```python
print("Hello from Judge0!")
for i in range(5):
    print(i)
```
4. **Click "Run Code"**
5. **See output in Terminal**

## Features

### ✅ Supported Languages
- Python 3.8+
- JavaScript (Node.js)
- Java 14
- C (GCC 9.2.0)
- C++ (G++ 9.2.0)

### ✅ Real Code Execution
- Submit code to Judge0
- Automatic compilation if needed
- Real-time output display
- Error handling and display

### ✅ Loading Animation
- Spinning indicator while code runs
- "Running..." text
- Disabled button to prevent double submission

### ✅ Output Display
- Program stdout
- Compilation errors (if any)
- Runtime errors (if any)
- Exit code
- stderr output

### ✅ Error Messages
- API key errors with setup instructions
- Rate limit warnings
- Network/CORS errors
- Timeout handling

## How It Works

1. **User writes code** in Monaco Editor
2. **Clicks "Run Code"** button
3. **Code submitted to Judge0** via RapidAPI
4. **Judge0 compiles and executes** the code
5. **Result polled** every second (max 30 seconds)
6. **Output displayed** in Terminal section
7. **Errors shown** clearly with instructions

## Language ID Mapping

| Language  | Judge0 ID | Compiler |
|-----------|-----------|----------|
| Python    | 71        | Python 3.8+ |
| JavaScript | 63       | Node.js   |
| Java      | 62        | Java 14   |
| C         | 50        | GCC 9.2.0 |
| C++       | 54        | G++ 9.2.0 |

## API Configuration

```javascript
const JUDGE0_CONFIG = {
  endpoint: 'https://judge0-ce.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'x-rapidapi-key': localStorage.getItem('judge0_key') || ''
  },
  languageIds: {
    python: 71,
    javascript: 63,
    java: 62,
    c: 50,
    cpp: 54
  }
};
```

## Execution Flow

```
User Code
   ↓
Monaco Editor (capture)
   ↓
Judge0 Submission (language ID + code + stdin)
   ↓
Judge0 Queue → Compilation → Execution
   ↓
Polling (1s intervals, max 30 attempts)
   ↓
Result Retrieved (stdout, stderr, exit_code)
   ↓
Output Formatted & Displayed
```

## Timeout & Limits

- **CPU Time**: 5 seconds max per submission
- **Memory**: 128MB max
- **Polling**: 30 seconds total timeout
- **Rate Limit**: Free tier - check RapidAPI dashboard

## Troubleshooting

### ❌ "API Key Missing or Invalid"
**Solution:**
```javascript
localStorage.setItem("judge0_key", "YOUR_KEY_FROM_RAPIDAPI")
```

### ❌ "Rate limit reached"
**Solution:**
- Wait a moment before retrying
- Free tier has rate limits
- Upgrade plan on RapidAPI for higher limits
- Or self-host Judge0 instance

### ❌ "Network Error (Likely CORS)"
**Solution:**
1. Ensure API key is set
2. Check internet connection
3. Verify RapidAPI credentials are valid
4. Try alternative endpoint if available

### ❌ Code runs but no output
**Solution:**
- Ensure your code has print/output statements
- Check stderr output for hidden errors
- Verify stdin input if needed

### ⏱️ "Execution timeout"
**Solution:**
- Code took >30 seconds
- Check for infinite loops
- Use smaller datasets for testing
- Optimize algorithm

## Example Code Snippets

### Python - Sum of numbers
```python
n = int(input())
print(sum(range(1, n+1)))
```

### JavaScript - Array operations
```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.map(x => x * 2));
```

### Java - Simple program
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Judge0!");
    }
}
```

### C - Fibonacci
```c
#include<stdio.h>
int main() {
    int a=0, b=1;
    for(int i=0; i<10; i++) {
        printf("%d ", a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    return 0;
}
```

### C++ - Vector operations
```cpp
#include<iostream>
#include<vector>
using namespace std;
int main() {
    vector<int> v = {1, 2, 3, 4, 5};
    for(int x : v) cout << x << " ";
    return 0;
}
```

## API Endpoints

### Submit Code
```
POST /submissions?base64_encoded=false&wait=false
Body: {
  source_code: string,
  language_id: number,
  stdin: string,
  cpu_time_limit: 5,
  memory_limit: 128000
}
Response: { token: "string" }
```

### Get Result
```
GET /submissions/{token}?base64_encoded=false
Response: {
  stdout: string,
  stderr: string,
  compile_output: string,
  exit_code: number,
  status: { id: number, description: string }
}
```

## Status Codes

- **1**: In Queue
- **2**: Processing
- **3**: Accepted
- **4**: Wrong Answer
- **5**: Time Limit Exceeded
- **6**: Compilation Error
- **7**: Runtime Error (SIGSEGV)
- **8**: Runtime Error (SIGXFSZ)
- **9**: Runtime Error (SIGFPE)
- **10**: Runtime Error (SIGABRT)
- **11**: Runtime Error (NZEC)
- **12**: Runtime Error (Other)
- **13**: Internal Error
- **14**: Exec Format Error

## Security Considerations

- ✅ API Key stored in localStorage (user's browser)
- ✅ Code executed on Judge0 servers (isolated)
- ✅ No direct server access needed
- ✅ Each submission gets new sandbox
- ✅ Memory & CPU limits enforced
- ⚠️ Keep API key private - don't share publicly
- ⚠️ Don't commit API key to git repository

## Performance

- **First Run**: 2-3 seconds (warmup)
- **Subsequent**: 1-2 seconds average
- **Compilation**: Usually <500ms
- **Execution**: Depends on code complexity
- **Output Display**: Instant

## Limits & Quotas

### Free Tier (RapidAPI)
- **Requests/Month**: 5,000
- **Requests/Day**: ~166
- **Concurrent**: Limited
- **Cooldown**: May have rate limiting

### Recommended
- Use free tier for learning/testing
- Upgrade if running production
- Consider self-hosted Judge0 for large deployments

## Self-Hosting Judge0 (Optional)

For production deployment with unlimited usage:
```bash
# Clone Judge0
git clone https://github.com/judge0/judge0.git
cd judge0

# Setup with Docker
docker-compose up -d

# Update endpoint in JNTUA Labs
const JUDGE0_CONFIG = {
  endpoint: 'http://your-server:2358',
  // ... rest of config
};
```

## Integration Points

### CodeEditor Component
- Uses `runCode` function for execution
- Displays output in Terminal section
- Handles loading state and errors
- Maintains existing UI/UX

### Data Flow
```
Monaco Editor
    ↓
runCode() function
    ↓
Judge0 API (submission)
    ↓
Polling loop
    ↓
Result parsing
    ↓
Terminal output display
```

### State Management
- `running`: Boolean for loading state
- `output`: String for display content
- `lang`: Current language
- `code`: Current code content
- `stdin`: Program input

## Limitations

- One submission at a time (button disabled while running)
- Max 30 seconds per submission
- Max 128MB memory usage
- Max 5 seconds CPU time
- Rate limits depend on tier
- Requires internet connection

## Future Enhancements

- [ ] Multiple file support
- [ ] Custom time/memory limits
- [ ] Code history/versioning
- [ ] Collaborative code execution
- [ ] Custom test cases
- [ ] Performance profiling
- [ ] Advanced debugging
- [ ] Self-hosted Judge0 integration

## Support & Resources

- **Judge0 Docs**: https://ce.judge0.com/
- **RapidAPI Judge0**: https://rapidapi.com/judge0-official/api/judge0-ce
- **GitHub**: https://github.com/judge0/judge0
- **Community**: https://github.com/judge0/judge0/discussions

## Testing Checklist

- [ ] API key configured
- [ ] Python code execution
- [ ] JavaScript code execution
- [ ] Java code execution
- [ ] C code execution
- [ ] C++ code execution
- [ ] Error handling (syntax errors)
- [ ] Runtime error handling
- [ ] Timeout handling
- [ ] Output display formatting
- [ ] stdin input handling
- [ ] Loading animation
- [ ] Button disable during execution

## Notes

- API key is required from RapidAPI
- Free tier has rate limits
- Code is executed securely on remote servers
- All output is captured and displayed
- Errors are clearly shown to students
- Perfect for learning & practice

---

**Happy coding!** 🎓✨
