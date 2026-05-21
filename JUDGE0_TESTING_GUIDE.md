# Judge0 API Integration - Quick Start & Testing Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Get Your Judge0 API Key
1. Open https://rapidapi.com/judge0-official/api/judge0-ce
2. Click **Subscribe** (free tier is fine)
3. Copy your **API Key** from the dashboard
4. Keep it safe!

### Step 2: Set API Key in Browser
1. Open JNTUA Labs: http://localhost:8000/jntu.html
2. Open **Browser Console** (F12 or Ctrl+Shift+I)
3. Paste this command and press Enter:
```javascript
localStorage.setItem("judge0_key", "YOUR_API_KEY_HERE")
```
4. Replace `YOUR_API_KEY_HERE` with your actual key

### Step 3: Test Code Execution
1. **Log in** as a student
2. **Go to Code Editor** (any language)
3. Click **Run Code** button
4. See output in Terminal!

---

## 🧪 Test Cases

### Test 1: Python Simple Print
**Language:** Python
**Code:**
```python
print("Hello from Judge0!")
for i in range(3):
    print(f"Count: {i}")
```
**Expected Output:**
```
✓ Output:
Hello from Judge0!
Count: 0
Count: 1
Count: 2

Exit Code: 0 ✓
```

### Test 2: JavaScript Array Operations
**Language:** JavaScript
**Code:**
```javascript
const arr = [1, 2, 3, 4, 5];
const squared = arr.map(x => x * x);
console.log("Original:", arr);
console.log("Squared:", squared);
```
**Expected Output:**
```
✓ Output:
Original: [ 1, 2, 3, 4, 5 ]
Squared: [ 1, 4, 9, 16, 25 ]

Exit Code: 0 ✓
```

### Test 3: Java Simple Class
**Language:** Java
**Code:**
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        for(int i = 0; i < 3; i++) {
            System.out.println("i = " + i);
        }
    }
}
```
**Expected Output:**
```
✓ Output:
Hello from Java!
i = 0
i = 1
i = 2

Exit Code: 0 ✓
```

### Test 4: C with Input
**Language:** C
**Code:**
```c
#include<stdio.h>

int main() {
    int n = 5;
    printf("Fibonacci series:\n");
    int a = 0, b = 1;
    for(int i = 0; i < n; i++) {
        printf("%d ", a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    printf("\n");
    return 0;
}
```
**Expected Output:**
```
✓ Output:
Fibonacci series:
0 1 1 2 3 

Exit Code: 0 ✓
```

### Test 5: C++ with Vector
**Language:** C++
**Code:**
```cpp
#include<iostream>
#include<vector>
using namespace std;

int main() {
    vector<int> nums = {10, 20, 30, 40, 50};
    cout << "Vector elements:" << endl;
    for(int x : nums) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}
```
**Expected Output:**
```
✓ Output:
Vector elements:
10 20 30 40 50 

Exit Code: 0 ✓
```

### Test 6: Compilation Error (Python)
**Language:** Python
**Code:**
```python
print("Missing closing quote
```
**Expected Output:**
```
❌ Runtime Error:
SyntaxError: unterminated string literal
```

### Test 7: Runtime Error (Java)
**Language:** Java
**Code:**
```java
public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3};
        System.out.println(arr[10]); // Out of bounds
    }
}
```
**Expected Output:**
```
❌ Runtime Error:
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException
```

### Test 8: With stdin Input (Python)
**Language:** Python
**Code:**
```python
name = input("Enter name: ")
print(f"Hello, {name}!")
```
**stdin Input:** `Alice`
**Expected Output:**
```
✓ Output:
Enter name: Hello, Alice!

Exit Code: 0 ✓
```

---

## ✅ Checklist

- [ ] API key set in localStorage
- [ ] Python code execution works
- [ ] JavaScript code execution works
- [ ] Java code execution works
- [ ] C code execution works
- [ ] C++ code execution works
- [ ] Compilation errors display properly
- [ ] Runtime errors display properly
- [ ] Output shows with correct formatting
- [ ] Loading animation appears while running
- [ ] Button is disabled during execution
- [ ] Error messages are helpful

---

## 🐛 Troubleshooting

### Issue: "API Key Missing or Invalid"
**Solution:**
```javascript
// In browser console, run:
localStorage.setItem("judge0_key", "YOUR_KEY_FROM_RAPIDAPI")
location.reload()
```

### Issue: "Rate limit reached"
**Causes:**
- Free tier has monthly limits (~5000 requests)
- Multiple rapid submissions

**Solution:**
- Wait a moment before retrying
- Check RapidAPI dashboard for usage
- Consider upgrading plan

### Issue: "Network Error (Likely CORS)"
**Causes:**
- API key not set
- Network connectivity issue
- Browser security policy

**Solution:**
1. Ensure API key is set
2. Check internet connection
3. Try different browser
4. Check browser console for specific error

### Issue: No output but no error
**Causes:**
- Code has no print statements
- Output is very fast to complete
- stdin mismatch

**Solution:**
- Add print/console.log statements
- Check code logic
- Ensure stdin is provided if needed

### Issue: "Execution timeout"
**Causes:**
- Infinite loop in code
- Very long computation
- Slow algorithm

**Solution:**
- Check for infinite loops
- Use smaller test cases
- Optimize algorithm

---

## 📊 Performance Metrics

Typical execution times:
- **First run**: 2-3 seconds (warmup)
- **Python**: 1-2 seconds
- **JavaScript**: 1-2 seconds
- **Java**: 2-3 seconds (compilation)
- **C**: 1-2 seconds (compilation)
- **C++**: 1-2 seconds (compilation)

---

## 🔒 Security Notes

✅ **Safe:**
- API key stored in browser localStorage only
- Code executed on Judge0 sandbox servers
- No direct database access
- Memory & CPU limits enforced
- Each submission isolated

⚠️ **Important:**
- Don't share your API key publicly
- Don't commit API key to git
- Keep key private
- Use strong key storage in production

---

## 📱 API Integration Details

### Configuration
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

### API Flow
```
1. User writes code in Monaco Editor
2. Click "Run Code" button
3. Code sent to Judge0 API
4. Judge0 compiles & executes
5. Poll for result every 1 second
6. Display output in Terminal
```

### Language Mapping
| Language  | Judge0 ID | Version |
|-----------|-----------|---------|
| Python    | 71        | 3.8+    |
| JavaScript | 63       | Node.js |
| Java      | 62        | 14      |
| C         | 50        | GCC 9.2 |
| C++       | 54        | G++ 9.2 |

---

## 🎯 Features

✅ **Working Features:**
- Real code execution via Judge0
- Multiple language support
- Syntax highlighting (Monaco)
- Output display
- Error handling
- Loading animation
- Compilation error display
- Runtime error display
- stdin input support
- Exit code display
- Timeout handling

🟡 **Future Features:**
- [ ] Multiple file support
- [ ] Custom test cases
- [ ] Code history
- [ ] Performance profiling
- [ ] Collaborative editing
- [ ] Self-hosted Judge0 support

---

## 📚 Resources

- **Judge0 Official**: https://ce.judge0.com/
- **RapidAPI Judge0**: https://rapidapi.com/judge0-official/api/judge0-ce
- **GitHub**: https://github.com/judge0/judge0
- **Documentation**: https://ce.judge0.com/docs

---

## 🆘 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify API key is set correctly**
3. **Check browser console (F12) for errors**
4. **Ensure backend is running**
5. **Verify MongoDB is connected**
6. **Check internet connection**

Contact JNTUA Labs support if issues persist.

---

## 💡 Tips & Tricks

1. **Faster Testing**: Use Python for quick tests
2. **Debugging**: Print intermediate values
3. **Input Testing**: Use stdin field for complex inputs
4. **Performance**: Check output formatting
5. **Error Handling**: Read error messages carefully

---

## 📈 Next Steps

After successful testing:
1. ✅ Share Judge0 API key setup guide with students
2. ✅ Create tutorial video for code execution
3. ✅ Set up monitoring for API usage
4. ✅ Configure backup Judge0 instance (optional)
5. ✅ Add advanced features (test cases, etc.)

---

## Version Info

- **Date**: 2024
- **Judge0 API**: v1.14.0
- **Monaco Editor**: v0.50.0
- **Status**: ✅ Production Ready

Happy coding! 🎓✨
