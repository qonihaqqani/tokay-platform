# 💻 How to Use Git Commands - Step by Step

## 🎯 Where to Type the Git Commands

You have several options to open a terminal/command prompt:

### **Option 1: VS Code Terminal (Easiest) ⭐**
1. In VS Code, press **`Ctrl + ``** (Control + backtick)
2. A terminal will open at the bottom of VS Code
3. You're already in the correct folder (`tokay-platform`)

### **Option 2: Windows Command Prompt**
1. Press **`Win + R`**
2. Type `cmd` and press Enter
3. Navigate to the folder:
   ```cmd
   cd C:\Users\naqish\Documents\tokay-platform
   ```

### **Option 3: Windows PowerShell**
1. Press **`Win + X`**
2. Select "Windows PowerShell" or "Terminal"
3. Navigate to the folder:
   ```powershell
   cd C:\Users\naqish\Documents\tokay-platform
   ```

### **Option 4: Git Bash (If you installed Git for Windows)**
1. Right-click in the `tokay-platform` folder
2. Select "Git Bash Here"

## 🚀 Exact Commands to Type

Once you're in the terminal (in the `tokay-platform` folder), type these commands **one by one**:

### **Step 1: First, create the GitHub repository**
1. Go to [github.com](https://github.com) and log in
2. Click **"New repository"** (green button, top right)
3. Repository name: `tokay-platform`
4. Description: `🛡️ AI-Powered Resilience Platform for Malaysian MSMEs`
5. Make it **Public**
6. **DO NOT** check "Add a README file"
7. Click **"Create repository"**

### **Step 2: Copy the commands from GitHub**
GitHub will show you some commands. You need the ones that look like this:

```bash
git remote add origin https://github.com/qonihaqqani/tokay-platform.git
git branch -M main
git push -u origin main
```

**OR** if you're using the `master` branch (like we set up):

```bash
git remote add origin https://github.com/qonihaqqani/tokay-platform.git
git push -u origin master
```

### **Step 3: Type the commands in your terminal**

**Command 1:**
```bash
git remote add origin https://github.com/qonihaqqani/tokay-platform.git
```
Press Enter

**Command 2:**
```bash
git push -u origin master
```
Press Enter

## 🔑 What Will Happen

1. **First command**: Links your local folder to your GitHub repository
2. **Second command**: Pushes all your files (35+ files) to GitHub

You might be asked for your GitHub username and password.

## ✅ Success!

After running these commands:
- Go to your GitHub repository page
- You should see all your files beautifully organized
- **🎉 Your Tokay Platform is now on GitHub!**

## 📱 Visual Guide

```
1. Open VS Code
2. Press Ctrl + `  (opens terminal)
3. Type: git remote add origin https://github.com/qonihaqqani/tokay-platform.git
4. Press Enter
5. Type: git push -u origin master
6. Press Enter
7. Enter GitHub credentials if asked
8. 🎉 Check your GitHub repository!
```

## 🆘 Troubleshooting

### **"fatal: not a git repository" error**
- Make sure you're in the `tokay-platform` folder
- Type `cd C:\Users\naqish\Documents\tokay-platform` first

### **"Authentication failed" error**
- Make sure you created the repository on GitHub first
- Use your GitHub username and password (or personal access token)

### **"Permission denied" error**
- Make sure you're the owner of the GitHub repository
- Check that the repository name is correct

## 🎯 You're Ready!

**Your Tokay Resilience Platform is ready to be shared with the world!** 🇲🇾

Once on GitHub, you can:
- Deploy it for free using the `DEPLOYMENT-FREE.md` guide
- Share it with investors
- Collaborate with other developers
- Show it to Malaysian MSMEs

**Let's get Tokay live and help Malaysian businesses build resilience!** 🚀