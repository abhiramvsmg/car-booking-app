<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=40&pause=1000&color=2ecc71&center=true&vCenter=true&width=800&lines=%F0%9F%9A%96+Cab+Booking+Platform;Seamless+Rides,+Anytime;Built+with+Next.js+%26+FastAPI" alt="Typing SVG" />

<br/>

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)]()

<br/>

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Oncoming%20Taxi.png" alt="Taxi" width="100" />
</div>

<br/>

A full-stack Cab Booking Platform built with modern web technologies, providing a seamless and reliable booking experience for riders alongside an efficient system for drivers and administrators.

<br/>

## 🌟 Features <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Star.png" alt="Star" width="25" height="25" />

- 🗺️ **Real-time Location Tracking:** Precise mapping and location services for pick-up and drop-off routing.
- ⚡ **Flawless Booking Flow:** Easy-to-use interface for requesting rides, estimating fares, and tracking driver status.
- 👥 **Driver & Rider Applications:** Tailored experiences for the two main types of users connecting on the platform.
- 📊 **Admin Dashboard:** Centralized management system for monitoring trips, resolving issues, and handling user data.
- 🐳 **Containerized Deployment:** Includes a comprehensive `docker-compose.yml` configuration for easy environment setup and deployment.

<br/>

## 🏗️ Architecture & Tech Stack <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Building%20Construction.png" alt="Building Construction" width="25" height="25" />

<table align="center" style="border: none; background-color: transparent;">
  <tr style="border: none; background-color: transparent;">
    <td align="center" style="border: none; background-color: transparent;">
      <h3>Frontend</h3>
      <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind" /><br><br>
      Next.js App Router <br> TypeScript
    </td>
    <td width="50" style="border: none; background-color: transparent;"></td>
    <td align="center" style="border: none; background-color: transparent;">
      <h3>Backend</h3>
      <img src="https://skillicons.dev/icons?i=python,fastapi,postgres,docker" /><br><br>
      FastAPI Framework <br> PostgreSQL
    </td>
  </tr>
</table>

<br/>

## 🚀 Installation & Setup <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="25" height="25" />

### Option 1: Docker Compose (Recommended) 🐳

1. Clone the repository and configure `.env` variables from `.env.example`.
2. Run the application suite:
```bash
docker-compose up --build -d
```
3. Access the frontend at `http://localhost:3000` and API at `http://localhost:8000`.

### Option 2: Manual Setup ⚙️

**Backend**
```bash
cd backend/
python -m venv venv
# Activate virtual env (Windows: venv\Scripts\activate, Unix: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend/
npm install
npm run dev
```

<br/>

## 📄 License <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Page%20Facing%20Up.png" alt="Page Facing Up" width="25" height="25" />

This project is officially authorized and licensed under the **[MIT License](./LICENSE)**. You are free to use, modify, and distribute this software as per the guidelines of the license.

---

<div align="center">
<p>Developed with ❤️ for seamless mobility</p>
<img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=100&section=footer" width="100%"/>
</div>
