package com.crud.serviceimpl;

import com.crud.entity.User;
import com.crud.entity.UserProfile;
import com.crud.repository.UserProfileRepository;
import com.crud.repository.UserRepository;
import com.crud.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserProfileServiceImpl(UserProfileRepository userProfileRepository,
                                  UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UserProfile createUserProfile(UserProfile userProfile) {
        // If you want to protect against saving profiles with preset IDs, you can clear id:
        // userProfile.setId(null);
        return userProfileRepository.save(userProfile);
    }

    @Override
    public Optional<UserProfile> getUserProfileById(Long id) {
        return userProfileRepository.findById(id);
    }

    @Override
    public List<UserProfile> getAllUserProfiles() {
        return userProfileRepository.findAll();
    }

    @Override
    public UserProfile updateUserProfile(Long id, UserProfile updatedProfile) {
        UserProfile existingProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User profile not found with ID: " + id));

        // Update only the allowed fields (email & password intentionally omitted)
        existingProfile.setName(updatedProfile.getName());
        existingProfile.setPhone(updatedProfile.getPhone());
        existingProfile.setDob(updatedProfile.getDob());
        existingProfile.setGender(updatedProfile.getGender());
        existingProfile.setCorrespondenceAddress(updatedProfile.getCorrespondenceAddress());
        existingProfile.setPermanentAddress(updatedProfile.getPermanentAddress());
        existingProfile.setMaritalStatus(updatedProfile.getMaritalStatus());
        existingProfile.setOccupation(updatedProfile.getOccupation());
        existingProfile.setBloodGroup(updatedProfile.getBloodGroup());
        existingProfile.setEmergencyContact(updatedProfile.getEmergencyContact());
        existingProfile.setAadhaarNumber(updatedProfile.getAadhaarNumber());

        // If you want to allow changing the linked user, uncomment and validate:
        // if (updatedProfile.getUser() != null) { existingProfile.setUser(updatedProfile.getUser()); }

        return userProfileRepository.save(existingProfile);
    }

    @Override
    public void deleteUserProfile(Long id) {
        if (!userProfileRepository.existsById(id)) {
            throw new RuntimeException("User profile not found with ID: " + id);
        }
        userProfileRepository.deleteById(id);
    }

    @Override
    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user ID: " + userId));
    }

    /**
     * Creates a UserProfile and links it to an existing User (by userId).
     * Maintains bidirectional mapping by setting user.setUserProfile(profile) if your User entity has that field.
     */
    @Override
    @Transactional
    public UserProfile createProfileWithUserId(Long userId, UserProfile profile) {
        return userRepository.findById(userId).map(user -> {
            profile.setUser(user);

            // if User entity has setUserProfile method to keep bidirectional mapping:
            try {
                user.setUserProfile(profile);
            } catch (Exception ignored) {
                // ignore if User doesn't have that setter or you don't want to set it
            }

            return userProfileRepository.save(profile);
        }).orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }
}
