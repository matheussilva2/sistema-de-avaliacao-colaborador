package com.avaliacao.api.service;

import com.avaliacao.api.dtos.LoginRecordDTO;
import com.avaliacao.api.dtos.UserPhotoRecordDTO;
import com.avaliacao.api.dtos.UserRecordDTO;
import com.avaliacao.api.dtos.UserUpdateRecordDTO;
import com.avaliacao.api.enums.UserRole;
import com.avaliacao.api.exceptions.FieldValidationException;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.models.UserModel;
import com.avaliacao.api.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
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
        validateUserFields(
                userRecordDTO.email(),
                userRecordDTO.cpf(),
                userRecordDTO.phone(),
                userRecordDTO.hireDate(),
                userRecordDTO.registrationDate(),
                userRecordDTO.passWord(),
                null,
                true);

        var user = new UserModel();

        String encryptedPassword = passwordEncoder.encode(userRecordDTO.passWord());
        BeanUtils.copyProperties(userRecordDTO,user);

        user.setPassWord(encryptedPassword);
        applyNormalizedUserFields(user, userRecordDTO.email(), userRecordDTO.cpf(), userRecordDTO.phone());
        setManagerIfPresent(user, userRecordDTO.managerId());

        return userRepository.save(user);
    }

    public UserModel createForManager(UUID managerId, UserRecordDTO userRecordDTO){
        validateUserFields(
                userRecordDTO.email(),
                userRecordDTO.cpf(),
                userRecordDTO.phone(),
                userRecordDTO.hireDate(),
                userRecordDTO.registrationDate(),
                userRecordDTO.passWord(),
                null,
                true);

        var manager = getManagerOrThrow(managerId);
        var user = new UserModel();

        String encryptedPassword = passwordEncoder.encode(userRecordDTO.passWord());
        BeanUtils.copyProperties(userRecordDTO,user);

        user.setPassWord(encryptedPassword);
        user.setUserRole(UserRole.EMPLOYEE);
        applyNormalizedUserFields(user, userRecordDTO.email(), userRecordDTO.cpf(), userRecordDTO.phone());
        user.setManager(manager);

        return userRepository.save(user);
    }

    public List<UserModel> findAll(){
        return userRepository.findAll();
    }

    public List<UserModel> findEmployeesByManager(UUID managerId){
        getManagerOrThrow(managerId);
        return userRepository.findByManager_IdAndUserRoleAndActiveTrue(managerId, UserRole.EMPLOYEE);
    }

    public Optional<UserModel> findById(UUID id){
        return userRepository.findById(id);
    }

    public Optional<UserModel> login(LoginRecordDTO loginRecordDTO){
        var userO = userRepository.findByEmailIgnoreCase(loginRecordDTO.email().trim());

        if(userO.isEmpty()){
            return Optional.empty();
        }

        var user = userO.get();

        if(!user.isActive()){
            return Optional.empty();
        }

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

        validateUserFields(
                userRecordDTO.email(),
                userRecordDTO.cpf(),
                userRecordDTO.phone(),
                userRecordDTO.hireDate(),
                userRecordDTO.registrationDate(),
                userRecordDTO.passWord(),
                id,
                false);

        String currentPassword = user.getPassWord();
        UserRole currentUserRole = user.getUserRole();

        BeanUtils.copyProperties(userRecordDTO,user);
        applyNormalizedUserFields(user, userRecordDTO.email(), userRecordDTO.cpf(), userRecordDTO.phone());

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

        var user = userO.get();
        user.setActive(false);
        userRepository.save(user);
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

    private void validateUserFields(
            String email,
            String cpf,
            String phone,
            LocalDate hireDate,
            LocalDate registrationDate,
            String password,
            UUID currentUserId,
            boolean requirePassword){

        var errors = new LinkedHashMap<String, String>();

        if(!isValidCpf(cpf)){
            errors.put("cpf", "CPF invalido");
        }

        if(!isValidPhone(phone)){
            errors.put("phone", "Telefone deve ter 10 ou 11 digitos");
        }

        validateDates(hireDate, registrationDate, errors);

        if(requirePassword || (password != null && !password.isBlank())){
            validatePassword(password, errors);
        }

        validateEmailAvailability(email, currentUserId, errors);

        if(!errors.isEmpty()){
            throw new FieldValidationException(errors);
        }
    }

    private void validateEmailAvailability(
            String email,
            UUID currentUserId,
            LinkedHashMap<String, String> errors){

        var normalizedEmail = email == null ? "" : email.trim();

        if(normalizedEmail.isBlank()){
            return;
        }

        var userWithSameEmail = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if(userWithSameEmail.isPresent() &&
                (currentUserId == null || !userWithSameEmail.get().getId().equals(currentUserId))){
            errors.put("email", "Ja existe uma conta cadastrada com esse email");
        }
    }

    private void validateDates(
            LocalDate hireDate,
            LocalDate registrationDate,
            LinkedHashMap<String, String> errors){
        if(hireDate == null || registrationDate == null){
            return;
        }

        var today = LocalDate.now();
        var thirtyYearsAgo = today.minusYears(30);

        if(hireDate.isBefore(registrationDate)){
            errors.put("hireDate", "Data de contratacao nao pode ser anterior a data de registro");
        }

        if(hireDate.isBefore(thirtyYearsAgo)){
            errors.put("hireDate", "Data de contratacao nao pode ser inferior a 30 anos");
        }

        if(hireDate.isAfter(today)){
            errors.put("hireDate", "Data de contratacao nao pode ser superior ao dia de hoje");
        }
    }

    private void validatePassword(String password, LinkedHashMap<String, String> errors){
        if(password == null ||
                password.length() < 8 ||
                !password.matches(".*[A-Z].*") ||
                !password.matches(".*[a-z].*") ||
                !password.matches(".*\\d.*")){
            errors.put("passWord", "Senha deve ter no minimo 8 caracteres, uma letra maiuscula, uma letra minuscula e um numero");
        }
    }

    private boolean isValidCpf(String cpf){
        var digits = cpf == null ? "" : cpf.replaceAll("\\D", "");

        if(digits.length() != 11 || digits.matches("(\\d)\\1{10}")){
            return false;
        }

        int firstDigit = calculateCpfDigit(digits.substring(0,9), 10);
        int secondDigit = calculateCpfDigit(digits.substring(0,9) + firstDigit, 11);

        return firstDigit == Character.getNumericValue(digits.charAt(9)) &&
                secondDigit == Character.getNumericValue(digits.charAt(10));
    }

    private boolean isValidPhone(String phone){
        var digits = phone == null ? "" : phone.replaceAll("\\D", "");
        return digits.length() == 10 || digits.length() == 11;
    }

    private void applyNormalizedUserFields(UserModel user, String email, String cpf, String phone){
        user.setEmail(email.trim().toLowerCase());
        user.setCpf(cpf.replaceAll("\\D", ""));
        user.setPhone(phone.trim());
    }

    private int calculateCpfDigit(String digits, int weight){
        int sum = 0;

        for(int index = 0; index < digits.length(); index++){
            sum += Character.getNumericValue(digits.charAt(index)) * (weight - index);
        }

        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }
}
