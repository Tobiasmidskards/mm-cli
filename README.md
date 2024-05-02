# Mattermost CLI Tool

This Mattermost CLI Tool is designed to interact with the Mattermost API, allowing users to perform operations like retrieving team boards, cards, and more directly from the command line.

# Quick Start

```bash
curl -o setup.sh https://raw.githubusercontent.com/tobiasmidskards/mm-cli/master/setup.sh \
    && chmod +x setup.sh \
    && ./setup.sh \
    && rm setup.sh
```

## Features

- Login to Mattermost
- Retrieve and display boards and cards assigned to you
- Display formatted results in the terminal

## Prerequisites

- Node.js (Version 12 or higher recommended)
- npm (Node Package Manager)

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/tobiasmidskards/mm-cli.git
cd mm-cli
```

Copy the `env.example` file to `.env` and fill in the required values:

```bash
cp env.example .env
```

Install the dependencies:

```bash
npm install
```

Install the CLI tool:

```bash
npm install -g .
```

## Usage

Run the CLI tool:

```bash
mmv
```

### Result

```bash
$ mmv

Wokshop Website
1: Cookieinformation after launching site | ● 8.3.2024

Toyota Website 
1: Change google map API to openstreetmap | ● 28.2.2024

Ikea CRM
1: CRM: Generate Bruttoliste | ● 31.8.2023
2: CRM: Final adjustments on columns  | ● 31.1.2024
3: CRM: Include last name in ActiveCampaign | ● 20.2.2024
4: CRM: Matches: Sort out relations between company and contact person | ● 27.2.2024