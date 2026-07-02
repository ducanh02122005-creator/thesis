package com.example.frauddetection.repository;

import com.example.frauddetection.entity.prediction.Alert;
import com.example.frauddetection.entity.prediction.AlertStatus;
import com.example.frauddetection.entity.transaction.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert,Long> {


    List<Alert> findByStatus(AlertStatus status);
}
