package com.avaliacao.api.service;

import com.avaliacao.api.dtos.FormAnswerRecordDTO;
import com.avaliacao.api.models.FormAnswerModel;
import com.avaliacao.api.models.QuestionAnswerModel;
import com.avaliacao.api.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FormAnswerService {

    private final FormAnswerRepository formAnswerRepository;
    private final FormRepository formRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final AlternativeRepository alternativeRepository;

    public FormAnswerService(FormAnswerRepository formAnswerRepository,
                             FormRepository formRepository,
                             UserRepository userRepository,
                             QuestionRepository questionRepository,
                             AlternativeRepository alternativeRepository){
        this.formAnswerRepository = formAnswerRepository;
        this.formRepository = formRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.alternativeRepository = alternativeRepository;
    }

    @Transactional
    public Optional<FormAnswerModel> create(UUID formId, UUID userId, FormAnswerRecordDTO formAnswerRecordDTO){
        var formO = formRepository.findById(formId);
        var userO = userRepository.findById(userId);

        if(formO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        var form = formO.get();
        var user = userO.get();
        var answer = new FormAnswerModel();

        answer.setForm(form);
        answer.setUser(user);
        answer.setAnsweredAt(LocalDateTime.now());

        int correctAnswers = 0;

        for(var questionAnswerRecordDTO : formAnswerRecordDTO.answers()){
            var questionO = questionRepository.findById(questionAnswerRecordDTO.questionId());
            var alternativeO = alternativeRepository.findById(questionAnswerRecordDTO.alternativeId());

            if(questionO.isEmpty() || alternativeO.isEmpty()){
                return Optional.empty();
            }

            var question = questionO.get();
            var alternative = alternativeO.get();

            if(!question.getForm().getIdForm().equals(formId) ||
                    !alternative.getQuestion().getIdQuestion().equals(question.getIdQuestion())){
                return Optional.empty();
            }

            var questionAnswer = new QuestionAnswerModel();
            questionAnswer.setFormAnswer(answer);
            questionAnswer.setQuestion(question);
            questionAnswer.setSelectedAlternative(alternative);
            questionAnswer.setCorrect(alternative.isCorrect());

            if(questionAnswer.isCorrect()){
                correctAnswers++;
            }

            answer.getQuestionAnswers().add(questionAnswer);
        }

        int totalQuestions = questionRepository.findByFormIdForm(formId).size();
        int scorePercentage = totalQuestions > 0
                ? Math.round((correctAnswers * 100.0f) / totalQuestions)
                : 0;

        answer.setCorrectAnswers(correctAnswers);
        answer.setTotalQuestions(totalQuestions);
        answer.setScorePercentage(scorePercentage);
        answer.setApproved(scorePercentage >= form.getMinCorrectPercentage());

        return Optional.of(formAnswerRepository.save(answer));
    }

    public List<FormAnswerModel> findAll(){
        return formAnswerRepository.findAll();
    }

    public Optional<FormAnswerModel> findById(UUID id){
        return formAnswerRepository.findById(id);
    }

    public Optional<List<FormAnswerModel>> findByForm(UUID formId){
        var formO = formRepository.findById(formId);

        if(formO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByFormIdForm(formId));
    }

    public Optional<List<FormAnswerModel>> findByUser(UUID userId){
        var userO = userRepository.findById(userId);

        if(userO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByUserId(userId));
    }

    public Optional<List<FormAnswerModel>> findByFormAndUser(UUID formId, UUID userId){
        var formO = formRepository.findById(formId);
        var userO = userRepository.findById(userId);

        if(formO.isEmpty() || userO.isEmpty()){
            return Optional.empty();
        }

        return Optional.of(formAnswerRepository.findByFormIdFormAndUserId(formId,userId));
    }

    public boolean delete(UUID id){
        var answerO = formAnswerRepository.findById(id);

        if(answerO.isEmpty()){
            return false;
        }

        formAnswerRepository.delete(answerO.get());
        return true;
    }
}
