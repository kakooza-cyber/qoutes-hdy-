#!/bin/bash

# Create project structure
mkdir -p android/{app/src/main/{java/com/quotesapp,res/{values,drawable}},gradle/wrapper}
mkdir -p .github/workflows

# Make gradlew executable
chmod +x android/gradlew

echo "✅ Project structure created!"

# Install dependencies
echo "Installing npm dependencies..."
npm install

echo "✅ Setup complete!"
echo "Run 'npm start' to start the development server"
echo "Run 'npm run android' to run on Android"
