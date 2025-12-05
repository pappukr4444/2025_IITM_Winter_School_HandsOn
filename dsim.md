############################################################
# CHECK OR INSTALL: Node.js
############################################################
(command -v node >/dev/null && echo "✔ Node.js installed: $(node -v)") || (
  echo "❌ Node.js missing — installing Node.js LTS via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  source ~/.nvm/nvm.sh
  nvm install --lts
  echo "✔ Node.js installed: $(node -v)"
)


############################################################
# CHECK OR INSTALL: npm  (auto-installed with Node.js)
############################################################
(command -v npm >/dev/null && echo "✔ npm installed: $(npm -v)") || (
  echo "❌ npm missing — installing Node.js LTS (npm included)..."
  source ~/.nvm/nvm.sh
  nvm install --lts
  echo "✔ npm installed: $(npm -v)"
)


############################################################
# CHECK OR INSTALL: nodemon
############################################################
(command -v nodemon >/dev/null && echo "✔ nodemon installed") || (
  echo "❌ nodemon missing — installing globally..."
  npm install -g nodemon
  echo "✔ nodemon installed"
)


############################################################
# CHECK OR INSTALL: nvm
############################################################
(command -v nvm >/dev/null && echo "✔ nvm installed") || (
  echo "❌ nvm missing — installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  echo "✔ nvm installed — reload your terminal or run: source ~/.nvm/nvm.sh"
)



# 1. Install required dependencies for framework
cd framework
npm install
cd ..


# 2. Install nodemon globally (required for runNodes.js)
npm install -g nodemon

# Changing Number of Nodes
Go to framework/helper_modules/data.json where change the number = 8 (the number of nodes you wish)

# go to runMultipleTests

1. node generateNodes.js
2. npx nodemon runNodes.js
