<div align="center">

# 🏃 RunSpot

### *I ran out of new places to run. So I built this.*

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)

[![Stars](https://img.shields.io/github/stars/SnehaDeshmukh28/RunSpot?style=social)](https://github.com/SnehaDeshmukh28/RunSpot/stargazers)
[![Forks](https://img.shields.io/github/forks/SnehaDeshmukh28/RunSpot?style=social)](https://github.com/SnehaDeshmukh28/RunSpot/forks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## The Story

Mumbai at 5:30 AM is a different city — quiet, peaceful, almost unreal.

There were days I didn't step outside at all. No sunlight, no random conversations, no reason to leave the house. Just me and my laptop. And the worst part? It didn't even feel wrong anymore.

So I made a rule: **every Sunday = one run at a completely new place.**

Not near my house. Not the gym. Not the same boring route.

For 2–3 weeks it was amazing. Then I hit a problem — I ran out of places. Because beyond the "famous spots", you don't really know where to go in Mumbai.

So instead of overthinking it, I built something. A small app in 30 minutes. **That tiny thing changed everything.**

Now I wake up at 5 AM excited. I take routes I've never seen before. I explore a city I thought I already knew.

---

## What It Does

| Feature | Description |
|--------|-------------|
| 🤖 **AI Spot Finder** | Answers 4 quick questions about your vibe, distance & time — Gemini suggests the perfect spot |
| 🌤️ **Live Weather** | Uses real weekend weather via Open-Meteo so you're never caught off guard |
| 🚌 **Transit Directions** | Exact step-by-step public transport directions to get there |
| 📓 **Run Journal** | Logs every run — distance, rating, location, date |
| 📊 **Stats Tracker** | Tracks total KMs, average rating, and your personal best |

---

## Screenshots

<table>
  <tr>
    <td align="center"><b>Home</b></td>
    <td align="center"><b>Discover</b></td>
    <td align="center"><b>History</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/home.jpg" width="220"/></td>
    <td><img src="screenshots/discover.jpg" width="220"/></td>
    <td><img src="screenshots/history.jpg" width="220"/></td>
  </tr>
</table>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo) |
| Database | Supabase |
| AI Suggestions | Gemini 2.5 Flash |
| Maps & Directions | Google Maps + Directions API |
| Weather | Open-Meteo (free, no key needed) |

---

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/SnehaDeshmukh28/RunSpot.git
cd RunSpot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your API keys (see below)

# 4. Start the app
npx expo start

# 5. Scan the QR code with Expo Go on Android
```

### API Keys You Need

| Service | Where to get it |
|---------|----------------|
| Supabase URL + Anon Key | [supabase.com](https://supabase.com) |
| Google Maps API Key | [console.cloud.google.com](https://console.cloud.google.com) — enable Maps SDK, Places & Directions |
| Gemini API Key | [aistudio.google.com](https://aistudio.google.com) |

---

## Project Structure

```
RunSpot/
├── src/
│   └── screens/        # Home, Discover, History screens
├── assets/             # App icons and images
├── screenshots/        # README screenshots
├── App.js              # Entry point
├── .env.example        # Environment variable template
└── package.json
```

---

## Contributing

PRs are welcome! If you want to add a new running spot, fix a bug, or extend support to another city — go for it.

1. Fork the repo
2. Create your branch (`git checkout -b feature/add-delhi-spots`)
3. Commit your changes (`git commit -m 'Add Delhi running spots'`)
4. Push to the branch (`git push origin feature/add-delhi-spots`)
5. Open a Pull Request

---

## Support

If this made you want to go for a run — drop a ⭐ on the repo. It genuinely helps more people find it.

---

<div align="center">

Built with 🏃 and 5 AM energy by [Sneha Deshmukh](https://github.com/SnehaDeshmukh28) · Mumbai, India

</div>
