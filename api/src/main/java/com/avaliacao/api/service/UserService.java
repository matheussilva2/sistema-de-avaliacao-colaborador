package com.avaliacao.api.service;

import com.avaliacao.api.dtos.LoginRecordDTO;
import com.avaliacao.api.dtos.UserPhotoRecordDTO;
import com.avaliacao.api.dtos.UserRecordDTO;
import com.avaliacao.api.dtos.UserUpdateRecordDTO;
import com.avaliacao.api.enums.UserRole;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
        passwordEncoder = new BCryptPasswordEncoder();
    }

    public UserModel create(UserRecordDTO userRecordDTO){
        var userWithSameEmail = userRepository.findByEmail(userRecordDTO.email());

        if(userWithSameEmail.isPresent()){
            throw new IllegalArgumentException("Email already registered.");
        }

        var user = new UserModel();

        String encryptedPassword = passwordEncoder.encode(userRecordDTO.passWord());
        BeanUtils.copyProperties(userRecordDTO,user);

        user.setPassWord(encryptedPassword);
        setManagerIfPresent(user, userRecordDTO.managerId());

        return userRepository.save(user);
    }

    public UserModel createForManager(UUID managerId, UserRecordDTO userRecordDTO){
        var userWithSameEmail = userRepository.findByEmail(userRecordDTO.email());

        if(userWithSameEmail.isPresent()){
            throw new IllegalArgumentException("Email already registered.");
        }

        var manager = getManagerOrThrow(managerId);
        var user = new UserModel();

        String encryptedPassword = passwordEncoder.encode(userRecordDTO.passWord());
        BeanUtils.copyProperties(userRecordDTO,user);

        user.setPassWord(encryptedPassword);
        user.setUserRole(UserRole.EMPLOYEE);
        user.setManager(manager);

        return userRepository.save(user);
    }

    public List<UserModel> findAll(){
        return userRepository.findAll();
    }

    public List<UserModel> findEmployeesByManager(UUID managerId){
        getManagerOrThrow(managerId);
        return userRepository.findByManager_IdAndUserRole(managerId, UserRole.EMPLOYEE);
    }

    public Optional<UserModel> findById(UUID id){
        return userRepository.findById(id);
    }

    public Optional<UserModel> login(LoginRecordDTO loginRecordDTO){
        var userO = userRepository.findByEmail(loginRecordDTO.email());

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();
        boolean passwordMatches = passwordEncoder.matches(
                loginRecordDTO.passWord(),
                user.getPassWord()
        );

        if(!passwordMatches){
            return Optional.empty();
        }

        return Optional.of(user);
    }

    public Optional<UserModel> update(UUID id, UserUpdateRecordDTO userRecordDTO){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();

        if(user.getUserRole() == UserRole.EMPLOYEE && !user.getEmail().equals(userRecordDTO.email())){
            throw new IllegalArgumentException("Employee email cannot be changed.");
        }

        var userWithSameEmail = userRepository.findByEmail(userRecordDTO.email());

        if(userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(id)){
            throw new IllegalArgumentException("Email already registered.");
        }

        String currentPassword = user.getPassWord();
        UserRole currentUserRole = user.getUserRole();

        BeanUtils.copyProperties(userRecordDTO,user);

        if(currentUserRole == UserRole.EMPLOYEE){
            user.setUserRole(UserRole.EMPLOYEE);
        }

        if(userRecordDTO.passWord() == null || userRecordDTO.passWord().isBlank()){
            user.setPassWord(currentPassword);
        } else {
            user.setPassWord(passwordEncoder.encode(userRecordDTO.passWord()));
        }

        setManagerIfPresent(user, userRecordDTO.managerId());

        return Optional.of(userRepository.save(user));
    }

    public Optional<UserModel> updatePhoto(UUID id, UserPhotoRecordDTO userPhotoRecordDTO){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();
        user.setProfilePhoto(userPhotoRecordDTO.profilePhoto());

        return Optional.of(userRepository.save(user));
    }

    public boolean delete(UUID id){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return false;
        }

        userRepository.delete(userO.get());
        return true;

    }

    @Transactional
    public Optional<Set<TrainingModel>> findTrainingsByUser(UUID id){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(userO.get().getTrainings());
    }

    private UserModel getManagerOrThrow(UUID managerId){
        var managerO = userRepository.findById(managerId);

        if(managerO.isEmpty() || managerO.get().getUserRole() != UserRole.MANAGER){
            throw new IllegalArgumentException("Manager not found.");
        }

        return managerO.get();
    }

    private void setManagerIfPresent(UserModel user, UUID managerId){
        if(managerId == null){
            return;
        }

        user.setManager(getManagerOrThrow(managerId));
    }
}
