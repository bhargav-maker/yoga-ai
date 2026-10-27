# YogaIntelliJ

YogaIntelliJ is an AI-powered yoga trainer that uses computer vision and machine learning to detect yoga poses in real time through a webcam. It analyzes the user’s posture, compares it with the selected pose, and provides real-time feedback using a skeleton overlay and pose timing metrics.

This project combines:
- A React frontend for the user interface and webcam experience
- TensorFlow.js and MoveNet for pose estimation
- A custom trained pose-classification model for identifying yoga poses

## Features

- Real-time pose detection using webcam
- Yoga pose classification
- Visual skeleton overlay on the video feed
- Pose timing and best performance tracking
- Multi-page app with onboarding and tutorial flow
- Browser-based AI inference using TensorFlow.js

## Tech Stack

Frontend:
- React
- React Router
- TensorFlow.js
- @tensorflow-models/pose-detection
- react-webcam

Model / Training:
- Python
- TensorFlow
- Keras
- pandas
- scikit-learn
- TensorFlow.js conversion tools

## Project Structure

```text
YogaIntelliJ-main/
├── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── corsconfig.json
├── classification model/
│   ├── data.py
│   ├── movenet.py
│   ├── preprocessing.py
│   ├── training.py
│   ├── train_data.csv
│   ├── test_data.csv
│   ├── model/
│   ├── csv_per_pose/
│   └── yoga_poses/
├── package-lock.json
└── README.md
```

## How It Works

1. The webcam captures the user’s pose in real time.
2. MoveNet detects keypoints from the body.
3. The detected landmarks are normalized and converted into a feature vector.
4. A trained TensorFlow model classifies the pose.
5. If the pose confidence exceeds the threshold, the app tracks the hold time and indicates a successful pose.

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3
- A webcam connected to the system

### 1) Clone the repository

```bash
git clone https://github.com/VarunRao18/YogaIntelliJ-main.git
cd YogaIntelliJ-main
```

### 2) Install and run the frontend

```bash
cd frontend
npm install
npm start
```

This will start the React app in development mode. Open the URL printed in the terminal (usually http://localhost:3000).

### 3) Model training pipeline

The classification model code is located in the `classification model/` folder.

```bash
cd "classification model"
pip install tensorflow tensorflowjs pandas scikit-learn
python training.py
```

This script:
- loads the training and test CSV files
- preprocesses the landmark data
- builds a pose-classification model
- evaluates accuracy
- converts the trained model into TensorFlow.js format

## App Pages

- Home: landing page and navigation
- Start / Yoga: webcam-based yoga training and timing
- Tutorials: usage guidance
- About: project information and developer details

## Example Yoga Poses

The current app supports pose categories such as:
- Tree
- Chair
- Cobra
- Warrior
- Dog
- Shoulderstand
- Triangle

## Notes

- The frontend depends on TensorFlow.js and browser-based AI inference.
- The classification model is stored in the project and used by the app.
- If deploying publicly, ensure the model files are hosted correctly and the frontend model URL is updated as needed.

## License

This project is currently shared as an open-source educational project. Please review the repository for any explicit licensing terms before commercial use.

## Contributing

Contributions, improvements, and new pose types are welcome. If you want to enhance the project, feel free to fork the repository and open a pull request.

## Project Goal

YogaIntelliJ is designed to demonstrate how AI and computer vision can be applied to fitness and wellness. It combines real-time body keypoint detection with machine learning to create an interactive yoga experience in the browser.