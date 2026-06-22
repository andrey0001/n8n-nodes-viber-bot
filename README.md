# n8n-nodes-viber-bot

This is an n8n community node package that allows you to seamlessly integrate the **Viber Bot REST API** with your workflows. It provides native support for sending messages, broadcasting, automatic webhook lifecycle management, and subscriber profile lookups.

The package includes two core nodes:
1.  **Viber Bot (Action Node):** Send messages, broadcast to groups, fetch account details, and look up subscribers.
2.  **Viber Bot Trigger (Webhook Node):** Automatically registers a clean, standard, trailing-slash-free webhook endpoint with Viber to listen for incoming messages and events in real-time.

---

## Features

### 1. Webhook Lifecycle Management (Viber Bot Trigger)
*   **Zero-Configuration Setup:** Simply add the **Viber Bot Trigger** to your canvas. When you **Publish (Activate)** the workflow, n8n automatically registers your clean webhook endpoint with Viber's servers. When deactivated, it automatically unregisters.
*   **Clean Standard Endpoints:** Uses n8n's standard, trailing-slash-free UUID-only URL format, completely avoiding redundant trailing slashes and collisions:
    *   **Test URL:** `https://my-domain.com/webhook-test/<uuid>`
    *   **Production URL:** `https://my-domain.com/webhook/<uuid>`
*   **Automatic Handshake Verification:** Automatically intercepts and answers Viber's webhook handshake validation requests (`event: 'webhook'`) with a silent `200 OK` response so your n8n workflow only triggers on actual user interactions (messages, subscriptions, etc.).

### 2. Message Operations (Viber Bot)
*   **Send Message:** Deliver messages to subscribed users.
*   **Broadcast Message:** Send a single message to multiple subscribed users in one API call.
*   **Supported Message Types:**
    *   **Text:** Simple text strings (up to 7,000 characters).
    *   **Picture:** HTTPS image URLs with optional captions and thumbnail previews.
    *   **Video:** Video URLs with file sizes and playback durations.
    *   **File:** Any file URL with name and byte size details.
    *   **Location:** Geographical coordinates (latitude and longitude).
    *   **Contact:** Direct contact details (name and phone number).
    *   **Sticker:** Native Viber sticker ID.
    *   **URL:** Clickable direct link.
    *   **Rich Media:** Scrollable, interactive carousels of cards, images, and buttons.

### 3. Rich User Interactivity
*   **Interactive Viber Keyboards:** Attach custom, fully formatted grid button keyboards (JSON arrays/objects) to any outgoing message, giving users clickable choices in their chat window.
*   **Min API Version Constraints:** Automatically sets the minimum Viber API version constraints required to display advanced elements like custom Keyboards and Rich Media carousels.
*   **Sender Profiling:** Customize the profile name (`senderName`) and avatar image (`senderAvatar`) for outgoing messages dynamically on a per-node level.

### 4. Advanced Variable Robustness
Built specifically for power-user workflows:
*   **Native Array Support:** Input a native JavaScript Array of strings directly into the `Broadcast List` (e.g. `{{$json.viber_ids}}` from a Postgres or Airtable node), and the node will parse it seamlessly.
*   **Native Object Support:** Pass dynamic JSON objects directly from a Code node or HTTP Request node into the `Viber Keyboard (JSON)` and `Rich Media JSON` parameters. The node automatically handles objects directly, avoiding tedious stringification.

---

## Directory Layout

```text
n8n-nodes-viber-bot/
├── credentials/
│   ├── ViberBotApi.credentials.ts        # Viber API Authentication definition
│   └── viber.svg                         # Polished logo for credentials modal
├── nodes/
│   └── ViberBot/
│       ├── ViberBot.node.ts              # Upgraded Action Node (sending, broadcasting)
│       ├── ViberBotTrigger.node.ts       # Upgraded Trigger Node (automatic webhooks)
│       └── viber.svg                     # Polished logo for n8n workspace canvas
├── tests/
│   ├── mocks/
│   │   └── mockExecuteFunctions.ts       # n8n runtime execution mock helper
│   ├── ViberBot.node.test.ts             # Extensive Action Node tests (including robust objects)
│   └── ViberBotTrigger.node.test.ts      # Webhook Lifecycle trigger node tests
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
    Launch your local n8n process. The workspace canvas will load the custom "Viber Bot" and "Viber Bot Trigger" nodes automatically.

---

## Credentials Configuration

1.  Create a **Viber Bot** account through the [Viber Admin Panel](https://partners.viber.com/).
2.  Retrieve your unique **App Key (Auth Token)**.
3.  In n8n, add a new **Viber Bot API** credential and paste your App Key into the **Auth Token** field.
4.  Click **Test connection** to verify the credential validity (calls Viber's account endpoint in the background).

---

## Operations Guide

### **Node: Viber Bot Trigger**
This node acts as a webhook receiver. It does not require any manual endpoint path configurations.
*   **Event Types:** Optionally select which events trigger your workflow. Defaults to all events: `conversation_started`, `delivered`, `seen`, `failed`, `subscribed`, and `unsubscribed`.

---

### **Node: Viber Bot (Action)**

#### **Operation: Send**
*   **Receiver:** The unique Viber subscriber ID (string, required).
*   **Message Type:** Select between `Contact`, `File`, `Location`, `Picture`, `Rich Media`, `Sticker`, `Text`, `URL`, and `Video`.
*   **Additional Fields:**
    *   *Sender Name:* Custom profile name shown in chat (max 28 characters).
    *   *Sender Avatar:* Custom profile photo URL (must be HTTPS, JPEG/PNG).
    *   *Tracking Data:* Custom metadata returned inside user callback reactions (max 4,096 characters).
    *   *Viber Keyboard (JSON):* Custom grid buttons (JSON array/object or native object) to attach.

#### **Operation: Broadcast**
*   **Broadcast List:** A list of user IDs to receive the message. Can be a comma-separated string, a raw JSON array string, or a native JavaScript Array (e.g. `{{$json.ids_array}}`). Maximum of 300 IDs per request.

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
