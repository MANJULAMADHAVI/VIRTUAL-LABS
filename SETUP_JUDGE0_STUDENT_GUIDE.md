# Judge0 API Setup Instructions for Students

## What is Judge0?
Judge0 is an online code execution platform that runs your code safely on remote servers. JNTUA Labs uses Judge0 to execute Python, JavaScript, Java, C, and C++ code.

## Why do I need an API key?
Judge0 uses API keys to manage usage and prevent abuse. Each student/user needs their own key.

## Get Your Free API Key (2 minutes)

### Step 1: Sign Up on RapidAPI
1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce
2. Click **"Sign Up"** (top right)
3. Choose a username/email
4. Verify your email

### Step 2: Subscribe to Judge0 (Free)
1. On the Judge0 API page, click **"Subscribe"**
2. Select the **"Free"** plan
3. Click **"Subscribe"**
4. You should see a success message

### Step 3: Find Your API Key
1. Look for **"API Key"** in your dashboard
2. It's usually in the header section
3. Click **"Copy"** to copy it

### Step 4: Configure in JNTUA Labs
1. Open JNTUA Labs in your browser: http://localhost:8000/jntu.html
2. Press **F12** to open Developer Console
3. Paste this in the console:
```javascript
localStorage.setItem("judge0_key", "PASTE_YOUR_KEY_HERE")
```
4. Replace `PASTE_YOUR_KEY_HERE` with your actual API key
5. Press **Enter**
6. **Refresh the page** (Ctrl+R or F5)

### Step 5: Test It!
1. Go to **Code Editor**
2. Write some simple code:
```python
print("Hello from Judge0!")
```
3. Click **"Run Code"**
4. You should see output appear in the Terminal

**That's it! Your Judge0 integration is ready!** 🎉

---

## Free Plan Details

| Limit | Amount |
|-------|--------|
| Requests/Month | 5,000 |
| Requests/Day | ~166 |
| Memory | 128 MB |
| CPU Time | 5 seconds |
| Concurrent | Limited |

**Sufficient for:** Learning and practice coding

---

## If It Doesn't Work

### 1. "API Key Missing or Invalid"
- Copy your API key again from RapidAPI
- Run this in console:
```javascript
localStorage.setItem("judge0_key", "YOUR_CORRECT_KEY")
```
- Refresh the page

### 2. "Rate limit reached"
- You've used your free tier limit
- Wait until next month
- Or upgrade your RapidAPI plan

### 3. "Network Error"
- Check your internet connection
- Verify API key is set
- Try again in a moment

### 4. Still not working?
- Contact your JNTUA Labs admin
- Include error message from browser console

---

## Security Tips

✅ **DO:**
- Keep your API key private
- Don't share it with others
- Don't post it online
- Don't commit it to git

❌ **DON'T:**
- Share your key on social media
- Upload key to public repositories
- Give key to unauthorized people
- Leave key in unprotected files

---

## After Setup

Once configured, you can:
- ✅ Write code in Python, JavaScript, Java, C, C++
- ✅ Click "Run Code" to execute
- ✅ See output in real-time
- ✅ Get error messages if code fails
- ✅ Use stdin for program input
- ✅ Submit code for grading

---

## Test Your Setup

Try this Python code to verify:
```python
# Simple program to test
numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
average = total / len(numbers)

print(f"Numbers: {numbers}")
print(f"Sum: {total}")
print(f"Average: {average}")
```

**Expected output:**
```
Numbers: [1, 2, 3, 4, 5]
Sum: 15
Average: 3.0
```

---

## Supported Languages

| Language | Version | Compile Time | Execution |
|----------|---------|--------------|-----------|
| Python   | 3.8+    | Instant      | ~1 sec    |
| JavaScript | Node.js | Instant      | ~1 sec    |
| Java     | 14      | ~1 sec       | ~1 sec    |
| C        | GCC 9.2 | ~1 sec       | ~1 sec    |
| C++      | G++ 9.2 | ~1 sec       | ~1 sec    |

---

## Next Steps

1. ✅ Set up Judge0 API key
2. ✅ Test with simple code
3. ✅ Solve lab assignments
4. ✅ Submit code for grading
5. ✅ Get feedback from instructors

---

## Questions?

Contact JNTUA Labs support or your course instructor.

**Happy Coding!** 🎓✨
