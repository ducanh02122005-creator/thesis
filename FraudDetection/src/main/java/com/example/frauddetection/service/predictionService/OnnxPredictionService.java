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

    private final OrtEnvironment env;
    private final OrtSession session;

    public OnnxPredictionService() throws Exception {

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

        System.out.println("ONNX model loaded.");
    }

    public float predict(
            long transHour,
            long category,
            float amtLog
    ) throws Exception {

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