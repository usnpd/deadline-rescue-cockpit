package com.lifesaver.repository;

import com.lifesaver.entity.Task;
import com.lifesaver.entity.Task.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByDeadlineAsc(Long userId);
    List<Task> findByUserIdAndStatus(Long userId, TaskStatus status);
    List<Task> findByUserIdAndDeadlineBetween(Long userId, LocalDateTime start, LocalDateTime end);
    long countByUserIdAndStatus(Long userId, TaskStatus status);
}
