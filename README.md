# 2025_IITM_Winner_School_HandsOn


# 🚀 Install Node.js and Run Your First Program

This guide will help you:

- Install **Node.js**
- Verify the installation
- Run your first program called **Hello, World**

Works for both **Linux** and **macOS**.

---

## 📘 Node.js Installation Manual

This manual provides step-by-step instructions to install Node.js on:

- Linux
- macOS

It also includes verification steps and optional installation using NVM (Node Version Manager).

---

### 🔗 Official References

| Resource | Link |
|----------|------|
| Node.js Homepage | https://nodejs.org |
| Download Page (Installers & Binaries) | https://nodejs.org/en/download |
| Node.js Documentation | https://nodejs.org/en/learn |
| npm Documentation | https://docs.npmjs.com |

---

## 🐧 Installing Node.js on Linux

### ✔️ Option A: Install Using NodeSource (Recommended)

This method installs the latest stable LTS version.

1) Update System Packages:
```sh
sudo apt update && sudo apt upgrade -y
```

2) Install curl (if not installed):
```sh
sudo apt install curl -y
```

3) Add NodeSource Repository:
```sh
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```

4) Install Node.js:
```sh
sudo apt install -y nodejs
```

5) Verify Installation:
```sh
node -v
npm -v
```

---

## 🍏 Installing Node.js on macOS

### ✔️ Option A: Install Using Homebrew (Recommended)

1) Install Homebrew (if not installed):
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2) Install Node.js:
```sh
brew install node
```

3) Verify Installation:
```sh
node -v
npm -v
```

---

### ✔️ Option B: Install from Official Installer (GUI)

1. Download installer:  
   👉 https://nodejs.org/en/download

2. Follow installation steps:
- Open the `.pkg` file
- Accept license agreement
- Install
- Close installer

3. Verify:
```sh
node -v
npm -v
```

---

## 🧪 Post-Installation Test

To test Node.js is working, run:

```sh
echo "console.log('Node.js setup successful')" > test.js
node test.js
```

Expected output:

```
Node.js setup successful
```

🎉 Congratulations — Node.js and npm are now installed successfully!

---

---

# 🧪 First Node.js Program — "Hello, World"

In this exercise, you will:

1. Create a folder using File Manager / Finder
2. Create a JavaScript file named `helloworld.js`
3. Run the file using Node.js from the Terminal

---

## 1️⃣ Create a Folder

Create a folder named:

```
helloworld
```

Then open the folder.

---

## 2️⃣ Create the JavaScript File

Inside the folder, create a file named:

```
helloworld.js
```

Add the following content:

```js
console.log("Hello, World!");
```

Save the file.

---

## 3️⃣ Open Terminal and Navigate to the Folder

Run:

```sh
cd ~/helloworld
```

Examples:

```sh
cd /Users/<yourname>/Desktop/helloworld
```

or

```sh
cd /home/<yourname>/helloworld
```

---

## 4️⃣ Run the Program

Execute:

```sh
node helloworld.js
```

---

### ✅ Expected Output

```
Hello, World!
```

🎉 Success! You just ran your first Node.js program.

---

## 📌 Summary

| Task | Method |
|------|--------|
| Create folder | File Explorer / Finder |
| Create file | Any text editor |
| Run program | Terminal: `node helloworld.js` |

---

🎉 You are now ready to explore more features of Node.js!
