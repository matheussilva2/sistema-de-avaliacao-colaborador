package com.avaliacao.api.models;

import com.avaliacao.api.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "TB_USERS")

public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String name;
    private String lastName;
    @Column(unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passWord;
    private String phone;
    private String cpf;
    private LocalDate hireDate;
    private LocalDate registrationDate;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    private boolean active;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private UserModel manager;

    @JsonIgnore
    @OneToMany(mappedBy = "manager")
    private Set<UserModel> employees = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "manager")
    private Set<TrainingModel> managedTrainings = new HashSet<>();

    @JsonIgnore
    @ManyToMany(mappedBy = "users")
    private Set<TrainingModel> trainings = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getPassWord() {
        return passWord;
    }

    public void setPassWord(String passWord) {
        this.passWord = passWord;
    }

    public Set<TrainingModel> getTrainings() {
        return trainings;
    }

    public void setTrainings(Set<TrainingModel> trainings) {
        this.trainings = trainings;
    }

    public UserModel getManager() {
        return manager;
    }

    public void setManager(UserModel manager) {
        this.manager = manager;
    }

    public Set<UserModel> getEmployees() {
        return employees;
    }

    public void setEmployees(Set<UserModel> employees) {
        this.employees = employees;
    }

    public Set<TrainingModel> getManagedTrainings() {
        return managedTrainings;
    }

    public void setManagedTrainings(Set<TrainingModel> managedTrainings) {
        this.managedTrainings = managedTrainings;
    }
}
