import cv2
import numpy as np

def preprocess_image(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    enhanced = cv2.equalizeHist(gray)
    return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
