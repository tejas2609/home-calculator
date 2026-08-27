# Balance Calculator

A modern two-screen mobile application built with **React Native + Expo + TypeScript**, a **FastAPI backend**, and **Firebase Firestore**.

## Features

- Large, readable available balance
- Add and subtract transactions
- Description/note for every transaction
- Full chronological history
- Edit amount, description, or transaction type
- Editing an old transaction recalculates every subsequent balance
- Final balance always matches transaction history
- Light and dark themes based on the device appearance
- Large readable typography and high-contrast controls
- Material Community Icons
- Pull to refresh
- Loading, empty, and connection error states
- Firebase secrets remain on the Python backend

## Project structure

```text
balance-calculator-app/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── firebase.py
│       ├── models/transaction.py
│       ├── routes/
│       │   ├── transactions.py
│       │   └── balance.py
│       └── services/balance_service.py
└── mobile/
    ├── .env.example
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── src/
        ├── api/client.ts
        ├── components/
        ├── navigation/
        ├── screens/
        ├── theme/
        ├── types/
        └── utils/
```

# 1. Firebase setup

## Create a Firebase project

1. Go to the Firebase console.
2. Create a new project.
3. Open **Build → Firestore Database**.
4. Create a Firestore database.
5. For initial development, choose a test/development mode that allows your backend to write. Since this app uses the Firebase Admin SDK from the backend, client Firestore credentials are not used by the mobile app.

## Create a service account key

In Firebase / Google Cloud:

1. Open **Project settings → Service accounts**.
2. Choose **Generate new private key**.
3. Save the downloaded JSON file as:

```text
backend/serviceAccountKey.json
```

Never commit this file to Git.

## Configure the backend

Inside `backend`:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env`:

```env
FIREBASE_PROJECT_ID=your-actual-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccountKey.json
ALLOWED_ORIGINS=*
```

You only need to replace:

- `your-actual-firebase-project-id`
- Add the actual `serviceAccountKey.json` file

The backend uses the Firebase Admin SDK, so **do not put the service-account JSON or private Firebase credentials inside the React Native app**.

# 2. Run the backend

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
py -m venv .venv
.venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Check:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

# 3. Configure and run the mobile app

Open another terminal:

```bash
cd mobile
npm install
```

Create the environment file:

### Windows

```bash
copy .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Edit:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IPV4:8000
```

## Important: physical phone

If you run Expo Go on a physical phone, **do not use `localhost`**.

Find your computer IPv4 address.

On Windows:

```bash
ipconfig
```

Find something similar to:

```text
IPv4 Address . . . : 192.168.1.17
```

Then configure:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.17:8000
```

Your phone and computer must be on the same Wi-Fi network.

Start Expo:

```bash
npx expo start
```

For LAN mode:

```bash
npx expo start --lan
```

Open the project with Expo Go or an emulator.

# API endpoints

## Get current balance

```text
GET /balance
```

## Get history

```text
GET /transactions
```

## Add transaction

```text
POST /transactions
```

Body:

```json
{
  "type": "add",
  "amount": 5000,
  "description": "Salary"
}
```

## Subtract transaction

```json
{
  "type": "subtract",
  "amount": 500,
  "description": "Groceries"
}
```

## Edit transaction

```text
PUT /transactions/{transaction_id}
```

Example:

```json
{
  "type": "subtract",
  "amount": 700,
  "description": "Dinner"
}
```

The backend then reloads the complete transaction sequence, calculates each balance from the beginning, updates `balanceAfter` on every transaction, and updates `balances/main.currentBalance`.

## Firestore structure

```text
balances
└── main
    ├── currentBalance
    └── updatedAt

transactions
├── {transactionId}
│   ├── type
│   ├── amount
│   ├── description
│   ├── createdAt
│   ├── updatedAt
│   └── balanceAfter
└── ...
```

## Notes

- Transactions are ordered deterministically by `createdAt`, then document ID.
- The transaction history is the source of truth.
- The backend owns the recalculation logic.
- The frontend only communicates with FastAPI.
- Expo environment variables prefixed with `EXPO_PUBLIC_` are visible in the client bundle, so only the backend URL belongs there.
