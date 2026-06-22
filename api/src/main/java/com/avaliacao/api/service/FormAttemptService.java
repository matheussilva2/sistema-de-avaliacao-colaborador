package com.avaliacao.api.service;

import com.avaliacao.api.dtos.AttemptAlternativeResponseDTO;
import com.avaliacao.api.dtos.AttemptQuestionResponseDTO;
import com.avaliacao.api.dtos.FormAttemptResponseDTO;
import com.avaliacao.api.exceptions.FieldValidationException;
import com.avaliacao.api.models.*;
import com.avaliacao.api.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class FormAttemptService {

    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DISPLAY_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final FormAttemptRepository formAttemptRepository;
    private final FormAnswerRepository formAnswerRepository;
    private final FormRepository formRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AlternativeRepository alternativeRepository;

    public FormAttemptService(FormAttemptRepository formAttemptRepository,
                              FormAnswerRepository formAnswerRepository,
                              FormRepository formRepository,
                              UserRepository userRepository,
                              QuestionRepository questionRepository,
                              AlternativeRepository alternativeRepository){
        this.formAttemptRepository = formAttemptRepository;
        this.formAnswerRepository = formAnswerRepository;
        this.formRepository = formRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.alternativeRepository = alternativeRepository;
    }

    @Transactional
    public Optional<FormAttemptResponseDTO> start(UUID formId, UUID userId){
        var attemptO = findOrCreateAttempt(formId,userId);

        if(attemptO.isEmpty()){
            return Optional.empty();
        }

        var includeCorrectAnswers = hasSubmittedAnswer(formId,userId);
        return Optional.of(toResponse(attemptO.get(),includeCorrectAnswers));
    }

    @Transactional
    public synchronized Optional<FormAttemptModel> findOrCreateAttempt(UUID formId, UUID userId){
        var existingAttempts = formAttemptRepository
                .findByFormIdFormAndUserIdOrderByStartedAtDesc(formId,userId);

        if(!existingAttempts.isEmpty()){
            return Optional.of(existingAttempts.get(0));
        }

        var formO = formRepository.findById(formId);
        var userO = userRepository.findById(userId);

        if(formO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        var form = formO.get();
        var user = userO.get();
        var userAnswers = formAnswerRepository.findByFormIdFormAndUserId(formId,userId);

        if(userAnswers.isEmpty()){
            validateFormAvailability(form);
        }

        var selectedQuestions = userAnswers.isEmpty()
                ? drawQuestions(form)
                : getQuestionsFromLatestAnswer(userAnswers,form);

        return Optional.of(createAttempt(form,user,selectedQuestions));
    }

    public boolean existsByForm(UUID formId){
        return formAttemptRepository.existsByFormIdForm(formId);
    }

    private FormAttemptModel createAttempt(
            FormModel form,
            UserModel user,
            List<QuestionModel> selectedQuestions){

        var attempt = new FormAttemptModel();
        attempt.setForm(form);
        attempt.setUser(user);
        attempt.setStartedAt(LocalDateTime.now());

        for(int questionIndex = 0; questionIndex < selectedQuestions.size(); questionIndex++){
            var question = selectedQuestions.get(questionIndex);
            var attemptQuestion = new FormAttemptQuestionModel();
            attemptQuestion.setAttempt(attempt);
            attemptQuestion.setQuestion(question);
            attemptQuestion.setDisplayOrder(questionIndex);

            var alternatives = new ArrayList<>(
                    alternativeRepository.findByQuestionIdQuestion(question.getIdQuestion())
            );

            if(alternatives.size() < 2){
                throwQuestionBankError(
                        "Todas as questoes sorteadas devem possuir ao menos duas alternativas");
            }

            Collections.shuffle(alternatives);

            for(int alternativeIndex = 0; alternativeIndex < alternatives.size(); alternativeIndex++){
                var attemptAlternative = new FormAttemptAlternativeModel();
                attemptAlternative.setAttemptQuestion(attemptQuestion);
                attemptAlternative.setAlternative(alternatives.get(alternativeIndex));
                attemptAlternative.setDisplayOrder(alternativeIndex);
                attemptQuestion.getAlternatives().add(attemptAlternative);
            }

            attempt.getQuestions().add(attemptQuestion);
        }

        return formAttemptRepository.save(attempt);
    }

    private List<QuestionModel> drawQuestions(FormModel form){
        var formQuestions = new ArrayList<>(
                questionRepository.findByFormIdForm(form.getIdForm())
        );
        int questionBankSize = formQuestions.size();
        int questionsToDraw = resolveQuestionsToDraw(form,questionBankSize);

        if(questionBankSize == 0){
            throwQuestionBankError("Formulario nao possui perguntas cadastradas");
        }

        if(questionsToDraw < 1){
            throwQuestionBankError("Quantidade de questoes sorteadas deve ser maior que 0");
        }

        if(questionsToDraw > questionBankSize){
            throwQuestionBankError(
                    "Quantidade de questoes sorteadas nao pode ser maior que o banco de questoes");
        }

        Collections.shuffle(formQuestions);
        return new ArrayList<>(formQuestions.subList(0,questionsToDraw));
    }

    private List<QuestionModel> getQuestionsFromLatestAnswer(
            List<FormAnswerModel> userAnswers,
            FormModel form){

        var latestAnswer = userAnswers.stream()
                .max(Comparator.comparing(FormAnswerModel::getAnsweredAt))
                .orElse(null);

        if(latestAnswer == null || latestAnswer.getQuestionAnswers().isEmpty()){
            return drawQuestions(form);
        }

        return latestAnswer.getQuestionAnswers().stream()
                .map(QuestionAnswerModel::getQuestion)
                .filter(question -> question.getForm().getIdForm().equals(form.getIdForm()))
                .toList();
    }

    private FormAttemptResponseDTO toResponse(
            FormAttemptModel attempt,
            boolean includeCorrectAnswers){

        var form = attempt.getForm();
        int questionBankSize = questionRepository.findByFormIdForm(form.getIdForm()).size();

        var questions = attempt.getQuestions().stream()
                .map(attemptQuestion -> new AttemptQuestionResponseDTO(
                        attemptQuestion.getQuestion().getIdQuestion(),
                        attemptQuestion.getQuestion().getTitle(),
                        attemptQuestion.getAlternatives().stream()
                                .map(attemptAlternative -> {
                                    var alternative = attemptAlternative.getAlternative();

                                    return new AttemptAlternativeResponseDTO(
                                            alternative.getIdAlternative(),
                                            alternative.getText(),
                                            includeCorrectAnswers ? alternative.isCorrect() : null
                                    );
                                })
                                .toList()
                ))
                .toList();

        return new FormAttemptResponseDTO(
                attempt.getIdAttempt(),
                form.getIdForm(),
                form.getTitle(),
                form.getFormType(),
                form.getInitDate(),
                form.getEndDate(),
                form.getInitTime(),
                form.getEndTime(),
                form.getMinCorrectPercentage(),
                resolveQuestionsToDraw(form,questionBankSize),
                questionBankSize,
                attempt.getStartedAt(),
                questions
        );
    }

    private boolean hasSubmittedAnswer(UUID formId, UUID userId){
        return !formAnswerRepository.findByFormIdFormAndUserId(formId,userId).isEmpty();
    }

    private int resolveQuestionsToDraw(FormModel form, int questionBankSize){
        return form.getQuestionsToDraw() > 0 ? form.getQuestionsToDraw() : questionBankSize;
    }

    private void throwQuestionBankError(String message){
        var errors = new LinkedHashMap<String, String>();
        errors.put("questionsToDraw", message);
        throw new FieldValidationException(errors);
    }

    private void validateFormAvailability(FormModel form){
        var initDate = parseDate(form.getInitDate());
        var endDate = parseDate(form.getEndDate());

        if(initDate == null || endDate == null){
            return;
        }

        var initTime = parseTimeOrDefault(form.getInitTime(), LocalTime.MIN);
        var endTime = parseTimeOrDefault(form.getEndTime(), LocalTime.of(23,59));
        var availabilityStart = LocalDateTime.of(initDate, initTime);
        var availabilityEnd = LocalDateTime.of(endDate, endTime).plusMinutes(1).minusNanos(1);
        var now = LocalDateTime.now();

        if(now.isBefore(availabilityStart)){
            throwAvailabilityError("Formulario ainda nao esta disponivel");
        }

        if(now.isAfter(availabilityEnd)){
            throwAvailabilityError("Prazo do formulario encerrado");
        }
    }

    private void throwAvailabilityError(String message){
        var errors = new LinkedHashMap<String, String>();
        errors.put("availability", message);
        throw new FieldValidationException(errors);
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
            return LocalDate.parse(trimmedValue, DISPLAY_DATE_FORMATTER);
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

    private LocalTime parseTimeOrDefault(String value, LocalTime defaultValue){
        if(value == null || value.isBlank()){
            return defaultValue;
        }

        try {
            return LocalTime.parse(value.trim(), DISPLAY_TIME_FORMATTER);
        } catch (DateTimeParseException ignored) {
        }

        return defaultValue;
    }
}
