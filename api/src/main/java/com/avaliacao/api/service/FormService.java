package com.avaliacao.api.service;

import com.avaliacao.api.dtos.FormRecordDTO;
import com.avaliacao.api.exceptions.FieldValidationException;
import com.avaliacao.api.models.FormModel;
import com.avaliacao.api.repositories.FormRepository;
import com.avaliacao.api.repositories.TrainingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FormService {

    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final FormRepository formRepository;
    private final TrainingRepository trainingRepository;

    public FormService(FormRepository formRepository, TrainingRepository trainingRepository){
        this.formRepository = formRepository;
        this.trainingRepository = trainingRepository;
    }

    public Optional<FormModel> create(UUID trainingId, FormRecordDTO formRecordDTO){
        validateForm(formRecordDTO);

        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        var form = new FormModel();
        BeanUtils.copyProperties(formRecordDTO,form);
        applyNormalizedFields(form, formRecordDTO);
        form.setTraining(trainingO.get());

        return Optional.of(formRepository.save(form));
    }

    public List<FormModel> findAll(){
        return formRepository.findAll();
    }

    public Optional<FormModel> findById(UUID id){
        return formRepository.findById(id);
    }

    public Optional<List<FormModel>> findByTraining(UUID trainingId){
        var trainingO = trainingRepository.findById(trainingId);

        if(trainingO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formRepository.findByTrainingIdTraining(trainingId));
    }

    public Optional<FormModel> update(UUID id, FormRecordDTO formRecordDTO){
        var formO = formRepository.findById(id);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        var form = formO.get();
        validateForm(formRecordDTO);
        BeanUtils.copyProperties(formRecordDTO,form);
        applyNormalizedFields(form, formRecordDTO);

        return Optional.of(formRepository.save(form));
    }

    public boolean delete(UUID id){
        var formO = formRepository.findById(id);

        if(formO.isEmpty()){
            return false;
        }

        formRepository.delete(formO.get());
        return true;
    }

    private void validateForm(FormRecordDTO formRecordDTO){
        var errors = new LinkedHashMap<String, String>();
        var initDate = parseDate(formRecordDTO.initDate());
        var endDate = parseDate(formRecordDTO.endDate());

        if(initDate == null){
            errors.put("initDate", "Data de inicio invalida");
        }

        if(endDate == null){
            errors.put("endDate", "Data de termino invalida");
        }

        if(initDate != null && endDate != null && endDate.isBefore(initDate)){
            errors.put("endDate", "Data de termino deve ser posterior ou igual a data de inicio");
        }

        if(!errors.isEmpty()){
            throw new FieldValidationException(errors);
        }
    }

    private void applyNormalizedFields(FormModel form, FormRecordDTO formRecordDTO){
        form.setTitle(formRecordDTO.title().trim());
        form.setInitDate(normalizeDate(formRecordDTO.initDate()));
        form.setEndDate(normalizeDate(formRecordDTO.endDate()));
    }

    private String normalizeDate(String value){
        return parseDate(value).format(DISPLAY_DATE_FORMATTER);
    }

    private LocalDate parseDate(String value){
        if(value == null || value.isBlank()){
            return null;
        }

        var trimmedValue = value.trim();

        try {
            return LocalDate.parse(trimmedValue, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return LocalDate.parse(trimmedValue, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException ignored) {
        }

        if(trimmedValue.matches("\\d{2}/\\d{2}")){
            try {
                var parts = trimmedValue.split("/");
                return LocalDate.of(
                        LocalDate.now().getYear(),
                        Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[0]));
            } catch (DateTimeException | NumberFormatException ignored) {
            }
        }

        return null;
    }
}
