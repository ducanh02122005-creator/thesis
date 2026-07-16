package com.example.frauddetection.service.predictionService;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import jakarta.annotation.PreDestroy;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.FloatBuffer;
import java.nio.LongBuffer;
import java.util.Map;

@Service
public class OnnxPredictionService {

    private OrtEnvironment env;
    private OrtSession session;
    private boolean useHeuristicFallback = false;

    public OnnxPredictionService() {
        try {
            env = OrtEnvironment.getEnvironment();

            ClassPathResource resource =
                    new ClassPathResource(
                            "model/transformer_fraud_model.onnx"
                    );

            InputStream is = resource.getInputStream();

            byte[] modelBytes = is.readAllBytes();

            session = env.createSession(
                    modelBytes,
                    new OrtSession.SessionOptions()
            );

            System.out.println("ONNX model loaded successfully.");
        } catch (Throwable t) {
            System.err.println("WARNING: Failed to load ONNX native runtime libraries. Falling back to heuristic model.");
            System.err.println("Error details: " + t.getMessage());
            useHeuristicFallback = true;
            env = null;
            session = null;
        }
    }

    public float predict(
            long transHour,
            long category,
            float amtLog
    ) throws Exception {
        if (useHeuristicFallback || env == null || session == null) {
            // Heuristic model: high amount + category-based risk heuristics
            if (amtLog > 5.3) { // amount > ~$200
                return 0.75f;
            }
            if (category == 2 && amtLog > 4.5) { // shopping net + amount > ~$90
                return 0.65f;
            }
            return 0.05f;
        }

        try (OnnxTensor hourTensor = OnnxTensor.createTensor(
                env,
                LongBuffer.wrap(new long[]{transHour}),
                new long[]{1}
             );
             OnnxTensor categoryTensor = OnnxTensor.createTensor(
                env,
                LongBuffer.wrap(new long[]{category}),
                new long[]{1}
             );
             OnnxTensor amtTensor = OnnxTensor.createTensor(
                env,
                FloatBuffer.wrap(new float[]{amtLog}),
                new long[]{1}
             );
             OrtSession.Result result = session.run(Map.of(
                "trans_hour", hourTensor,
                "category", categoryTensor,
                "amt_log", amtTensor
             ))) {

            float[][] output = (float[][]) result.get(0).getValue();
            return output[0][0];
        }
    }

    @PreDestroy
    public void close() {
        try {
            if (session != null) {
                session.close();
            }
            if (env != null) {
                env.close();
            }
            System.out.println("ONNX resources closed.");
        } catch (Exception e) {
            System.err.println("Failed to close ONNX resources: " + e.getMessage());
        }
    }
}