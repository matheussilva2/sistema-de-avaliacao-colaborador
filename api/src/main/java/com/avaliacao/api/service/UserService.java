package com.avaliacao.api.service;

import com.avaliacao.api.dtos.LoginRecordDTO;
import com.avaliacao.api.dtos.UserRecordDTO;
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

        return userRepository.save(user);
    }

    public List<UserModel> findAll(){
        return userRepository.findAll();
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

    public Optional<UserModel> update(UUID id, UserRecordDTO userRecordDTO){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();

        var userWithSameEmail = userRepository.findByEmail(userRecordDTO.email());

        if(userWithSameEmail.isPresent() && !userWithSameEmail.get().getId().equals(id)){
            throw new IllegalArgumentException("Email already registered.");
        }

        String encryptedPassword = passwordEncoder.encode(userRecordDTO.passWord());

        BeanUtils.copyProperties(userRecordDTO,user);

        user.setPassWord(encryptedPassword);

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
}
