#!/usr/bin/env bash

# Clone the repository
git clone https://github.com/tobiasmidskards/mm-cli.git

# Change the directory
cd mm-cli

# Function to read user inputs
get_inputs() {
    echo "What is your email/username?"
    read username

    echo "What is your Mattermost host? (e.g. https://todo.example.com)"
    read host

    echo "What is your password?"
    read -s password  # -s option hides password input

    # Create or overwrite the .env file
    echo "MM_LOGIN_ID=$username" > .env
    echo "MM_PASSWORD=$password" >> .env
    echo "MM_HOST=$host" >> .env

    # Ask if the file is correct and show the content
    echo "Please review the following details:"
    cat .env
    echo "Are these details correct? (Y/n)"
    read correct

    # Check user's confirmation
    if [[ -z "$correct" || "$correct" =~ ^[Yy]$ ]]; then
        install_tools
    else
        get_inputs
    fi
}

# Function to install dependencies and the CLI tool
install_tools() {
    echo "Installing dependencies and the CLI tool..."
    npm install
    npm install -g .
    echo "Installation complete. You can now use the Mattermost CLI tool."
    echo "Run 'mmv' to see your tasks."
}

# Start the input loop
get_inputs
