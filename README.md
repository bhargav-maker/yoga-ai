# Yoga AI (Poddar Yogis) 🧘‍♂️✨

An AI-powered real-time yoga posture detector and trainer built with React, TensorFlow.js, and MoveNet. It tracks human body keypoints in real time through the user's webcam, evaluates posture alignment against targeted yoga asanas, provides visual skeleton feedback, and tracks holding duration and accuracy.

[![GitHub Repository](https://img.shields.io/badge/GitHub-bhargav--maker%2Fyoga--ai-blue?logo=github)](https://github.com/bhargav-maker/yoga-ai)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)](https://reactjs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-MoveNet-orange?logo=tensorflow)](https://www.tensorflow.org/js)

---

## 🌟 Key Features

- **⚡ Real-Time Pose Tracking**: High-speed, smooth 30–60 FPS pose landmark estimation using MoveNet Lightning.
- **🎯 Dynamic Skeleton Overlay**: Real-time canvas overlay rendering keypoint connections (joints, limbs, spine) synchronized to video aspect ratio.
- **📦 100% Offline AI Inference**: Neural network classification weights (`model.json` + binary shards) are bundled locally in the client application — eliminating reliance on external cloud storage.
- **⏱️ Hold-Time & Streak Counter**: Measures how long a user maintains correct alignment for each pose, with real-time feedback audio and best-time tracking.
- **🧘 Multi-Pose Support**: Accurately recognizes classic yoga asanas including:
  - 🌳 **Tree Pose**
  - 🪑 **Chair Pose**
  - 🐍 **Cobra Pose**
  - ⚔️ **Warrior Pose**
  - 🐕 **Downward Dog Pose**
  - 🤸 **Shoulderstand Pose**
  - 📐 **Triangle Pose**
- **💻 Cross-Platform & Lightweight**: Runs entirely inside modern desktop web browsers (Chrome, Edge, Firefox, Brave) without needing dedicated GPU hardware or cloud servers.

---

## 🏗️ Architecture & How It Works

```text
[Webcam Feed] ──> [MoveNet Lightning Model]
                        │
                        ▼ (17 Body Keypoints x,y)
          [Normalization & Feature Vector]
                        │
                        ▼
          [Custom Pose Classifier Model]
                        │
                        ▼
      [Pose Confidence & Classification]
                        │
                        ▼
   [Real-Time Visual Skeleton & Timing Tracker]
```

1. **Video Ingestion**: Captured at 640×480 (or native device resolution) via `react-webcam`.
2. **Keypoint Detection**: Google MoveNet model extracts 17 body coordinates (shoulders, elbows, wrists, hips, knees, ankles, etc.) per frame.
3. **Posture Normalization**: Distance and bounding-box normalization is performed to make detection invariant to camera distance.
4. **Classification**: The local TensorFlow.js neural network evaluates the landmark feature vector against trained pose classes.
5. **Interactive UI**: The UI draws high-confidence joints on an HTML5 `<canvas>` synced dynamically to the camera feed and triggers audible countdown cues.

---

## 📁 Project Directory Structure

```text
yoga-ai/
├── classification model/
│   ├── movenet.py                 # MoveNet feature extraction & keypoint landmarking
│   ├── data.py                    # Dataset loading & preprocessing utilities
│   ├── preprocessing.py           # Coordinate normalization and CSV landmark conversion
│   ├── training.py                # Keras neural network training pipeline & TF.js exporter
│   ├── train_data.csv             # Extracted landmark training dataset
│   ├── test_data.csv              # Extracted landmark evaluation dataset
│   ├── model/                     # Trained TensorFlow.js model artifacts
│   │   ├── model.json             # Model topology & weights manifest
│   │   └── group1-shard1of1.bin   # Trained weight binaries
│   └── yoga_poses/                # Raw dataset images categorized by pose
│
├── frontend/
│   └── Poddar-Yogis-frontend/
│       └── Poddar-Yogis-frontend/
│           ├── .env               # Port, fast refresh, and Windows watcher config
│           ├── public/
│           │   ├── index.html     # HTML entry point
│           │   └── model/         # Offline bundled neural network weights
│           │       ├── model.json
│           │       └── group1-shard1of1.bin
│           ├── src/
│           │   ├── Yoga.js        # Core camera, MoveNet tracking & skeleton canvas
│           │   ├── Home.js        # Landing page & navigation
│           │   ├── Instructions.js# How-to-use guide
│           │   ├── Tutorials.js   # Detailed pose visual tutorials
│           │   ├── About.js       # About project & developer details
│           │   └── utils/         # Pose metadata, images, and audio assets
│           └── package.json
│
├── .gitignore                     # Git ignore rules for node_modules, cache, & builds
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16.x, v18.x, or v20.x
- **npm**: v8.x or newer
- **Modern Web Browser**: Google Chrome (recommended), Microsoft Edge, or Firefox with webcam permissions enabled.
- *(Optional for Model Training)*: Python 3.8+ with TensorFlow, pandas, and scikit-learn.

---

### Installation & Running Frontend

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bhargav-maker/yoga-ai.git
   cd yoga-ai
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000). Allow browser camera permissions when prompted.

---

### (Optional) Retraining the Pose Classifier

To train the classification model on custom images or new yoga poses:

1. **Navigate to the model directory**:
   ```bash
   cd "classification model"
   ```

2. **Install Python requirements**:
   ```bash
   pip install tensorflow tensorflowjs pandas scikit-learn opencv-python
   ```

3. **Run the training script**:
   ```bash
   python training.py
   ```

4. **Copy the exported model**:
   Copy generated `model.json` and `.bin` files from `classification model/model/` into `frontend/Poddar-Yogis-frontend/Poddar-Yogis-frontend/public/model/`.

---

## 🛠️ Tech Stack

- **Frontend**: React, React Router, HTML5 Canvas, WebCam API
- **Computer Vision & AI**: TensorFlow.js, `@tensorflow-models/pose-detection`, MoveNet Lightning
- **Pose Classification**: Custom Deep Neural Network (DNN) trained with Keras/TensorFlow, converted to TF.js
- **Audio & Assets**: Web Audio API / HTML5 Audio cues for timing countdowns

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues](https://github.com/bhargav-maker/yoga-ai/issues) page.

---

## 📜 License

This project is open-source for educational and personal use.