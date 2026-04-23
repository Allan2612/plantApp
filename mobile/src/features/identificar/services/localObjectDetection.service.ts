import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import jpeg from "jpeg-js";

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  label: string;
  score: number;
  bbox: DetectionBox;
}

let model: cocoSsd.ObjectDetection | null = null;

async function getModel(): Promise<cocoSsd.ObjectDetection> {
  if (model) return model;

  await tf.ready();

  const backend = tf.getBackend();
  if (!backend) {
    await tf.setBackend("cpu");
  }

  model = await cocoSsd.load();
  return model;
}

const LocalObjectDetectionService = {
  async detectFromImageUri(uri: string, minScore = 0.35, limit = 5): Promise<DetectionResult[]> {
    const detector = await getModel();

    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    const imageData = jpeg.decode(new Uint8Array(buffer), { useTArray: true });

    if (!imageData?.data || !imageData.width || !imageData.height) {
      throw new Error("No se pudo decodificar la imagen");
    }

    const rgbaTensor = tf.tensor3d(
      imageData.data,
      [imageData.height, imageData.width, 4],
      "int32"
    );

    const rgbTensor = tf.slice(rgbaTensor, [0, 0, 0], [-1, -1, 3]);

    try {
      const predictions = await detector.detect(rgbTensor as unknown as tf.Tensor3D);

      return predictions
        .filter((item) => item.score >= minScore)
        .slice(0, limit)
        .map((item) => ({
          label: item.class,
          score: item.score,
          bbox: {
            x: item.bbox[0],
            y: item.bbox[1],
            width: item.bbox[2],
            height: item.bbox[3],
          },
        }));
    } finally {
      rgbTensor.dispose();
      rgbaTensor.dispose();
    }
  },
};

export default LocalObjectDetectionService;
