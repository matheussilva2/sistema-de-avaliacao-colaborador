package com.avaliacao.api.service;

import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.dtos.UserRecordDTO;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.repositories.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    public Optional<UserModel> update(UUID id, UserRecordDTO userRecordDTO){
        var userO = userRepository.findById(id);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();

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
}
