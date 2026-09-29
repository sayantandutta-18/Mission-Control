# 🛰️ Mission Control

### AI-Powered Satellite Constellation Monitoring & Mission Operations Platform

Mission Control is a full-stack web platform designed to provide a centralized interface for monitoring satellite constellations, tracking telemetry, detecting anomalies, visualizing satellite activity, and interacting with an AI-powered mission assistant.

The platform combines **real satellite orbital data from CelesTrak** with **simulated real-time telemetry**, providing an interactive mission-control-style experience for satellite monitoring and analysis.

---

## 🚀 Overview

Modern satellite operations involve monitoring large amounts of telemetry and orbital information across multiple systems.

**Mission Control** brings these capabilities into a single dashboard.

The platform allows users to:

- 🌍 Visualize satellites and their orbital information
- 🛰️ Monitor satellite health and telemetry
- 📡 Receive real-time telemetry updates
- 🚨 Detect and display satellite alerts
- 🤖 Interact with an AI mission assistant
- 📊 Analyze satellite telemetry and system status
- 🔄 Synchronize satellite orbital data from CelesTrak
- ⚡ Stream real-time updates using WebSockets

> **Note:** Telemetry values in the current version are simulated for demonstration purposes. Satellite/orbital information is synchronized from CelesTrak.

---

# ✨ Features

## 🌍 Satellite Visualization

- Interactive satellite monitoring dashboard
- Satellite list and individual satellite information
- Orbital data synchronization using CelesTrak
- Satellite status monitoring
- Real-time mission overview

## 📡 Real-Time Telemetry

Mission Control generates simulated telemetry for satellites and streams updates to connected clients.

Telemetry includes parameters such as:

- 🔋 Battery level
- 🌡️ Temperature
- 📶 Signal strength
- 🧭 Attitude
- Satellite status

Real-time updates are delivered through **Socket.IO**.

---

## 🚨 Alert & Anomaly Monitoring

The system monitors satellite telemetry and generates alerts when abnormal conditions are detected.

Alerts can contain:

- Alert type
- Severity
- Satellite information
- Alert message
- Timestamp

The dashboard provides a centralized **Alert Center** for monitoring mission events.

---

## 🤖 AI Mission Assistant

Mission Control includes an AI-powered chatbot using **Google Gemini**.

The assistant can be used to query mission information and help users understand satellite and telemetry data.

Example questions:

```text
What is the current status of the satellites?

Which satellites have critical alerts?

What does low battery telemetry indicate?

Show me the recent satellite anomalies.
