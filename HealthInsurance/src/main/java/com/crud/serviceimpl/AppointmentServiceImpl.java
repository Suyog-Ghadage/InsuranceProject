package com.crud.serviceimpl;

import com.crud.dto.AppointmentRequest;
import com.crud.entity.Appointment;
import com.crud.entity.Doctor;
import com.crud.entity.UserProfile;
import com.crud.repository.AppointmentRepository;
import com.crud.repository.DoctorRepository;
import com.crud.repository.UserProfileRepository;
import com.crud.service.AppointmentService;
import com.crud.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public Appointment bookAppointment(AppointmentRequest request) {

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        UserProfile userProfile = userProfileRepository.findById(request.getUserProfileId())
                .orElseThrow(() -> new RuntimeException("User Profile not found"));

        boolean exists = appointmentRepository.existsByDoctorAndAppointmentDate(
                doctor,
                request.getAppointmentDate()
        );

        if (exists) {
            throw new RuntimeException("This date is already booked for the doctor.");
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setUserProfile(userProfile);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStatus("Scheduled");
        appointment.setAge(request.getAge());
        appointment.setGender(request.getGender());
        appointment.setWeight(request.getWeight());
        appointment.setReason(request.getReason());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Fetch patient's email from linked User (UserProfile no longer has email)
        String patientEmail = "N/A";
        if (userProfile.getUser() != null && userProfile.getUser().getEmail() != null) {
            patientEmail = userProfile.getUser().getEmail();
        }

        //  Send email to doctor
        String subject = "New Appointment Booking Alert";
        String body = "Hello " + doctor.getDoctorName() + ",\n\n" +
                "A new appointment has been booked by the user:\n\n" +
                "Name: " + userProfile.getName() + "\n" +
                "Email: " + patientEmail + "\n" +
                "Phone: " + (userProfile.getPhone() != null ? userProfile.getPhone() : "N/A") + "\n" +
                "Appointment Date: " + request.getAppointmentDate() + "\n\n" +
                "Regards,\nClinic Management System";

        // only attempt to send if doctor's email is present
        if (doctor.getEmail() != null && !doctor.getEmail().trim().isEmpty()) {
            emailService.sendEmail(doctor.getEmail(), subject, body);
        } else {
            // optional: log warning that doctor has no email
        }

        return savedAppointment;
    }

    @Override
    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return appointmentRepository.findByDoctor(doctor);
    }

    @Override
    public List<Appointment> getAppointmentsByUserProfileId(Long userProfileId) {
        UserProfile userProfile = userProfileRepository.findById(userProfileId)
                .orElseThrow(() -> new RuntimeException("User Profile not found"));
        return appointmentRepository.findByUserProfile(userProfile);
    }

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
