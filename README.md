# n8n-nodes-viber-bot

This is an n8n community node that allows you to seamlessly integrate the **Viber Bot REST API** with your workflows. It provides native support for messaging, broadcasting, registration of webhooks, and retrieval of account and subscriber details.

---

## Features

### 1. Message Management
*   **Send Message:** Dispatch individual messages to subscribed Viber users.
*   **Broadcast Message:** Send the same message to up to 300 subscriber IDs simultaneously in a single request.
*   **Message Types Supported:**
    *   **Text:** Simple text messages up to 7,000 characters.
    *   **Picture:** High-quality image URL (HTTPS only), optional text caption, and custom thumbnail override.
    *   **Video:** Video URL (HTTPS), file size in bytes, and optional duration constraint.
    *   **File:** Any document or media file URL (HTTPS), file size in bytes, and explicit file name.
    *   **Location:** Geographical coordinates (latitude and longitude).
    *   **Contact:** Direct contact details (name and phone number).
    *   **Sticker:** Native Viber sticker ID.
    *   **URL:** Clickable link URL.
*   **Advanced Message Parameters:** Include custom tracking data (`trackingData`) and display profile overrides (`senderName` and `senderAvatar`).

### 2. Webhook Settings
*   **Set Webhook:** Register an HTTPS callback URL to receive real-time Viber events.
*   **Granular Events:** Subscribe to any combination of `conversation_started`, `delivered`, `seen`, `failed`, `subscribed`, and `unsubscribed`.
*   **Privacy Parameters:** Toggle whether the sender's name (`sendName`) and photo (`sendPhoto`) are delivered in callback payloads.

### 3. Account Profile
*   **Get Account Info:** Instantly fetch details of your Viber Bot account, including subscriber count, active webhook status, and bot name/uri.

### 4. Subscriber Management
*   **Get User Details:** Retrieve private profile metadata for a specific user (name, primary device OS, device type, language, and country code).

---

## Directory Layout

```text
n8n-nodes-viber-bot/
├── credentials/
│   ├── ViberBotApi.credentials.ts        # Viber API Authentication definition
│   └── viber.svg                         # Polished logo for credentials modal
├── nodes/
│   └── ViberBot/
│       ├── ViberBot.node.ts              # Custom Node definition & parameter mapping
│       └── viber.svg                     # Polished logo for n8n workspace canvas
├── tests/
│   ├── mocks/
│   │   └── mockExecuteFunctions.ts       # n8n runtime execution mock helper
│   └── ViberBot.node.test.ts             # Extensive Jest unit tests
├── package.json                          # Package scripts & n8n entry configurations
├── tsconfig.json                         # TypeScript compilation settings
├── eslint.config.mjs                     # ESLint configuration file
├── jest.config.js                        # Jest environment configurations
└── README.md                             # Documentation index
```

---

## Local Installation (For Testing)

To load and test this node in a local n8n instance before releasing it:

1.  **Build the Package:**
    Compile the TypeScript source files and copy visual assets to the `dist/` build directory:
    ```bash
    npm run build
    ```

2.  **Link Your Local Package:**
    Create a global symlink for your workspace folder:
    ```bash
    npm link
    ```

3.  **Link into Your n8n Folder:**
    Navigate to your local n8n configurations directory (typically `~/.n8n/`) and link the package:
    ```bash
    cd ~/.n8n
    npm link n8n-nodes-viber-bot
    ```

4.  **Restart n8n:**
    Launch your local n8n process. The workspace canvas will load the custom "Viber Bot" node automatically.

---

## Credentials Configuration

1.  Create a **Viber Bot** account through the [Viber Admin Panel](https://partners.viber.com/).
2.  Retrieve your unique **App Key (Auth Token)**.
3.  In n8n, add a new **Viber Bot API** credential and paste your App Key into the **Auth Token** field.
4.  Click **Test connection** to verify the credential validity (calls Viber's account endpoint in the background).

---

## Operations Guide

### **Resource: Message**

#### **Operation: Send**
*   **Receiver:** The unique Viber subscriber ID (string, required).
*   **Message Type:** Select between `Contact`, `File`, `Location`, `Picture`, `Sticker`, `Text`, `URL`, and `Video`.
*   **Additional Fields:**
    *   *Sender Name:* Custom profile name shown in chat (max 28 characters).
    *   *Sender Avatar:* Custom profile photo URL (must be HTTPS, JPEG/PNG).
    *   *Tracking Data:* Custom metadata returned inside user callback reactions (max 4,096 characters).

#### **Operation: Broadcast**
*   **Broadcast List:** A comma-separated list of user IDs or a raw JSON array of user ID strings (e.g., `["user1", "user2"]`). Maximum of 300 IDs per request.

---

### **Resource: Webhook**

#### **Operation: Set**
*   **URL:** The webhook endpoint to receive notifications (must be HTTPS, required).
*   **Event Types:** Select which events trigger callbacks. Defaults to all standard viber events.

---

### **Resource: Account**

#### **Operation: Get**
*   Fetches public information about the bot account. No parameters are required.

---

### **Resource: User**

#### **Operation: Get**
*   **User ID:** The unique Viber subscriber ID to fetch metadata for (string, required).

---

## Development & Maintenance Scripts

Inside your workspace root, you can invoke the following CLI commands:

*   **Build Compilation:**
    ```bash
    npm run build
    ```
*   **TypeScript Watcher:**
    ```bash
    npm run build:watch
    ```
*   **Style & Best Practices Linter:**
    ```bash
    npm run lint
    ```
*   **Code Formatter (Lint Fix):**
    ```bash
    npm run lint:fix
    ```
*   **Execute Test Suite:**
    ```bash
    npm run test
    ```

---

## License

This project is licensed under the [MIT License](LICENSE).
