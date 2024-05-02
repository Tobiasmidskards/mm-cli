#!/usr/bin/env bash

# Clone the repository
git clone https://github.com/tobiasmidskards/mm-cli.git

# Change the directory
cd mm-cli

# Function to read user inputs
get_inputs() {
    echo -e "\nWelcome to the Mattermost CLI tool setup!"
    echo -e "\x1B[1mNote: Your password will be stored in a .env file.\x1B[0m"

    echo -e "\n\x1B[33mWhat is your Mattermost username?\x1B[0m"
    read username

    echo -e "\n\x1B[33mWhat is your Mattermost host? (e.g. https://todo.example.com)\x1B[0m"
    read host

    echo -e "\n\x1B[33mWhat is your password?\x1B[0m"
    read -s password  # -s option hides password input

    # Create or overwrite the .env file
    echo "MM_LOGIN_ID=$username" > .env
    echo "MM_PASSWORD=$password" >> .env
    echo "MM_HOST=$host" >> .env

    # Ask if the file is correct and show the content
    echo -e "\nPlease review the following details: \n"
    cat .env
    echo -e "\n\n\x1B[32mIs this correct? (Y/n)\x1B[0m"
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
    echo -e "\n\x1B[33mInstalling dependencies...\x1B[0m"
    npm install
    npm install -g .
    echo -e "\n\x1B[32mInstallation complete!\x1B[0m"
    echo -e "\nRun 'mmv' to see your tasks."
}

# Start the input loop
get_inputs
