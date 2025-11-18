# Portable Air Quality Monitoring System  
*A real-time IoT-based air pollution monitoring device with cloud storage and instant Telegram alerts.*


##  Overview
This project is a **portable IoT-based air quality monitoring system** built using an **ESP32 microcontroller** and multiple **gas sensors**.  
It measures pollutants such as:

- CO (Carbon Monoxide)  
- CO₂ (Carbon Dioxide)  
- LPG  
- Smoke  

The system collects real-time air data and sends it to a **Node.js + PostgreSQL backend** every minute.  
Hazardous readings automatically trigger **instant Telegram alerts** for user safety.

This project demonstrates skills in **IoT, embedded systems, cloud databases, real-time communication, and backend development**.

---

##  Features
-  **Real-time sensor data collection** using ESP32  
-  **Node.js + PostgreSQL backend**  
-  **Telegram Bot alerts for dangerous levels**  
-  **Historical data storage**  
-  **Environment variable support (.env)**  
-  **REST API for data ingestion**  
-  **Portable low-power hardware design**

---

##  Tech Stack

### **Hardware**
- ESP32 Development Board  
- MQ-series Gas Sensors (MQ-2 / MQ-135 / MQ-7 etc.)  
- Power bank / USB power  
- Optional: OLED display

### **Software**
- Node.js  
- Express.js  
- PostgreSQL  
- Telegram Bot API  
- dotenv  
- REST API (JSON data)

--
## 📁 Project Structure

<img width="214" height="264" alt="image" src="https://github.com/user-attachments/assets/de99a52d-1486-4a6c-a8b3-ea772394433f" />

---

## 🔧 How It Works

1. ESP32 reads gas values from MQ sensors.  
2. Raw analog values are converted into ppm using calibration formulas.  
3. Every 60 seconds, ESP32 sends the data to the backend as JSON:

<img width="227" height="141" alt="image" src="https://github.com/user-attachments/assets/24d0c7f4-3455-42c9-bc61-b4bafccbde47" />

4. The backend stores data in PostgreSQL.  
5. If pollutant levels are beyond the threshold, a **Telegram alert** is sent to the user.  

---

## 📲 Example Telegram Alert

<img width="1175" height="823" alt="image" src="https://github.com/user-attachments/assets/cd961922-0844-4651-bda2-ace125e52bb3" />

---

## 🧪 Installation & Setup

### 1️⃣ Clone the project
```bash
git clone https://github.com/<your-github-username>/<repo-name>.git
cd <repo-name>

