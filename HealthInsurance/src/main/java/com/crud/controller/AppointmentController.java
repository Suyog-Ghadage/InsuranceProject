package com.crud.controller;

import com.crud.dto.AppointmentRequest;
import com.crud.entity.Appointment;
import com.crud.repository.AppointmentRepository;
import com.crud.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest request) {
        try {
            appointmentService.bookAppointment(request);
            return ResponseEntity.ok("Appointment booked successfully! Email sent to doctor.");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/update/{appointmentId}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long appointmentId,
                                               @RequestBody AppointmentRequest request) {
        return appointmentRepository.findById(appointmentId).map(appointment -> {
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setAge(request.getAge());
            appointment.setGender(request.getGender());
            appointment.setWeight(request.getWeight());
            appointment.setReason(request.getReason());
            appointmentRepository.save(appointment);
            return ResponseEntity.ok("Appointment updated successfully!");
        }).orElse(ResponseEntity.status(404).body("Appointment not found"));
    }

    @DeleteMapping("/delete/{appointmentId}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long appointmentId) {
        return appointmentRepository.findById(appointmentId).map(appointment -> {
            appointmentRepository.delete(appointment);
            return ResponseEntity.ok("Appointment deleted successfully!");
        }).orElse(ResponseEntity.status(404).body("Appointment not found"));
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Appointment> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsByDoctorId(doctorId);
    }

    @GetMapping("/user/{userProfileId}")
    public List<Appointment> getAppointmentsByUser(@PathVariable Long userProfileId) {
        return appointmentService.getAppointmentsByUserProfileId(userProfileId);
    }

    @GetMapping("/all")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }
}
