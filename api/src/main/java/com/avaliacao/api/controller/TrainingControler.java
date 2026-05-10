package com.avaliacao.api.controller;


import com.avaliacao.api.dtos.TrainingRecordDTO;
import com.avaliacao.api.models.TrainingModel;
import com.avaliacao.api.repositories.TrainingRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TrainingControler {

    //para fazer a injeção da dependecia do repositório vamos usar essa notação de ponto de injeção
    // pode ser feito via contrutores também

    @Autowired
    TrainingRepository trainingRepository;

    // aqui podemos criar nossos métodos CRUD
    // POST: Recebe os atributos, faz uma validação inicial e insere na base de dados

    // para reber esses valores via Json é preciso Mapear os campos recebidos
    // usaremos os records para mapear esses objetos para a tranferência de dados
    //DTOS -> Data tranfer objects

    @PostMapping("/trainings")
    public ResponseEntity<TrainingModel> saveTrainig(@RequestBody @Valid TrainingRecordDTO trainingRecordDTO){
        var trainingModel = new TrainingModel();
        BeanUtils.copyProperties(trainingRecordDTO,trainingModel);
        return ResponseEntity.status(HttpStatus.CREATED).body(trainingRepository.save(trainingModel));
    }







}
