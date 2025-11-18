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
